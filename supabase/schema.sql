-- ============================================================
-- Superhack Platform — Supabase Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- ── universities ──────────────────────────────────────────
create table if not exists universities (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  slug         text unique not null,
  city         text,
  state        text,
  logo_url     text,
  email_domain text,
  description  text,
  created_at   timestamptz default now()
);

-- ── users (extends auth.users) ────────────────────────────
create table if not exists users (
  id                    uuid primary key references auth.users(id) on delete cascade,
  full_name             text,
  email                 text,
  university_id         uuid references universities(id),
  university_email      text,
  university_verified   boolean default false,
  created_at            timestamptz default now()
);

-- ── cohorts ───────────────────────────────────────────────
create table if not exists cohorts (
  id            uuid primary key default gen_random_uuid(),
  university_id uuid not null references universities(id) on delete cascade,
  title         text not null,
  slug          text unique not null,
  status        text check (status in ('upcoming','active','past')) default 'upcoming',
  start_date    date,
  end_date      date,
  prize_pool    jsonb default '{"first":100,"second":70,"third":50,"community":30}',
  created_at    timestamptz default now()
);

-- ── projects ──────────────────────────────────────────────
create table if not exists projects (
  id              uuid primary key default gen_random_uuid(),
  cohort_id       uuid not null references cohorts(id) on delete cascade,
  user_id         uuid not null references users(id) on delete cascade,
  name            text not null,
  description     text,
  github_url      text,
  live_url        text,
  solana_address  text,
  upvote_count    int default 0,
  category        text,
  created_at      timestamptz default now()
);

-- ── votes ─────────────────────────────────────────────────
create table if not exists votes (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  user_id     uuid not null references users(id) on delete cascade,
  created_at  timestamptz default now(),
  unique(project_id, user_id)
);

-- ── university_verifications (temp OTP store) ─────────────
create table if not exists university_verifications (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references users(id) on delete cascade,
  university_email text not null,
  token           text not null,
  expires_at      timestamptz not null,
  created_at      timestamptz default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table universities             enable row level security;
alter table users                    enable row level security;
alter table cohorts                  enable row level security;
alter table projects                 enable row level security;
alter table votes                    enable row level security;
alter table university_verifications enable row level security;

-- Public read access
create policy "Public read universities"
  on universities for select using (true);

create policy "Public read cohorts"
  on cohorts for select using (true);

create policy "Public read projects"
  on projects for select using (true);

create policy "Public read votes"
  on votes for select using (true);

-- Users: own row only
create policy "Users select own profile"
  on users for select using (auth.uid() = id);

create policy "Users insert own profile"
  on users for insert with check (auth.uid() = id);

create policy "Users update own profile"
  on users for update using (auth.uid() = id);

-- Projects: insert only if university_verified = true
create policy "Verified users insert projects"
  on projects for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from users
      where id = auth.uid() and university_verified = true
    )
  );

-- Projects: users can update/delete their own
create policy "Users update own projects"
  on projects for update using (auth.uid() = user_id);

-- Votes: logged-in users only
create policy "Authenticated users insert votes"
  on votes for insert with check (auth.uid() = user_id);

create policy "Users delete own votes"
  on votes for delete using (auth.uid() = user_id);

-- University verifications: own only
create policy "Users manage own verifications"
  on university_verifications for all using (auth.uid() = user_id);

-- ============================================================
-- Trigger: auto-create user profile on sign up
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  default_name text := '';
begin
  if new.raw_user_meta_data is not null then
    default_name := coalesce(new.raw_user_meta_data->>'full_name', '');
  end if;

  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    default_name
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(nullif(excluded.full_name, ''), public.profiles.full_name);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- Function: increment upvote_count atomically
-- ============================================================
create or replace function increment_upvote(project_id uuid)
returns void language plpgsql security definer as $$
begin
  update projects set upvote_count = upvote_count + 1
  where id = project_id;
end;
$$;

create or replace function decrement_upvote(project_id uuid)
returns void language plpgsql security definer as $$
begin
  update projects set upvote_count = greatest(0, upvote_count - 1)
  where id = project_id;
end;
$$;

-- ============================================================
-- Trigger: automatically maintain projects.upvote_count on votes insert/delete
-- ============================================================
create or replace function public.handle_project_vote()
returns trigger language plpgsql security definer as $$
begin
  if tg_op = 'INSERT' then
    update public.projects
    set upvote_count = upvote_count + 1
    where id = new.project_id;
  elsif tg_op = 'DELETE' then
    update public.projects
    set upvote_count = greatest(0, upvote_count - 1)
    where id = old.project_id;
  end if;
  return null;
end;
$$;

drop trigger if exists on_project_vote on public.votes;
create trigger on_project_vote
  after insert or delete on public.votes
  for each row execute procedure public.handle_project_vote();

