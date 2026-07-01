grant execute on function public.reserve_post(uuid) to public;
grant execute on function public.reserve_post(uuid) to anon;
grant execute on function public.reserve_post(uuid) to authenticated;

notify pgrst, 'reload schema';
