create or replace function public.reserve_post_paid_demo(target_post_id uuid)
returns public.reservations
language plpgsql
security definer
set search_path = public
as $$
declare
  reservation_record public.reservations;
begin
  reservation_record := public.reserve_post_instant_demo(target_post_id);
  return reservation_record;
end;
$$;

revoke all on function public.reserve_post_paid_demo(uuid) from public;
grant execute on function public.reserve_post_paid_demo(uuid) to public;
grant execute on function public.reserve_post_paid_demo(uuid) to authenticated;
grant execute on function public.reserve_post_paid_demo(uuid) to anon;

notify pgrst, 'reload schema';
