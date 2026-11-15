/**
 * Pure day / timezone logic. No I/O — everything here is unit-tested.
 *
 * Calendar dates are "yyyy-MM-dd" strings in the learner's timezone. Day maths
 * is done on calendar dates (never on milliseconds in local time), so daylight
 * saving changes cannot shift a day boundary.
 *
 * Rule: a course always starts the day AFTER the learner enrolls. Day 1 opens
 * at 00:00 on start_date, Day N at 00:00 on start_date + (N - 1), and each day
 * closes at 23:59:59 that same local day.
 */
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

export type DateStr = string; // yyyy-MM-dd
export type DayStatus = "done" | "missed" | "today" | "locked";

export const DEFAULT_TIMEZONE = "America/Toronto";

export function isValidTimezone(tz: string | null | undefined): tz is string {
  if (!tz) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

export function safeTimezone(tz: string | null | undefined): string {
  return isValidTimezone(tz) ? tz : DEFAULT_TIMEZONE;
}

/** Today's calendar date in the given timezone. */
export function todayInTz(tz: string, now: Date = new Date()): DateStr {
  return formatInTimeZone(now, safeTimezone(tz), "yyyy-MM-dd");
}

/** Local hour (0–23) in the given timezone. */
export function localHour(tz: string, now: Date = new Date()): number {
  return Number(formatInTimeZone(now, safeTimezone(tz), "H"));
}

function toUtcMs(date: DateStr): number {
  const [y, m, d] = date.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

export function addDays(date: DateStr, days: number): DateStr {
  return new Date(toUtcMs(date) + days * 86_400_000).toISOString().slice(0, 10);
}

/** Whole calendar days from `from` to `to` (negative if `to` is earlier). */
export function daysBetween(from: DateStr, to: DateStr): number {
  return Math.round((toUtcMs(to) - toUtcMs(from)) / 86_400_000);
}

/** start_date for someone enrolling right now: always tomorrow, local time. */
export function startDateForEnrollment(tz: string, now: Date = new Date()): DateStr {
  return addDays(todayInTz(tz, now), 1);
}

/**
 * The day the learner is on. 0 = not started (no start date, or it starts
 * tomorrow). Capped at the course length once the course is over.
 */
export function currentDayNumber(
  startDate: DateStr | null,
  today: DateStr,
  totalDays: number,
): number {
  if (!startDate) return 0;
  const raw = daysBetween(startDate, today) + 1;
  if (raw < 1) return 0;
  return Math.min(raw, totalDays);
}

export function lastDayDate(startDate: DateStr, totalDays: number): DateStr {
  return addDays(startDate, totalDays - 1);
}

/** True once the final day's local date has passed. */
export function isPastFinalDay(
  startDate: DateStr | null,
  today: DateStr,
  totalDays: number,
): boolean {
  if (!startDate) return false;
  return daysBetween(lastDayDate(startDate, totalDays), today) > 0;
}

/**
 * The only day that accepts a response right now, or null when nothing is open
 * (not started yet, or the course is over).
 */
export function openDayNumber(
  startDate: DateStr | null,
  today: DateStr,
  totalDays: number,
): number | null {
  if (!startDate) return null;
  const raw = daysBetween(startDate, today) + 1;
  return raw >= 1 && raw <= totalDays ? raw : null;
}

export function dateOfDay(startDate: DateStr, dayNumber: number): DateStr {
  return addDays(startDate, dayNumber - 1);
}

export function dayStatus(
  dayNumber: number,
  startDate: DateStr | null,
  today: DateStr,
  totalDays: number,
  respondedDays: ReadonlySet<number>,
): DayStatus {
  if (respondedDays.has(dayNumber)) return "done";
  const open = openDayNumber(startDate, today, totalDays);
  if (open === dayNumber) return "today";
  if (!startDate) return "locked";
  return daysBetween(dateOfDay(startDate, dayNumber), today) > 0 ? "missed" : "locked";
}

/** The instant (UTC) at which a given day unlocks: local midnight. */
export function unlockInstant(startDate: DateStr, dayNumber: number, tz: string): Date {
  return fromZonedTime(`${dateOfDay(startDate, dayNumber)}T00:00:00`, safeTimezone(tz));
}

/** The instant (UTC) at which a given day closes: the next local midnight. */
export function closeInstant(startDate: DateStr, dayNumber: number, tz: string): Date {
  return unlockInstant(startDate, dayNumber + 1, tz);
}

/**
 * Consecutive-day streak from a list of local dates on which the learner did
 * the work. The streak is alive if they responded today or yesterday.
 */
export function computeStreak(activeDates: Iterable<DateStr>, today: DateStr): number {
  const set = new Set(activeDates);
  let cursor = set.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (set.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function greetingForHour(hour: number): string {
  if (hour < 5) return "Still up";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function formatDateLong(date: DateStr): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(toUtcMs(date)));
}

export function formatDateShort(date: DateStr): string {
  return new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "short", day: "numeric" }).format(
    new Date(toUtcMs(date)),
  );
}
