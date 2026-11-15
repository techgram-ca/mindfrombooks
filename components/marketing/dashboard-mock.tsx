/** A static picture of the Today screen, used on marketing pages. */
export function DashboardMock() {
  return (
    <div
      className="border-border bg-background shadow-lift mx-auto w-full max-w-[20rem] rounded-[2rem] border p-4"
      role="img"
      aria-label="Preview of the daily dashboard: today's task card with a progress bar and a respond button"
    >
      <p className="font-serif text-lg font-semibold">Good morning, Aman 👋</p>
      <p className="text-muted-foreground mt-0.5 text-sm">🔥 11-day streak</p>
      <p className="text-muted-foreground mt-4 text-[11px] font-semibold tracking-[0.14em] uppercase">
        Today
      </p>
      <div className="border-border bg-surface shadow-soft mt-2 rounded-2xl border p-4">
        <p className="text-sm font-semibold">💰 Fix Your Money · Day 12/31</p>
        <p className="text-muted-foreground mt-0.5 text-xs">Phase: Control</p>
        <p className="mt-2 font-serif text-[15px]">“Find your 3 money leaks”</p>
        <div className="bg-surface-muted mt-3 h-2 overflow-hidden rounded-full">
          <div className="h-full w-[39%] rounded-full bg-[#2F7D57]" />
        </div>
        <div className="bg-primary text-primary-foreground mt-3 rounded-full py-2 text-center text-sm font-medium">
          Respond now →
        </div>
      </div>
      <div className="border-border bg-surface mt-3 rounded-2xl border p-4">
        <p className="text-sm font-semibold">🗣️ Talk with Confidence · 4/33 ✅</p>
        <p className="text-muted-foreground mt-0.5 text-xs">Done today — see you tomorrow</p>
      </div>
    </div>
  );
}
