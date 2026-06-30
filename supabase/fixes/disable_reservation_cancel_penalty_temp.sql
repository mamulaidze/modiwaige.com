create or replace function public.reservation_penalty_until(
  target_profile_id uuid default public.current_profile_id()
)
returns timestamptz
language sql
stable
security definer
set search_path = public
as $$
  select null::timestamptz;
$$;

grant execute on function public.reservation_penalty_until(uuid) to authenticated;
grant execute on function public.reservation_penalty_until(uuid) to anon;

notify pgrst, 'reload schema';
