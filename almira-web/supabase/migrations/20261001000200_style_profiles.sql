begin;

alter table public.preferences
  add column profile_data jsonb not null default '{}'::jsonb
    check (jsonb_typeof(profile_data) = 'object' and octet_length(profile_data::text) <= 12000),
  add column revision bigint not null default 0 check (revision >= 0);

create table public.style_memories (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  memory_text text not null check (length(trim(memory_text)) between 1 and 240),
  scope text not null default 'All occasions' check (scope in ('All occasions','Everyday','College','Work','Coffee date','Party','Wedding','Travel')),
  source text not null default 'user-confirmed' check (source = 'user-confirmed'),
  created_at timestamptz not null default now()
);
create index style_memories_owner on public.style_memories(user_id, created_at);
alter table public.style_memories enable row level security;
create policy own_style_memories on public.style_memories for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
revoke all on public.style_memories from anon;
grant select, insert, update, delete on public.style_memories to authenticated;

-- One statement returns a consistent profile/memory snapshot, scoped by Auth.
create function public.get_style_profile() returns jsonb language sql stable security invoker
set search_path = '' as $$
  select coalesce((
    select jsonb_build_object(
      'profile', p.profile_data, 'revision', p.revision,
      'memories', coalesce((select jsonb_agg(jsonb_build_object(
        'id', m.id, 'text', m.memory_text, 'scope', m.scope, 'createdAt', m.created_at
      ) order by m.created_at, m.id) from public.style_memories m where m.user_id = p.user_id), '[]'::jsonb)
    ) from public.preferences p where p.user_id = (select auth.uid())
  ), jsonb_build_object('profile', '{}'::jsonb, 'memories', '[]'::jsonb, 'revision', 0));
$$;

-- A row lock and expected revision prevent cross-device lost updates.
-- This is security invoker: caller RLS applies to all reads and writes.
create function public.save_style_profile(expected_revision bigint, profile_payload jsonb, memory_payload jsonb)
returns bigint language plpgsql security invoker set search_path = '' as $$
declare
  caller uuid := auth.uid();
  current_revision bigint;
  entry jsonb;
begin
  if caller is null then raise exception 'Authentication required' using errcode = '28000'; end if;
  if expected_revision is null or expected_revision < 0
    or profile_payload is null or jsonb_typeof(profile_payload) <> 'object'
    or octet_length(profile_payload::text) > 12000
    or memory_payload is null or jsonb_typeof(memory_payload) <> 'array'
    or jsonb_array_length(memory_payload) > 20 or octet_length(memory_payload::text) > 12000 then
    raise exception 'Invalid profile' using errcode = '22023';
  end if;
  if coalesce(profile_payload ->> 'fashionPreference', '') not in ('','Womenswear','Menswear','Unisex','Mix of all','Prefer not to say') then
    raise exception 'Invalid fashion preference' using errcode = '22023';
  end if;
  if (select count(distinct value ->> 'id') from jsonb_array_elements(memory_payload)) <> jsonb_array_length(memory_payload) then
    raise exception 'Duplicate memories' using errcode = '22023';
  end if;
  for entry in select value from jsonb_array_elements(memory_payload) loop
    if jsonb_typeof(entry) <> 'object' or entry ->> 'id' is null
      or entry ->> 'id' !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      or coalesce(length(trim(entry ->> 'text')), 0) not between 1 and 240
      or coalesce(entry ->> 'scope', '') not in ('All occasions','Everyday','College','Work','Coffee date','Party','Wedding','Travel')
      or entry ->> 'createdAt' is null then
      raise exception 'Invalid remembered preference' using errcode = '22023';
    end if;
  end loop;

  insert into public.preferences(user_id) values (caller) on conflict (user_id) do nothing;
  select p.revision into current_revision from public.preferences p where p.user_id = caller for update;
  if current_revision <> expected_revision then
    raise exception 'Profile changed; load the latest version' using errcode = '40001';
  end if;
  update public.preferences set profile_data = profile_payload,
    style_notes = left(coalesce(profile_payload ->> 'fashionPerspective', ''), 500),
    region = left(coalesce(profile_payload ->> 'region', ''), 80),
    climate = left(coalesce(profile_payload ->> 'climate', ''), 80),
    revision = current_revision + 1 where user_id = caller;
  delete from public.style_memories where user_id = caller;
  insert into public.style_memories(id, user_id, memory_text, scope, created_at)
    select (value ->> 'id')::uuid, caller, trim(value ->> 'text'), value ->> 'scope', (value ->> 'createdAt')::timestamptz
      from jsonb_array_elements(memory_payload);
  return current_revision + 1;
end;
$$;

revoke all on function public.get_style_profile() from public, anon;
revoke all on function public.save_style_profile(bigint,jsonb,jsonb) from public, anon;
grant execute on function public.get_style_profile() to authenticated;
grant execute on function public.save_style_profile(bigint,jsonb,jsonb) to authenticated;

commit;
