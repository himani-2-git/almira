-- Apply to a new Supabase project. The browser remains local until sync is connected.
begin;

create table public.preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  style_notes text not null default '' check (length(style_notes) <= 500),
  region text not null default 'India + global',
  climate text not null default '',
  updated_at timestamptz not null default now()
);

create table public.garments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 120),
  category text not null check (category in ('Tops','Bottoms','Dresses','Outerwear','Shoes','Accessories')),
  color text not null default '' check (length(color) <= 80),
  occasion text not null default '' check (length(occasion) <= 120),
  season text not null default 'All year' check (length(season) <= 80),
  favorite boolean not null default false,
  purchase_price numeric(12,2) check (purchase_price >= 0),
  image_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (user_id, id),
  check (image_path is null or image_path like (user_id::text || '/%'))
);

create table public.outfits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 120),
  occasion text not null default 'Everyday',
  planned_for date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (user_id, id)
);

create table public.outfit_items (
  user_id uuid not null references auth.users(id) on delete cascade,
  outfit_id uuid not null,
  garment_id uuid not null,
  position smallint not null default 0 check (position >= 0),
  primary key (outfit_id, garment_id),
  foreign key (user_id, outfit_id) references public.outfits(user_id,id) on delete cascade,
  foreign key (user_id, garment_id) references public.garments(user_id,id) on delete no action deferrable initially deferred
);

create table public.wear_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  outfit_id uuid,
  worn_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, id),
  foreign key (user_id, outfit_id) references public.outfits(user_id,id) on delete no action deferrable initially deferred
);

create table public.wear_items (
  user_id uuid not null references auth.users(id) on delete cascade,
  wear_id uuid not null,
  garment_id uuid not null,
  primary key (wear_id, garment_id),
  foreign key (user_id, wear_id) references public.wear_events(user_id,id) on delete cascade,
  foreign key (user_id, garment_id) references public.garments(user_id,id) on delete no action deferrable initially deferred
);

create table public.suggestion_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  request_id uuid not null,
  useful boolean not null,
  note text not null default '' check (length(note) <= 500),
  created_at timestamptz not null default now()
);

create index garments_owner on public.garments(user_id, created_at desc);
create index outfits_owner on public.outfits(user_id, created_at desc);
create index outfit_items_owner on public.outfit_items(user_id);
create index wear_events_owner on public.wear_events(user_id, worn_at desc);
create index wear_items_owner on public.wear_items(user_id, garment_id);
create index feedback_owner on public.suggestion_feedback(user_id);

create function public.set_updated_at() returns trigger language plpgsql
set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger garment_updated before update on public.garments for each row execute function public.set_updated_at();
create trigger outfit_updated before update on public.outfits for each row execute function public.set_updated_at();
create trigger preferences_updated before update on public.preferences for each row execute function public.set_updated_at();

-- Composite foreign keys prevent an owned outfit/wear from referencing another user's clothes.
alter table public.preferences enable row level security;
alter table public.garments enable row level security;
alter table public.outfits enable row level security;
alter table public.outfit_items enable row level security;
alter table public.wear_events enable row level security;
alter table public.wear_items enable row level security;
alter table public.suggestion_feedback enable row level security;

create policy own_preferences on public.preferences for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy own_garments on public.garments for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy own_outfits on public.outfits for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy own_outfit_items on public.outfit_items for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy own_wear_events on public.wear_events for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy own_wear_items on public.wear_items for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy own_feedback on public.suggestion_feedback for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

revoke all on public.preferences, public.garments, public.outfits, public.outfit_items, public.wear_events, public.wear_items, public.suggestion_feedback from anon;
grant select, insert, update, delete on public.preferences, public.garments, public.outfits, public.outfit_items, public.wear_events, public.wear_items, public.suggestion_feedback to authenticated;

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('garment-photos', 'garment-photos', false, 5242880, array['image/jpeg','image/png','image/webp']);
create policy photo_read on storage.objects for select to authenticated using (bucket_id = 'garment-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy photo_insert on storage.objects for insert to authenticated with check (bucket_id = 'garment-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy photo_update on storage.objects for update to authenticated using (bucket_id = 'garment-photos' and (storage.foldername(name))[1] = (select auth.uid())::text) with check (bucket_id = 'garment-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy photo_delete on storage.objects for delete to authenticated using (bucket_id = 'garment-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- Atomic quota. No client has direct access to the counter table.
create table public.ai_request_windows (
  user_id uuid not null references auth.users(id) on delete cascade,
  window_start timestamptz not null,
  hits integer not null check (hits between 1 and 10),
  primary key (user_id, window_start)
);
alter table public.ai_request_windows enable row level security;
revoke all on public.ai_request_windows from anon, authenticated;
create function public.consume_style_request() returns boolean language plpgsql security definer
set search_path = '' as $$
declare caller uuid := auth.uid();
begin
  if caller is null then raise exception 'Authentication required'; end if;
  insert into public.ai_request_windows(user_id, window_start, hits)
    values (caller, date_trunc('hour', now()), 1)
    on conflict (user_id, window_start) do update
      set hits = public.ai_request_windows.hits + 1
      where public.ai_request_windows.hits < 10;
  return found;
end;
$$;
revoke all on function public.consume_style_request() from public, anon;
grant execute on function public.consume_style_request() to authenticated;

commit;
