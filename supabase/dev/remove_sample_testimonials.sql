-- Removes every DEV SAMPLE testimonial. Real ones are not touched.
delete from public.testimonials where is_dev_sample;
