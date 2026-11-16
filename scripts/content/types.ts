/** One day's task. Book ideas are paraphrased in our own words — never quoted. */
export interface DayTask {
  title: string;
  book_insight: string;
  book_reference: string;
  instructions: string[];
  response_prompt: string;
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
