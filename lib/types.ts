// Row types mirroring supabase/migrations. Keep in sync with the SQL.

export type Role = "user" | "admin";
export type CourseStatus = "draft" | "published" | "archived";
/** daily: one task unlocks per day. self_paced: every lesson open at once (workshops). */
export type CourseFormat = "daily" | "self_paced";

/** A copy-able block on a lesson. */
export interface LessonResource {
  kind: "prompt" | "command" | "link" | "note";
  label: string;
  content: string;
  /** For commands that differ by operating system. */
  os?: "windows" | "mac" | "linux" | "all";
}
export type EnrollmentSource = "stripe" | "admin_grant" | "coupon_free" | "bundle";
export type EnrollmentStatus = "active" | "completed" | "refunded" | "revoked";
export type OrderStatus = "pending" | "paid" | "partially_refunded" | "refunded";
export type RefundType = "guarantee" | "admin_manual";
export type EmailTemplateKey =
  | "welcome"
  | "daily_reminder"
  | "missed_yesterday"
  | "course_complete"
  | "refund_confirmation"
  | "admin_invite";

export interface Profile {
  id: string;
  email: string;
  name: string;
  role: Role;
  timezone: string;
  timezone_confirmed: boolean;
  reminder_hour: number;
  email_reminders: boolean;
  signup_source: string | null;
  signup_medium: string | null;
  signup_campaign: string | null;
  landing_page: string | null;
  referrer: string | null;
  last_active_at: string | null;
  created_at: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface Course {
  id: string;
  slug: string;
  name: string;
  category: string;
  emoji: string;
  accent_color: string;
  short_description: string;
  description: string;
  number_reason: string;
  outcomes: string[];
  notice: string | null;
  days: number;
  price_cents: number;
  currency: string;
  grace_days: number;
  cover_image_url: string | null;
  status: CourseStatus;
  sort_order: number;
  faq: FaqItem[];
  format: CourseFormat;
  has_guarantee: boolean;
  created_at: string;
}

export interface CourseBook {
  id: string;
  course_id: string;
  title: string;
  author: string;
  image_url: string | null;
  sort_order: number;
}

export interface CoursePhase {
  id: string;
  course_id: string;
  name: string;
  start_day: number;
  end_day: number;
}

export interface Task {
  id: string;
  course_id: string;
  day_number: number;
  title: string;
  book_insight: string;
  book_reference: string;
  instructions: string[];
  response_prompt: string;
  min_response_chars: number;
  is_sample: boolean;
  /** Workshops only. */
  resources?: LessonResource[];
}

export interface Bundle {
  id: string;
  slug: string;
  name: string;
  description: string;
  price_cents: number;
  status: CourseStatus;
}

export interface Coupon {
  id: string;
  code: string;
  percent_off: number | null;
  amount_off_cents: number | null;
  course_ids: string[] | null;
  max_redemptions: number | null;
  times_redeemed: number;
  one_per_user: boolean;
  expires_at: string | null;
  source_label: string | null;
  active: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string | null;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  amount_total_cents: number;
  amount_discount_cents: number;
  amount_refunded_cents: number;
  currency: string;
  coupon_id: string | null;
  course_id: string | null;
  bundle_id: string | null;
  utm_campaign: string | null;
  status: OrderStatus;
  created_at: string;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  order_id: string | null;
  source: EnrollmentSource;
  amount_paid_cents: number;
  coupon_id: string | null;
  granted_by: string | null;
  start_date: string | null;
  timezone: string;
  grace_days: number;
  status: EnrollmentStatus;
  completed_at: string | null;
  utm_campaign: string | null;
  created_at: string;
}

export interface ResponseRow {
  id: string;
  enrollment_id: string;
  user_id: string;
  task_id: string | null;
  day_number: number;
  body: string;
  submitted_at: string;
  updated_at: string;
  is_starred: boolean;
  testimonial_name: string | null;
}

export interface Refund {
  id: string;
  enrollment_id: string | null;
  order_id: string | null;
  user_id: string | null;
  stripe_refund_id: string | null;
  amount_cents: number;
  type: RefundType;
  created_at: string;
}

export interface Certificate {
  id: string;
  enrollment_id: string;
  user_id: string;
  name_on_certificate: string;
  days_completed: number;
  issued_at: string;
}

export interface EmailTemplate {
  key: EmailTemplateKey;
  subject: string;
  body_markdown: string;
  button_label: string;
}

export interface AppSettings {
  refund_window_days: number;
  default_reminder_hour: number;
  announcement: string | null;
  instagram_followers: number;
}

export const DEFAULT_SETTINGS: AppSettings = {
  refund_window_days: 14,
  default_reminder_hour: 8,
  announcement: null,
  instagram_followers: 35000,
};
