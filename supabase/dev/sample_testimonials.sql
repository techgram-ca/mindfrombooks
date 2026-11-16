-- ============================================================================
-- DEV / STAGING ONLY — SAMPLE TESTIMONIALS FOR PREVIEWING THE LAYOUT
-- ============================================================================
-- These are made-up placeholder quotes, not real customers. They are stored
-- with is_dev_sample = true, which the app NEVER shows on the production
-- deployment (VERCEL_ENV = production), and they carry a visible "Sample"
-- label everywhere else.
--
-- Do not run this on the production database. Remove them any time with
-- supabase/dev/remove_sample_testimonials.sql.
--
-- Needs migrations 20261117000001 and 20261117000002 first. Safe to re-run:
-- it deletes the previous samples before inserting.
-- ============================================================================

begin;

delete from public.testimonials where is_dev_sample;

insert into public.testimonials
  (course_id, name, country, body, stars, source_note, permission_confirmed, is_dev_sample, is_published, sort_order)
select c.id, v.name, v.country, v.body, v.stars,
       'DEV SAMPLE — placeholder, not a real customer', false, true, true, v.sort_order
from (values
  -- Fix Your Money
  ('fix-your-money', 'Priya', 'India', 'Day 5 I listed all my subscriptions. ₹2,400 a month on apps I forgot. Cancelled four the same night.', 5, 1),
  ('fix-your-money', 'Jordan', 'United States', 'The real hourly wage exercise was humbling. I stopped buying stuff I''d need to work 6 hours for.', 5, 2),
  ('fix-your-money', 'Mei', 'Canada', 'Called my phone company like Day 13 said. They dropped my bill by $18 a month. Took 9 minutes.', 5, 3),
  ('fix-your-money', 'Arjun', 'India', 'Before this course I never see my real number. Now I check every Sunday, it is not scary anymore.', 4, 4),
  ('fix-your-money', 'Hannah', 'Australia', 'Short tasks, no lectures. I finally have an emergency fund with an actual number in it.', 5, 5),
  ('fix-your-money', 'Chinedu', 'Nigeria', 'The snowball list made my debts feel like a plan instead of a weight.', 4, 6),

  -- Build Discipline
  ('build-discipline', 'Marcus', 'United States', 'I picked a 2-minute habit on Day 1 and thought it was too small. 66 days later I read every morning without thinking.', 5, 1),
  ('build-discipline', 'Ananya', 'India', 'Never miss twice. That one rule saved my streak three times.', 5, 2),
  ('build-discipline', 'Liam', 'Canada', 'Day 14, the mirror one, was uncomfortable. It was also the day things started to change.', 5, 3),
  ('build-discipline', 'Rahul', 'India', 'Many days I not feel like doing it. But task was so small I do it anyway. Now it is just normal.', 5, 4),
  ('build-discipline', 'Sophie', 'United Kingdom', 'Writing a response every day is what made it stick. Reading my journal back on Day 66 was emotional.', 4, 5),
  ('build-discipline', 'Jake', 'Australia', 'Missed two days in week 5. The grace days meant I didn''t just give up. Finished it.', 4, 6),
  ('build-discipline', 'Grace', 'Philippines', 'Stacking a second habit in week 6 got me a new habit almost for free. Didn''t think that would work.', 5, 7),

  -- AI for Everyday Life
  ('ai-for-everyday-life', 'Kavya', 'India', 'The five-part prompt on Day 4 changed everything. My answers went from generic to actually useful.', 5, 1),
  ('ai-for-everyday-life', 'Dan', 'United States', 'Built a one-page site for my dad''s shop on Day 17. He thinks I paid someone.', 5, 2),
  ('ai-for-everyday-life', 'Olivia', 'Canada', 'Day 3 taught me to catch it being wrong. Glad I learned that before trusting it with real work.', 5, 3),
  ('ai-for-everyday-life', 'Imran', 'Pakistan', 'I was little afraid of AI before. Now I use it for my emails daily, and I still check it like course say.', 4, 4),
  ('ai-for-everyday-life', 'Ethan', 'Australia', 'The agent day was the most useful thing I''ve done with AI so far. Clear limits, good result.', 5, 5),
  ('ai-for-everyday-life', 'Neha', 'United Kingdom', 'Rehearsed a salary conversation with it on Day 12. Got the raise.', 5, 6),

  -- Get Fit, Stay Healthy
  ('get-fit-stay-healthy', 'Sarah', 'Canada', 'Just walking 10 minutes a day at first. By week 6 I''m walking 40 and actually look forward to it.', 5, 1),
  ('get-fit-stay-healthy', 'Vikram', 'India', 'Fixed wake-up time and morning sunlight. My sleep is better than it has been in years.', 5, 2),
  ('get-fit-stay-healthy', 'Megan', 'United States', 'No gym, no crazy diet. The sit-to-stand test on week 5 showed me real progress.', 4, 3),
  ('get-fit-stay-healthy', 'Tom', 'Australia', 'Caffeine cut-off at 2pm. Simple, and I fall asleep in 15 minutes now instead of an hour.', 5, 4),
  ('get-fit-stay-healthy', 'Lakshmi', 'India', 'I am 54 and was worried exercise will be too hard. It is all gentle and step by step, my knees are fine.', 5, 5),
  ('get-fit-stay-healthy', 'Chris', 'United Kingdom', 'Eating at a table with no phone sounds small. It changed how much I snack.', 4, 6),

  -- Time Management - Stop Procrastination
  ('stop-procrastinating', 'Aisha', 'United Arab Emirates', 'Naming my frog on Day 1 got a 3-month-old task done in one afternoon.', 5, 1),
  ('stop-procrastinating', 'Ryan', 'United States', 'The shutdown ritual is the best thing that happened to my evenings.', 5, 2),
  ('stop-procrastinating', 'Sneha', 'India', 'Two-minute rule cleared 23 tiny tasks in half hour. I was shocked how much was just sitting.', 5, 3),
  ('stop-procrastinating', 'Noah', 'Canada', 'Counting my weeks on Day 2 was a gut punch in a good way. I started the thing I''d been putting off for years.', 5, 4),
  ('stop-procrastinating', 'Jessica', 'Australia', 'Deep work block with my phone in another room. I did more in 90 minutes than a normal day.', 4, 5),

  -- Talk with Confidence
  ('talk-with-confidence', 'Rohan', 'India', 'One day without criticising. Harder than I thought. My wife noticed by evening.', 5, 1),
  ('talk-with-confidence', 'Emily', 'United States', 'Using people''s names sounds basic. My coworkers are noticeably warmer with me now.', 4, 2),
  ('talk-with-confidence', 'Kwame', 'Ghana', 'Labelling emotions calmed a fight with my landlord. We agreed on the repair the same week.', 5, 3),
  ('talk-with-confidence', 'Isabella', 'Canada', 'I''m shy and this was the first thing that gave me something to actually DO in conversations.', 5, 4),
  ('talk-with-confidence', 'Farhan', 'Bangladesh', 'Before I always argue to win. Now I ask "how" questions and people listen to me more, really.', 5, 5),
  ('talk-with-confidence', 'Lucy', 'United Kingdom', 'Mirroring felt silly the first time. Then someone told me their whole story in five minutes.', 4, 6),
  ('talk-with-confidence', 'Aditya', 'India', 'Said "I don''t blame you for feeling that way" to an angry customer. Whole call changed.', 5, 7)
) as v (slug, name, country, body, stars, sort_order)
join public.courses c on c.slug = v.slug;

commit;

select c.name, count(*) as samples
from public.testimonials t join public.courses c on c.id = t.course_id
where t.is_dev_sample
group by c.name, c.sort_order order by c.sort_order;
