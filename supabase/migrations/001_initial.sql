-- Atlas Travel Archive — initial schema

create extension if not exists "uuid-ossp";

-- Countries visited
create table public.countries (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  country_code text not null unique,  -- ISO alpha-3 e.g. "NOR"
  numeric_id integer not null unique, -- TopoJSON numeric ID
  visited_at date,
  cover_photo_url text,
  notes text,
  created_at timestamptz default now()
);

-- Photos per country
create table public.photos (
  id uuid primary key default uuid_generate_v4(),
  country_id uuid references public.countries(id) on delete cascade,
  url text not null,
  caption text,
  taken_at date,
  created_at timestamptz default now()
);

-- Friends met per country
create table public.friends (
  id uuid primary key default uuid_generate_v4(),
  country_id uuid references public.countries(id) on delete cascade,
  name text not null,
  instagram_handle text,
  photo_url text,
  created_at timestamptz default now()
);

-- Vlogs per country
create table public.vlogs (
  id uuid primary key default uuid_generate_v4(),
  country_id uuid references public.countries(id) on delete cascade,
  title text not null,
  url text not null,
  platform text check (platform in ('youtube','instagram','tiktok')) default 'youtube',
  thumbnail_url text,
  created_at timestamptz default now()
);

-- Storage bucket for photos
insert into storage.buckets (id, name, public) values ('photos', 'photos', true);

-- RLS: public read
alter table public.countries enable row level security;
alter table public.photos enable row level security;
alter table public.friends enable row level security;
alter table public.vlogs enable row level security;

create policy "Public read countries" on public.countries for select using (true);
create policy "Public read photos" on public.photos for select using (true);
create policy "Public read friends" on public.friends for select using (true);
create policy "Public read vlogs" on public.vlogs for select using (true);

-- Seed data — Aadhil's travels
insert into public.countries (name, country_code, numeric_id, visited_at, notes) values
  ('Norway',         'NOR', 578, '2023-08-01', 'Home base — Oslo life'),
  ('Sri Lanka',      'LKA', 144, '2023-12-01', 'Family roots, Galle, Colombo'),
  ('Switzerland',    'CHE', 756, '2026-05-01', 'Upcoming May trip'),
  ('United Kingdom', 'GBR', 826, '2024-06-01', 'London'),
  ('France',         'FRA', 250, '2024-07-01', 'Paris & Nice'),
  ('Italy',          'ITA', 380, '2024-08-01', 'Milan & Rome');

-- Seed friends
with n as (select id from public.countries where country_code = 'NOR')
insert into public.friends (country_id, name, instagram_handle)
select n.id, 'Isira', '@isira' from n;

with lk as (select id from public.countries where country_code = 'LKA')
insert into public.friends (country_id, name, instagram_handle)
select lk.id, 'Galle crew', '@galle_gang' from lk
union all
select lk.id, 'Colombo friend', '@cmb_life' from lk;
