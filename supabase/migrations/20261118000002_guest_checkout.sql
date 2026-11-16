-- Pay-first checkout: visitors can buy without an account. After payment the
-- account is created from the email they used at Stripe, and the success page
-- asks them to choose a password.

alter table public.orders
  add column if not exists guest_email text,
  -- This order's payment created the buyer's account (so the success page may
  -- offer "choose your password" exactly once).
  add column if not exists created_account boolean not null default false,
  add column if not exists account_claimed_at timestamptz;

-- The welcome email gains a line for new accounts ("set your password").
update public.email_templates
   set body_markdown = body_markdown || E'\n\n{{account_line}}'
 where key = 'welcome'
   and body_markdown not like '%{{account_line}}%';
