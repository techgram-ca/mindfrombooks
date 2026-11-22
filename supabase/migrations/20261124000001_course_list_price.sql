-- Actual ("list") price shown struck through next to the selling price.
-- price_cents stays the price people pay. Null = no discount shown.
alter table public.courses
  add column if not exists list_price_cents integer
  check (list_price_cents is null or list_price_cents between 0 and 1000000);

comment on column public.courses.list_price_cents is
  'Actual price before discount, in cents. Shown struck through when higher than price_cents.';

-- The AI animation workshop: US$19.99, sold at US$6.99.
update public.courses
set list_price_cents = 1999
where slug = 'ai-animation-instagram' and list_price_cents is null;
