-- Hearth 4.9.1 hotfix
-- Supabase Dashboard > SQL Editor içinde bir kez çalıştırın.

create or replace function public.is_username_available(candidate_username text)
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select candidate_username ~ '^[a-z0-9._]{3,20}$'
    and not exists (
      select 1
      from public.profiles p
      where lower(p.username) = lower(candidate_username)
    );
$$;

revoke all on function public.is_username_available(text) from public;
grant execute on function public.is_username_available(text) to anon, authenticated;

-- PostgREST'in yeni RPC'yi beklemeden görmesini sağla.
notify pgrst, 'reload schema';
