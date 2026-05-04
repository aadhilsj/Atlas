-- Atlas — add trips and cities

-- Trips: multiple visits per country
create table public.trips (
  id uuid primary key default uuid_generate_v4(),
  country_id uuid references public.countries(id) on delete cascade,
  title text, -- optional trip name e.g. "Summer 2024"
  start_date date,
  end_date date,
  notes text,
  created_at timestamptz default now()
);

-- Cities visited per trip
create table public.cities (
  id uuid primary key default uuid_generate_v4(),
  trip_id uuid references public.trips(id) on delete cascade,
  name text not null,
  created_at timestamptz default now()
);

-- RLS public read
alter table public.trips enable row level security;
alter table public.cities enable row level security;

create policy "Public read trips" on public.trips for select using (true);
create policy "Public read cities" on public.cities for select using (true);

-- Migrate existing visited_at into trips
insert into public.trips (country_id, start_date, title)
select id, visited_at, 'First visit'
from public.countries
where visited_at is not null;
