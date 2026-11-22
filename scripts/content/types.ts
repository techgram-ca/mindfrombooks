import type { LessonResource } from "../../lib/types";

/** One day's task. Book ideas are paraphrased in our own words — never quoted. */
export interface DayTask {
  title: string;
  book_insight: string;
  book_reference: string;
  instructions: string[];
  response_prompt: string;
  /** Workshops only: copy-able prompts, commands and links. */
  resources?: LessonResource[];
}

/** Compact constructor so the content files read like a list of days. */
export function day(
  title: string,
  book_insight: string,
  book_reference: string,
  instructions: string[],
  response_prompt: string,
): DayTask {
  return { title, book_insight, book_reference, instructions, response_prompt };
}

/** A workshop lesson: intro, steps and copy-able resources. No daily question. */
export function lesson(
  title: string,
  intro: string,
  steps: string[],
  resources: LessonResource[] = [],
  bookReference = "",
): DayTask {
  return {
    title,
    book_insight: intro,
    book_reference: bookReference,
    instructions: steps,
    response_prompt: "",
    resources,
  };
}
