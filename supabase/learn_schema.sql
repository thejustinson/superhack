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
  mdx_content text, -- full MDX content stored here
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
  options jsonb, -- array of {label, value} for multiple_choice and true_false
  correct_answer text not null, -- value string for mc/tf, expected output for code
  explanation text, -- shown after answering
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

-- Drop existing policies if they exist (to allow safe re-run)
drop policy if exists "learn_topics_read_published" on learn_topics;
drop policy if exists "learn_lessons_read_published" on learn_lessons;
drop policy if exists "learn_quizzes_read_all" on learn_quizzes;
drop policy if exists "learn_progress_own" on learn_progress;
drop policy if exists "learn_topics_admin" on learn_topics;
drop policy if exists "learn_lessons_admin" on learn_lessons;
drop policy if exists "learn_quizzes_admin" on learn_quizzes;

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