-- ============================================================
-- Seed Data — Sample Nigerian Universities
-- ============================================================
insert into universities (name, slug, city, state, email_domain, description) values
  ('University of Lagos', 'unilag', 'Lagos', 'Lagos', 'unilag.edu.ng', 'The University of First Choice and the Nation''s Pride, leading in research and academic excellence.'),
  ('University of Ibadan', 'ui', 'Ibadan', 'Oyo', 'ui.edu.ng', 'Nigeria''s premier university, founded in 1948, known for generating knowledge for societal development.'),
  ('University of Nigeria, Nsukka', 'unn', 'Nsukka', 'Enugu', 'unn.edu.ng', 'To restore the dignity of man, UNN is a top tier institution in Eastern Nigeria.'),
  ('Ahmadu Bello University', 'abu', 'Zaria', 'Kaduna', 'abu.edu.ng', 'A premier destination for education in Northern Nigeria, nurturing leaders since 1962.'),
  ('University of Benin', 'uniben', 'Benin City', 'Edo', 'uniben.edu.ng', 'Famous for scientific innovations, hands-on learning, and strong student development.')
on conflict (slug) do nothing;

-- Add columns migration in case table already existed
alter table universities add column if not exists email_domain text;
alter table universities add column if not exists description text;
alter table projects add column if not exists category text;

-- ============================================================
-- Function: auto-updates cohort status based on dates
-- ============================================================
create or replace function sync_cohort_status()
returns void as $$
begin
  update cohorts set status = 'active'
  where now() >= start_date::timestamptz
  and now() < end_date::timestamptz
  and status != 'active';

  update cohorts set status = 'past'
  where now() >= end_date::timestamptz
  and status != 'past';
end;
$$ language plpgsql;

-- Schedule cron job every hour if cron extension is enabled
-- select cron.schedule('sync-cohort-status', '0 * * * *', 'select sync_cohort_status()');


-- ============================================================
-- Learn Section Tables & RLS Policies
-- ============================================================

-- Topics (modules/courses)
create table if not exists learn_topics (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  description text,
  cover_image_url text,
  order_index integer default 0,
  is_published boolean default false,
  created_at timestamptz default now()
);

-- Lessons within a topic
create table if not exists learn_lessons (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid references learn_topics(id) on delete cascade,
  title text not null,
  slug text unique not null,
  mdx_content text,
  order_index integer default 0,
  is_published boolean default false,
  created_at timestamptz default now()
);

-- Quizzes attached to a lesson
create table if not exists learn_quizzes (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid references learn_lessons(id) on delete cascade,
  question text not null,
  type text check (type in ('multiple_choice', 'true_false', 'code_challenge')) not null,
  options jsonb,
  correct_answer text not null,
  explanation text,
  function_name text,
  test_input jsonb default '[]',
  order_index integer default 0,
  created_at timestamptz default now()
);

-- Track user progress
create table if not exists learn_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  lesson_id uuid references learn_lessons(id) on delete cascade,
  completed boolean default false,
  quiz_passed boolean default false,
  completed_at timestamptz,
  unique(user_id, lesson_id)
);

-- RLS
alter table learn_topics enable row level security;
alter table learn_lessons enable row level security;
alter table learn_quizzes enable row level security;
alter table learn_progress enable row level security;

-- Create policies
create policy "learn_topics_read_published" on learn_topics for select using (is_published = true);
create policy "learn_lessons_read_published" on learn_lessons for select using (is_published = true);
create policy "learn_quizzes_read_all" on learn_quizzes for select using (true);
create policy "learn_progress_own" on learn_progress for all using (auth.uid() = user_id);

-- Admin write policies
create policy "learn_topics_admin" on learn_topics for all
  using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));
create policy "learn_lessons_admin" on learn_lessons for all
  using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));
create policy "learn_quizzes_admin" on learn_quizzes for all
  using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));

-- Seed first topic
insert into learn_topics (title, slug, description, order_index, is_published)
values (
  'Introduction to Solana',
  'intro-to-solana',
  'Start here. Learn what Solana is, why it matters, and how it works — no prior blockchain experience needed.',
  1,
  true
) on conflict (slug) do nothing;

-- Migrations
alter table learn_quizzes add column if not exists function_name text;
alter table learn_quizzes add column if not exists test_input jsonb default '[]';

-- University verification migrations
alter table profiles add column if not exists university_verification_code text;
alter table profiles add column if not exists university_verification_expires_at timestamptz;
alter table profiles add column if not exists pending_university_email text;

-- Username constraints migration
alter table profiles drop constraint if exists username_not_reserved;
alter table profiles add constraint username_not_reserved
  check (
    username is null or
    lower(username) not in (
      'admin','dashboard','ideas','docs','hackathons','universities',
      'apply','submit','auth','projects','api','learn'
    )
  );


