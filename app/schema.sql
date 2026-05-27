-- ============================================================
-- Supabase schema for the Fitness Tracker app.
-- Run this ONCE in the Supabase SQL Editor after creating your project.
-- ============================================================

-- Profile: user's age/sex/bodyweight + program start date.
-- Single row per device since this is a personal-use app (no auth).
create table if not exists profile (
    id               integer primary key default 1,
    sex              text not null check (sex in ('male','female')),
    age              integer not null,
    bodyweight_lbs   numeric not null,
    height_in        numeric,
    program_start    date not null,
    created_at       timestamptz default now(),
    updated_at       timestamptz default now(),
    constraint single_profile check (id = 1)
);

-- Workout session: one row per workout-day the user starts.
create table if not exists session (
    id               uuid primary key default gen_random_uuid(),
    session_date     date not null,
    day_of_week      text not null,
    week_number      integer not null,
    day_type         text not null,           -- 'strength' or 'cardio'
    muscle_group     text,
    completed        boolean default false,
    duration_seconds integer,
    notes            text,
    created_at       timestamptz default now()
);
create index if not exists idx_session_date on session(session_date);

-- Set: one row per set of a lift, or per timed/run exercise within a session.
create table if not exists exercise_log (
    id               uuid primary key default gen_random_uuid(),
    session_id       uuid not null references session(id) on delete cascade,
    exercise_name    text not null,
    exercise_kind    text not null,          -- 'lift' | 'run' | 'timed'
    set_number       integer,                -- 1,2,3 for lifts; null otherwise
    weight_lbs       numeric,                -- lift weight (per dumbbell, or stack/bar)
    reps_completed   integer,                -- lift reps actually completed
    miles            numeric,                -- run distance
    seconds          numeric,                -- run time OR timed exercise duration
    bodyweight_lbs   numeric,                -- snapshot of user weight at time of log
    created_at       timestamptz default now()
);
create index if not exists idx_log_session on exercise_log(session_id);
create index if not exists idx_log_exercise on exercise_log(exercise_name);

-- Permissive RLS for personal-use single-device app (no auth).
alter table profile      enable row level security;
alter table session      enable row level security;
alter table exercise_log enable row level security;

create policy "anon all profile"      on profile      for all using (true) with check (true);
create policy "anon all session"      on session      for all using (true) with check (true);
create policy "anon all exercise_log" on exercise_log for all using (true) with check (true);
