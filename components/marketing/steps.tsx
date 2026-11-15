const steps = [
  {
    n: "1",
    title: "Enroll",
    body: "Pick a course. Day 1 opens the next morning, so you start fresh with a full day.",
  },
  {
    n: "2",
    title: "One task a day",
    body: "Each day you get one small action drawn from a great book. Most take 5–15 minutes.",
  },
  {
    n: "3",
    title: "Respond & change",
    body: "Write a short response before midnight. That's the proof you did it — and the habit that changes you.",
  },
];

export function Steps() {
  return (
    <ol className="grid gap-4 md:grid-cols-3">
      {steps.map((s) => (
        <li key={s.n} className="rounded-card border-border bg-surface shadow-soft border p-5">
          <span className="bg-accent-soft text-accent-strong flex size-9 items-center justify-center rounded-full font-serif text-lg font-semibold">
            {s.n}
          </span>
          <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
          <p className="text-muted-foreground mt-1.5 text-[15px]">{s.body}</p>
        </li>
      ))}
    </ol>
  );
}
