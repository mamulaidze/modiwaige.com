-- Production RLS/storage hardening.
-- This migration keeps existing app flows working while preventing profile role
-- escalation and requiring new post image uploads to live under the uploader's
-- auth.uid() folder.

-- RLS must be active on every public app table, including tables added by later
-- migrations. Re-applying these statements is safe and documents the intended
-- production posture.
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.post_images enable row level security;
alter table public.reservations enable row level security;
alter table public.notifications enable row level security;
alter table public.reports enable row level security;
alter table public.post_expiration_logs enable row level security;

-- Only admins may change profile roles. This closes the gap where the owner
-- profile update policy allowed a user to update their own row after the role
-- column was introduced.
create or replace function public.prevent_non_admin_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.role is distinct from new.role and not public.is_admin() then
    raise exception 'Only admins can change profile roles.';
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_prevent_non_admin_role_change on public.profiles;

create trigger profiles_prevent_non_admin_role_change
before update on public.profiles
for each row execute function public.prevent_non_admin_role_change();

comment on function public.prevent_non_admin_role_change()
is 'Prevents member self-escalation by rejecting profile role changes unless public.is_admin() is true.';

-- Store new uploads as <owner auth uid>/<post id>/<filename>. Existing legacy
-- objects stored as <post id>/<filename> remain readable/deletable when linked
-- through post_images so current production data is not stranded.
create or replace function public.is_owned_post_image_path(
  object_name text,
  expected_owner_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.posts
    where posts.owner_id = expected_owner_id
      and (
        -- New production-safe path format: <owner id>/<post id>/<file>.
        (
          split_part(object_name, '/', 1) = expected_owner_id::text
          and posts.id::text = split_part(object_name, '/', 2)
          and array_length(string_to_array(object_name, '/'), 1) >= 3
        )
        or
        -- Legacy format: <post id>/<file>. Kept only for existing files and
        -- delete/update compatibility; new client uploads now use owner folders.
        (
          posts.id::text = split_part(object_name, '/', 1)
          and array_length(string_to_array(object_name, '/'), 1) >= 2
        )
      )
  );
$$;

comment on function public.is_owned_post_image_path(text, uuid)
is 'Checks that a storage object path belongs to a post owned by the expected user; supports owner/post paths and legacy post paths.';

create or replace function public.is_new_owned_post_image_path(
  object_name text,
  expected_owner_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.posts
    where posts.owner_id = expected_owner_id
      and split_part(object_name, '/', 1) = expected_owner_id::text
      and posts.id::text = split_part(object_name, '/', 2)
      and array_length(string_to_array(object_name, '/'), 1) >= 3
  );
$$;

comment on function public.is_new_owned_post_image_path(text, uuid)
is 'Requires new storage uploads to use <auth uid>/<post id>/<file>, preventing users from writing into another user folder.';

-- Keep the private bucket aligned with frontend validation: JPEG/PNG/WebP only,
-- 8 MB max. Files are served by short-lived signed URLs, not public bucket read.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'post-images',
  'post-images',
  false,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Replace storage policies with stricter, documented versions. Policy names are
-- the existing names so repeated migrations do not leave permissive duplicates.
drop policy if exists "post images are readable for readable posts" on storage.objects;
drop policy if exists "owners upload post images" on storage.objects;
drop policy if exists "owners update post images" on storage.objects;
drop policy if exists "owners delete post images" on storage.objects;
drop policy if exists "admins delete storage objects" on storage.objects;

-- Users and guests may read only storage objects that are linked to a readable
-- post through post_images. The bucket itself remains private.
create policy "post images are readable for readable posts"
on storage.objects for select
to anon, authenticated
using (
  bucket_id = 'post-images'
  and exists (
    select 1
    from public.post_images
    join public.posts on posts.id = post_images.post_id
    where post_images.storage_path = storage.objects.name
      and posts.status in ('available', 'reserved', 'given')
  )
);

-- Authenticated users may upload only into their own folder and only below a
-- post they own: <auth.uid()>/<post.id>/<filename>.
create policy "owners upload post images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'post-images'
  and owner = auth.uid()
  and public.is_new_owned_post_image_path(storage.objects.name, auth.uid())
);

-- Owners may update objects only when both the old path and the replacement path
-- belong to their own post image namespace.
create policy "owners update post images"
on storage.objects for update
to authenticated
using (
  bucket_id = 'post-images'
  and public.is_owned_post_image_path(storage.objects.name, auth.uid())
)
with check (
  bucket_id = 'post-images'
  and owner = auth.uid()
  and public.is_new_owned_post_image_path(storage.objects.name, auth.uid())
);

-- Owners may delete objects linked to posts they own. This supports both the new
-- owner-folder path and the legacy post-folder path for cleanup.
create policy "owners delete post images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'post-images'
  and public.is_owned_post_image_path(storage.objects.name, auth.uid())
);

-- Admin storage deletion is allowed through the safe public.is_admin() role
-- check; anonymous users never match this policy.
create policy "admins delete storage objects"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'post-images'
  and public.is_admin()
);

-- Tighten post_images metadata inserts so new rows must point at the owner's
-- hardened storage path. Existing metadata remains readable/deletable via the
-- other owner policies that this migration intentionally leaves in place.
drop policy if exists "owners create images for their posts" on public.post_images;

create policy "owners create images for their posts"
on public.post_images for insert
to authenticated
with check (
  public.is_new_owned_post_image_path(storage_path, auth.uid())
  and exists (
    select 1
    from public.posts
    where posts.id = post_images.post_id
      and posts.owner_id = auth.uid()
      and posts.id::text = split_part(post_images.storage_path, '/', 2)
  )
);
