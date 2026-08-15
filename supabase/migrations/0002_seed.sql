-- =====================================================================
-- SNEWS.INFO — Seed data (run after 0001_init.sql)
-- Sample verified events so the site has content on day one.
-- All inserted as status 'live' — they have already "passed" verification.
-- Idempotent: safe to run multiple times.
-- =====================================================================

insert into public.events (title, slug, description, type, mode, status, source_url, start_date, end_date, application_deadline, venue, city, max_seats, prize_pool, eligibility, tags, last_verified_at, is_ai_sourced) values
(
  'National AI Hackathon 2026',
  'national-ai-hackathon-2026',
  'Build AI solutions for real-world problems in 48 hours. Teams of up to 4 tackle problem statements around healthcare, agriculture and education, with mentors from leading AI labs and a demo day judged by industry experts. Meals, cloud credits and certificates for all participants.',
  'hackathon', 'hybrid', 'live', 'https://example.com/ai-hackathon',
  now() + interval '21 days', now() + interval '23 days', now() + interval '14 days',
  'Tech Park Auditorium, Pune', 'Pune', 500, '₹2,00,000 + pre-placement offers',
  'Open to all undergraduate and postgraduate students. Teams of 1–4.',
  array['AI', 'Machine Learning', 'Startup friendly'], now(), true
),
(
  'Problem Solving Challenge: Code Warriors',
  'problem-solving-challenge-code-warriors',
  'A 3-hour competitive programming contest for students who love algorithms. Three rounds of increasing difficulty covering data structures, dynamic programming and graph theory. Top 10 finishers get invited to the national finals and earn internship fast-track interviews.',
  'problem-solving', 'online', 'live', 'https://example.com/code-warriors',
  now() + interval '10 days', now() + interval '10 days', now() + interval '7 days',
  NULL, 'Online', 1000, '₹50,000 + internship interviews',
  'Open to all students with a valid college email.', array['DSA', 'Competitive Programming'], now(), true
),
(
  'Ideathon: Ideas That Change Everything',
  'ideathon-ideas-that-change-everything',
  'Bring your boldest idea and shape it into a pitch-ready concept in one weekend. Workshops on problem discovery, design thinking and storytelling, followed by a live pitch competition. Winning ideas get mentorship and a chance to join the SNEWS startup incubator.',
  'ideathon', 'offline', 'live', 'https://example.com/ideathon',
  now() + interval '35 days', now() + interval '37 days', now() + interval '28 days',
  'Innovation Center, Bengaluru', 'Bengaluru', 300, '₹75,000 + incubation',
  'Open to all students. Solo or teams of up to 3.', array['Ideas', 'Design Thinking', 'Pitch'], now(), true
),
(
  'Free Session: How to Get Your First Internship',
  'free-session-first-internship',
  'A free 90-minute online session with hiring managers from product startups. Learn how internship applications are actually reviewed, how to structure a student resume with no experience, and how to answer the three most common interview questions. Live Q&A at the end.',
  'session', 'online', 'live', 'https://example.com/internship-session',
  now() + interval '5 days', now() + interval '5 days', now() + interval '4 days',
  NULL, 'Online', 2000, NULL,
  'Open to all students.', array['Career', 'Internships', 'Free'], now(), false
),
(
  'Research Paper Writing Bootcamp',
  'research-paper-writing-bootcamp',
  'Two-week guided bootcamp on writing your first research paper: literature review, structuring abstracts, citation best practices and submission to journals. Includes weekly mentor check-ins, peer reviews and a final paper review by academics.',
  'research', 'online', 'live', 'https://example.com/research-bootcamp',
  now() + interval '15 days', now() + interval '29 days', now() + interval '12 days',
  NULL, 'Online', 150, NULL,
  'Open to UG/PG students; basic knowledge of a research topic is helpful.', array['Research', 'Papers', 'Mentorship'], now(), false
),
(
  'Startup Sprint: From Idea to MVP',
  'startup-sprint-idea-to-mvp',
  'Build a working MVP in 10 days with a team you form at the event. Daily stand-ups, design and development mentorship, and a final pitch to angel investors from the SNEWS network. Focus areas: problem validation, rapid prototyping and founder fundamentals.',
  'startup-competition', 'hybrid', 'live', 'https://example.com/startup-sprint',
  now() + interval '45 days', now() + interval '55 days', now() + interval '40 days',
  'Startup Hub, Hyderabad', 'Hyderabad', 200, '₹1,00,000 seed fund',
  'Open to students with a startup idea or willingness to join one.',   array['Startup', 'MVP', 'Pitching'], now(), false
)
on conflict (slug) do nothing;
