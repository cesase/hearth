-- Hearth cloud schema (Supabase SQL Editor'de çalıştır)
-- Medya P2P kalır; bu tablolar kimlik + arkadaş + presence + çağrı meta içindir.

-- Profiller (auth.users ile 1-1)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text not null default '',
  about text not null default '',
  status text not null default 'online'
    check (status in ('online', 'idle', 'dnd', 'invisible')),
  status_text text not null default '',
  socials jsonb not null default '{}'::jsonb,
  avatar_url text,
  peer_id text,
  last_seen timestamptz default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists profiles_username_lower_idx
  on public.profiles (lower(username));

-- Arkadaşlık (accepted / pending)
create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  friend_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'accepted'
    check (status in ('pending', 'accepted', 'blocked')),
  created_at timestamptz not null default now(),
  unique (user_id, friend_id),
  check (user_id <> friend_id)
);

create index if not exists friendships_user_idx on public.friendships(user_id);
create index if not exists friendships_friend_idx on public.friendships(friend_id);

-- Grup odaları (üyelik listesi — medya yine P2P)
create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.group_members (
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

-- Çağrı olayları (cevapsız vb.) — ses depolanmaz
create table if not exists public.call_events (
  id uuid primary key default gen_random_uuid(),
  caller_id uuid not null references public.profiles(id) on delete cascade,
  callee_id uuid not null references public.profiles(id) on delete cascade,
  group_id uuid references public.groups(id) on delete set null,
  kind text not null default 'missed'
    check (kind in ('missed', 'cancelled', 'completed')),
  created_at timestamptz not null default now()
);

-- WebRTC signaling mesajları (kısa ömürlü; istersen realtime channel da kullanılır)
create table if not exists public.signals (
  id bigserial primary key,
  from_id uuid not null references public.profiles(id) on delete cascade,
  to_id uuid not null references public.profiles(id) on delete cascade,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists signals_to_idx on public.signals(to_id, created_at desc);

-- Yeni kullanıcıda profil satırı
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  uname text;
begin
  uname := coalesce(
    nullif(trim(new.raw_user_meta_data->>'username'), ''),
    split_part(new.email, '@', 1)
  );
  uname := lower(regexp_replace(uname, '[^a-z0-9._]', '', 'g'));
  if length(uname) < 3 then
    uname := 'user' || substr(replace(new.id::text, '-', ''), 1, 8);
  end if;
  -- çakışmada benzersizleştir
  while exists(select 1 from public.profiles p where p.username = uname) loop
    uname := uname || substr(md5(random()::text), 1, 3);
  end loop;

  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    uname,
    coalesce(nullif(trim(new.raw_user_meta_data->>'display_name'), ''), uname)
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.friendships enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.call_events enable row level security;
alter table public.signals enable row level security;

-- Profiller: herkes okuyabilir (arkadaş arama); kendi satırını günceller
create policy "profiles_select_all" on public.profiles
  for select using (true);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- Arkadaşlık: tarafı olan görür/ekler
create policy "friendships_select" on public.friendships
  for select using (auth.uid() = user_id or auth.uid() = friend_id);

create policy "friendships_insert" on public.friendships
  for insert with check (auth.uid() = user_id);

create policy "friendships_update" on public.friendships
  for update using (auth.uid() = user_id or auth.uid() = friend_id);

create policy "friendships_delete" on public.friendships
  for delete using (auth.uid() = user_id or auth.uid() = friend_id);

-- Gruplar
create policy "groups_select" on public.groups
  for select using (
    exists (
      select 1 from public.group_members gm
      where gm.group_id = id and gm.user_id = auth.uid()
    )
    or created_by = auth.uid()
  );

create policy "groups_insert" on public.groups
  for insert with check (auth.uid() = created_by);

create policy "group_members_select" on public.group_members
  for select using (
    exists (
      select 1 from public.group_members gm2
      where gm2.group_id = group_id and gm2.user_id = auth.uid()
    )
  );

create policy "group_members_insert" on public.group_members
  for insert with check (
    exists (
      select 1 from public.groups g
      where g.id = group_id and g.created_by = auth.uid()
    )
    or user_id = auth.uid()
  );

-- Çağrı olayları
create policy "call_events_select" on public.call_events
  for select using (auth.uid() = caller_id or auth.uid() = callee_id);

create policy "call_events_insert" on public.call_events
  for insert with check (auth.uid() = caller_id);

-- Sinyaller: alıcı okur, gönderen yazar; alıcı silebilir
create policy "signals_select" on public.signals
  for select using (auth.uid() = to_id);

create policy "signals_insert" on public.signals
  for insert with check (auth.uid() = from_id);

create policy "signals_delete" on public.signals
  for delete using (auth.uid() = to_id or auth.uid() = from_id);

-- Realtime (Supabase Dashboard > Replication'da da açılabilir)
-- alter publication supabase_realtime add table public.signals;
-- alter publication supabase_realtime add table public.profiles;
