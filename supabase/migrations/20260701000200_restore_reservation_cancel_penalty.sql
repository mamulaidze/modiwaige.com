create or replace function public.reservation_penalty_until(
  target_profile_id uuid default public.current_profile_id()
)
returns timestamptz
language sql
stable
security definer
set search_path = public
as $$
  select max(cancelled_at + interval '5 hours')
  from public.reservations
  where requester_id = target_profile_id
    and cancelled_by = requester_id
    and cancelled_at is not null
    and cancelled_at + interval '5 hours' > now();
$$;

grant execute on function public.reservation_penalty_until(uuid) to authenticated;
grant execute on function public.reservation_penalty_until(uuid) to anon;

notify pgrst, 'reload schema';
