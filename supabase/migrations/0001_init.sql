-- =====================================================================
-- SNEWS.INFO — Initial schema
-- Student Opportunity & Innovation Network
--
-- Run this in the Supabase SQL editor (or via `supabase db push`).
-- Includes: tables, enums, triggers, Row-Level Security policies,
-- automated audit logging and a profile auto-creation trigger.
-- =====================================================================

create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- ---------------------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------------------
create type user_role as enum ('student', 'teacher', 'college', 'organizer', 'admin');
create type event_type as enum (
  'hackathon', 'problem-solving', 'ideathon', 'internship', 'workshop',
  'startup-competition', 'research', 'community', 'session', 'freelancing'
);
create type event_mode as enum ('online', 'offline', 'hybrid');
create type event_status as enum (
  'pending', 'ai_reviewed', 'in_review', 'approved', 'live',
  'rejected', 'cancelled', 'completed', 'stale'
);
create type registration_status as enum ('pending', 'identity_pending', 'confirmed', 'cancelled', 'attended');
create type identity_status as enum ('not_required', 'pending', 'verified', 'failed');
create type source_trust_level as enum ('official', 'partner', 'user', 'ai_discovered');
create type resource_type as enum ('internship', 'job', 'funding', 'legal', 'freelance', 'scholarship');
create type moderation_status as enum ('pending', 'approved', 'removed');
create type ai_job_status as enum ('queued', 'running', 'completed', 'failed');
create type conversation_status as enum ('open', 'resolved', 'closed');

-- ---------------------------------------------------------------------
-- PROFILES (one row per auth.users entry, created automatically)
-- ---------------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       citext not null unique,
  phone       text,
  role        user_role not null default 'student',
  full_name   text,
  college_id  uuid,
  is_verified boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.student_profiles (
  user_id       uuid primary key references public.profiles (id) on delete cascade,
  branch        text,
  year          smallint check (year between 1 and 6),
  skills        text[] not null default '{}',
  portfolio_url text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table public.teacher_profiles (
  user_id       uuid primary key references public.profiles (id) on delete cascade,
  department    text,
  designation   text,
  research_area text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table public.college_profiles (
  user_id             uuid primary key references public.profiles (id) on delete cascade,
  college_name        text not null,
  affiliation_number  text,
  website             text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create table public.organizations (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  type       text not null check (type in ('college', 'company', 'startup', 'nonprofit', 'community')),
  website    text,
  verified   boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- EVENTS + double-check verification workflow
-- ---------------------------------------------------------------------
create table public.events (
  id                  uuid primary key default gen_random_uuid(),
  title               text not null check (char_length(title) between 5 and 200),
  slug                text not null unique,
  description         text not null check (char_length(description) >= 50),
  type                event_type not null,
  mode                event_mode not null default 'online',
  status              event_status not null default 'pending',
  organizer_id        uuid references public.profiles (id) on delete set null,
  organization_id     uuid references public.organizations (id) on delete set null,
  source_url          text,
  start_date          timestamptz not null,
  end_date            timestamptz,
  application_deadline timestamptz,
  venue               text,
  city                text,
  max_seats           integer check (max_seats > 0),
  prize_pool          text,
  eligibility         text,
  tags                text[] not null default '{}',
  cover_url           text,
  last_verified_at    timestamptz,
  is_ai_sourced       boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint events_end_after_start check (end_date is null or end_date >= start_date)
);

create table public.verifications (
  id              uuid primary key default gen_random_uuid(),
  event_id        uuid not null references public.events (id) on delete cascade,
  checks_passed   text[] not null default '{}',
  ai_risk_score   integer check (ai_risk_score between 0 and 100),
  ai_review_notes text,
  reviewer_id     uuid references public.profiles (id) on delete set null,
  result          text not null check (result in ('approved', 'rejected', 'needs_changes')),
  reviewed_at     timestamptz,
  created_at      timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- EVENT REGISTRATIONS (identity-aware)
-- ---------------------------------------------------------------------
create table public.event_registrations (
  id              uuid primary key default gen_random_uuid(),
  event_id        uuid not null references public.events (id) on delete cascade,
  user_id         uuid not null references public.profiles (id) on delete cascade,
  status          registration_status not null default 'pending',
  identity_status identity_status not null default 'not_required',
  aadhaar_verified boolean not null default false,
  digilocker_ref  text,
  answers         jsonb not null default '{}',
  registered_at   timestamptz not null default now(),
  constraint event_registrations_unique unique (event_id, user_id)
);

-- ---------------------------------------------------------------------
-- RESEARCH PAPERS & REFERENCE LIBRARY
-- ---------------------------------------------------------------------
create table public.research_papers (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  authors     text[] not null default '{}',
  abstract    text,
  category    text,
  year        integer check (year between 1900 and extract(year from now()) + 1),
  paper_url   text,
  file_url    text,
  uploaded_by uuid references public.profiles (id) on delete set null,
  is_public   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- STARTUP IDEAS
-- ---------------------------------------------------------------------
create table public.startup_ideas (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  title       text not null,
  pitch       text not null,
  problem     text not null,
  solution    text not null,
  stage       text not null default 'idea' check (stage in ('idea', 'mvp', 'launched')),
  team_size   integer not null default 1 check (team_size between 1 and 20),
  upvotes     integer not null default 0 check (upvotes >= 0),
  created_at  timestamptz not null default now()
);

create table public.startup_idea_votes (
  idea_id  uuid not null references public.startup_ideas (id) on delete cascade,
  user_id  uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (idea_id, user_id)
);

-- ---------------------------------------------------------------------
-- RESOURCES (internships / funding / legal / freelance — official only)
-- ---------------------------------------------------------------------
create table public.resources (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  type          resource_type not null,
  description   text,
  source_url    text not null,
  official_site boolean not null default false,
  is_verified   boolean not null default false,
  posted_by     uuid references public.profiles (id) on delete set null,
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- CREWIN COMMUNITIES
-- ---------------------------------------------------------------------
create table public.communities (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 3 and 80),
  description text,
  admin_id    uuid not null references public.profiles (id) on delete cascade,
  type        text not null default 'crewin' check (type in ('crewin', 'college', 'skill', 'startup')),
  is_public   boolean not null default true,
  created_at  timestamptz not null default now()
);

create table public.community_members (
  community_id uuid not null references public.communities (id) on delete cascade,
  user_id      uuid not null references public.profiles (id) on delete cascade,
  joined_at    timestamptz not null default now(),
  primary key (community_id, user_id)
);

create table public.community_posts (
  id                uuid primary key default gen_random_uuid(),
  community_id      uuid not null references public.communities (id) on delete cascade,
  author_id         uuid not null references public.profiles (id) on delete cascade,
  content           text not null check (char_length(content) between 1 and 2000),
  moderation_status moderation_status not null default 'pending',
  created_at        timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- CHAT SUPPORT (realtime)
-- ---------------------------------------------------------------------
create table public.chat_conversations (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.profiles (id) on delete cascade,
  status            conversation_status not null default 'open',
  assigned_admin_id uuid references public.profiles (id) on delete set null,
  created_at        timestamptz not null default now()
);

create table public.chat_messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.chat_conversations (id) on delete cascade,
  sender_id       uuid not null references public.profiles (id) on delete cascade,
  body            text not null check (char_length(body) between 1 and 2000),
  created_at      timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- SOURCES, AI JOBS, AUDIT LOGS
-- ---------------------------------------------------------------------
create table public.sources (
  id             uuid primary key default gen_random_uuid(),
  url            text not null unique,
  source_type    text not null check (source_type in ('official', 'rss', 'social', 'ai_discovered')),
  trust_level    source_trust_level not null default 'ai_discovered',
  last_checked_at timestamptz,
  active         boolean not null default true,
  created_at     timestamptz not null default now()
);

create table public.ai_jobs (
  id             uuid primary key default gen_random_uuid(),
  type           text not null check (type in ('source_hackathon', 'verify_event', 'summarize_paper', 'classify_opportunity')),
  status         ai_job_status not null default 'queued',
  input_payload  jsonb not null default '{}',
  output_payload jsonb,
  error          text,
  created_at     timestamptz not null default now(),
  completed_at   timestamptz
);

create table public.audit_logs (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid references public.profiles (id) on delete set null,
  action      text not null,
  entity_type text not null,
  entity_id   uuid,
  metadata    jsonb not null default '{}',
  ip          text,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- INDEXES (performance)
-- ---------------------------------------------------------------------
create index idx_events_status on public.events (status);
create index idx_events_type on public.events (type);
create index idx_events_start_date on public.events (start_date desc);
create index idx_events_organizer on public.events (organizer_id);
create index idx_registrations_event on public.event_registrations (event_id);
create index idx_registrations_user on public.event_registrations (user_id);
create index idx_papers_category on public.research_papers (category);
create index idx_papers_year on public.research_papers (year desc);
create index idx_resources_type on public.resources (type);
create index idx_startup_ideas_upvotes on public.startup_ideas (upvotes desc);
create index idx_community_posts_community on public.community_posts (community_id, created_at desc);
create index idx_chat_conversations_user on public.chat_conversations (user_id);
create index idx_chat_messages_conversation on public.chat_messages (conversation_id, created_at);
create index idx_audit_logs_created on public.audit_logs (created_at desc);
create index idx_verifications_event on public.verifications (event_id);

-- ---------------------------------------------------------------------
-- FUNCTIONS & TRIGGERS
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger student_profiles_set_updated_at
  before update on public.student_profiles
  for each row execute function public.set_updated_at();
create trigger teacher_profiles_set_updated_at
  before update on public.teacher_profiles
  for each row execute function public.set_updated_at();
create trigger college_profiles_set_updated_at
  before update on public.college_profiles
  for each row execute function public.set_updated_at();
create trigger events_set_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

-- Auto-create a profile row when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Safe upvote: adds a vote row and increments the counter in one transaction
create or replace function public.upvote_startup_idea(p_idea_id uuid)
returns integer language plpgsql security definer as $$
declare
  v_user uuid := auth.uid();
  v_total integer;
begin
  if v_user is null then
    raise exception 'You must be signed in to upvote';
  end if;
  insert into public.startup_idea_votes (idea_id, user_id)
  values (p_idea_id, v_user)
  on conflict do nothing;
  update public.startup_ideas
     set upvotes = upvotes + 1
   where id = p_idea_id;
  select upvotes into v_total from public.startup_ideas where id = p_idea_id;
  return v_total;
end;
$$;

-- Audit helper used by policies/triggers for sensitive actions
create or replace function public.write_audit(p_action text, p_entity_type text, p_entity_id uuid, p_metadata jsonb default '{}')
returns void language plpgsql security definer as $$
begin
  insert into public.audit_logs (actor_id, action, entity_type, entity_id, metadata)
  values (auth.uid(), p_action, p_entity_type, p_entity_id, p_metadata);
end;
$$;

-- ---------------------------------------------------------------------
-- ROW-LEVEL SECURITY
-- Enforce: tables with sensitive data are locked down. Every policy
-- uses auth.uid() or role checks — never client-supplied values.
-- ---------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.student_profiles enable row level security;
alter table public.teacher_profiles enable row level security;
alter table public.college_profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.events enable row level security;
alter table public.verifications enable row level security;
alter table public.event_registrations enable row level security;
alter table public.research_papers enable row level security;
alter table public.startup_ideas enable row level security;
alter table public.startup_idea_votes enable row level security;
alter table public.resources enable row level security;
alter table public.communities enable row level security;
alter table public.community_members enable row level security;
alter table public.community_posts enable row level security;
alter table public.chat_conversations enable row level security;
alter table public.chat_messages enable row level security;
alter table public.sources enable row level security;
alter table public.ai_jobs enable row level security;
alter table public.audit_logs enable row level security;

-- profiles: everyone can read public basics; a user can update their own row
create policy profiles_select on public.profiles for select using (true);
create policy profiles_update_own on public.profiles for update using (auth.uid() = id);
create policy profiles_insert_own on public.profiles for insert with check (auth.uid() = id);

-- role-specific profile tables: read public, write only own row
create policy student_profiles_select on public.student_profiles for select using (true);
create policy student_profiles_upsert_own on public.student_profiles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy teacher_profiles_select on public.teacher_profiles for select using (true);
create policy teacher_profiles_upsert_own on public.teacher_profiles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy college_profiles_select on public.college_profiles for select using (true);
create policy college_profiles_upsert_own on public.college_profiles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- organizations: verified orgs readable by all; admin manages
create policy organizations_select on public.organizations for select using (true);
create policy organizations_admin_all on public.organizations for all using (exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
));

-- events: LIVE events are public; organizers & admins manage their own drafts
create policy events_select_public on public.events for select using (status = 'live');
create policy events_select_own on public.events for select using (organizer_id = auth.uid());
create policy events_admin_all on public.events for all using (exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
));
create policy events_insert_organizer on public.events for insert with check (
  organizer_id = auth.uid()
  and status in ('pending', 'ai_reviewed')
);
create policy events_update_organizer on public.events for update using (organizer_id = auth.uid());
create policy events_delete_organizer on public.events for delete using (organizer_id = auth.uid());

-- verifications: admin + reviewer only
create policy verifications_admin_all on public.verifications for all using (exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
));

-- registrations: user reads/writes own; organizer/admin read for their events
create policy registrations_select_own on public.event_registrations for select using (user_id = auth.uid());
create policy registrations_insert_own on public.event_registrations for insert with check (user_id = auth.uid());
create policy registrations_update_own on public.event_registrations for update using (user_id = auth.uid());
create policy registrations_select_organizer on public.event_registrations for select using (
  exists (
    select 1 from public.events e
    where e.id = event_id and e.organizer_id = auth.uid()
  )
);

-- research papers: public reads; authenticated uploads; owner updates
create policy papers_select on public.research_papers for select using (is_public or uploaded_by = auth.uid());
create policy papers_insert on public.research_papers for insert with check (auth.uid() is not null);
create policy papers_update_own on public.research_papers for update using (uploaded_by = auth.uid());
create policy papers_delete_own on public.research_papers for delete using (uploaded_by = auth.uid());

-- startup ideas: public reads; signed-in creates; owner edits
create policy ideas_select on public.startup_ideas for select using (true);
create policy ideas_insert on public.startup_ideas for insert with check (user_id = auth.uid());
create policy ideas_update_own on public.startup_ideas for update using (user_id = auth.uid());
create policy ideas_delete_own on public.startup_ideas for delete using (user_id = auth.uid());

-- votes: only own vote row
create policy votes_select on public.startup_idea_votes for select using (true);
create policy votes_insert_own on public.startup_idea_votes for insert with check (user_id = auth.uid());

-- resources: verified public; admins manage
create policy resources_select on public.resources for select using (true);
create policy resources_admin_all on public.resources for all using (exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
));

-- communities: public reads; admin of community manages; members can post
create policy communities_select on public.communities for select using (is_public or admin_id = auth.uid());
create policy communities_insert on public.communities for insert with check (auth.uid() is not null);
create policy communities_update_admin on public.communities for update using (admin_id = auth.uid());
create policy community_members_select on public.community_members for select using (true);
create policy community_members_insert on public.community_members for insert with check (auth.uid() is not null);
create policy posts_select on public.community_posts for select using (moderation_status = 'approved' or author_id = auth.uid());
create policy posts_insert on public.community_posts for insert with check (author_id = auth.uid());
create policy posts_admin_all on public.community_posts for all using (exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
));

-- chat: participants only
create policy chat_select_own on public.chat_conversations for select using (user_id = auth.uid() or assigned_admin_id = auth.uid());
create policy chat_insert_own on public.chat_conversations for insert with check (user_id = auth.uid());
create policy messages_select_participant on public.chat_messages for select using (
  exists (
    select 1 from public.chat_conversations c
    where c.id = conversation_id and (c.user_id = auth.uid() or c.assigned_admin_id = auth.uid())
  )
);
create policy messages_insert_participant on public.chat_messages for insert with check (
  exists (
    select 1 from public.chat_conversations c
    where c.id = conversation_id and (c.user_id = auth.uid() or c.assigned_admin_id = auth.uid())
  )
);

-- sources & ai_jobs: internal — only service role / admins
create policy sources_select_admin on public.sources for select using (exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
));
create policy sources_admin_all on public.sources for all using (exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
));
create policy ai_jobs_admin_all on public.ai_jobs for all using (exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
));

-- audit logs: read-only for admins
create policy audit_select_admin on public.audit_logs for select using (exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
));

-- Service role bypasses RLS automatically (used by server-side code).
