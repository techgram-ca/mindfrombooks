"use client";
import { useEffect, useMemo, useState } from "react";
import { project } from "@/lib/offers/compound";
import { cn } from "@/lib/utils";

interface Currency {
  code: string;
  symbol: string;
  locale: string;
  presets: number[];
  max: number;
  step: number;
}

const CURRENCIES: Currency[] = [
  { code: "USD", symbol: "$", locale: "en-US", presets: [50, 100, 250, 500], max: 2000, step: 10 },
  { code: "CAD", symbol: "C$", locale: "en-CA", presets: [50, 100, 250, 500], max: 2000, step: 10 },
  {
    code: "INR",
    symbol: "₹",
    locale: "en-IN",
    presets: [2000, 5000, 10000, 25000],
    max: 100000,
    step: 500,
  },
  { code: "GBP", symbol: "£", locale: "en-GB", presets: [50, 100, 250, 500], max: 2000, step: 10 },
  { code: "AUD", symbol: "A$", locale: "en-AU", presets: [50, 100, 250, 500], max: 2000, step: 10 },
];

const RATES = [4, 7, 10];

function guessCurrency(): Currency {
  const lang = (typeof navigator !== "undefined" ? navigator.language : "en-US").toLowerCase();
  if (lang.endsWith("-in")) return CURRENCIES[2];
  if (lang.endsWith("-ca")) return CURRENCIES[1];
  if (lang.endsWith("-gb")) return CURRENCIES[3];
  if (lang.endsWith("-au")) return CURRENCIES[4];
  return CURRENCIES[0];
}

export function CompoundCalculator({ accent }: { accent: string }) {
  const [currency, setCurrency] = useState<Currency>(CURRENCIES[0]);
  const [monthly, setMonthly] = useState(100);
  const [years, setYears] = useState(25);
  const [rate, setRate] = useState(7);

  useEffect(() => {
    const c = guessCurrency();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- browser-only value, read once after mount
    setCurrency(c);
    setMonthly(c.presets[1]);
  }, []);

  const fmt = useMemo(
    () => new Intl.NumberFormat(currency.locale, { maximumFractionDigits: 0 }),
    [currency],
  );
  const money = (n: number) => `${currency.symbol}${fmt.format(Math.round(n))}`;
  const p = project(monthly, years, rate);
  const contributedPct = p.value > 0 ? Math.max(4, (p.contributed / p.value) * 100) : 100;
  const multiple = p.contributed > 0 ? p.value / p.contributed : 1;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-12">
        {/* Inputs */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="calc-monthly" className="text-sm font-medium text-white/80">
                You set aside every month
              </label>
              <select
                aria-label="Currency"
                value={currency.code}
                onChange={(e) => {
                  const c = CURRENCIES.find((x) => x.code === e.target.value) ?? CURRENCIES[0];
                  setCurrency(c);
                  setMonthly(c.presets[1]);
                }}
                className="rounded-full border border-white/20 bg-transparent px-3 py-1 text-sm text-white"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code} className="text-foreground">
                    {c.code}
                  </option>
                ))}
              </select>
            </div>
            <p className="mt-1 font-serif text-4xl font-semibold text-white">{money(monthly)}</p>
            <input
              id="calc-monthly"
              type="range"
              min={currency.step}
              max={currency.max}
              step={currency.step}
              value={monthly}
              onChange={(e) => setMonthly(Number(e.target.value))}
              className="mt-3 w-full"
              style={{ accentColor: accent }}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {currency.presets.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setMonthly(v)}
                  aria-pressed={monthly === v}
                  className={cn(
                    "rounded-full border px-3 py-1 text-sm transition-colors",
                    monthly === v
                      ? "border-white bg-white text-[#0f2a1f]"
                      : "border-white/25 text-white/85 hover:bg-white/10",
                  )}
                >
                  {money(v)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="calc-years" className="text-sm font-medium text-white/80">
              For <span className="font-semibold text-white">{years} years</span>
            </label>
            <input
              id="calc-years"
              type="range"
              min={1}
              max={40}
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="mt-3 w-full"
              style={{ accentColor: accent }}
            />
          </div>

          <fieldset>
            <legend className="text-sm font-medium text-white/80">Assumed yearly return</legend>
            <div className="mt-2 inline-flex rounded-full border border-white/20 p-1">
              {RATES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRate(r)}
                  aria-pressed={rate === r}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                    rate === r ? "bg-white text-[#0f2a1f]" : "text-white/80 hover:text-white",
                  )}
                >
                  {r}%
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        {/* Result */}
        <div aria-live="polite">
          <p className="text-sm font-medium text-white/70">After {years} years you could have</p>
          <p className="mt-1 font-serif text-5xl font-semibold text-[#f3c77a] sm:text-6xl">
            {money(p.value)}
          </p>
          <p className="mt-2 text-white/80">
            You put in <span className="font-semibold text-white">{money(p.contributed)}</span>.{" "}
            {p.growth > 0 && (
              <>
                Compounding adds <span className="font-semibold text-white">{money(p.growth)}</span>
                {multiple >= 1.5 && <> — about {multiple.toFixed(1)}× what you saved</>}.
              </>
            )}
          </p>

          <div className="mt-5" aria-hidden>
            <div className="flex h-4 overflow-hidden rounded-full bg-[#f3c77a]">
              <div
                className="h-full rounded-l-full bg-white/85"
                style={{ width: `${contributedPct}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-white/70">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-white/85" /> What you put in
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-[#f3c77a]" /> What compounding added
              </span>
            </div>
          </div>

          {p.delayYears >= 1 && (
            <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm text-white/75">
                Start {p.delayYears} {p.delayYears === 1 ? "year" : "years"} later instead, and the
                same habit ends at
              </p>
              <p className="mt-1 font-serif text-2xl font-semibold text-white">
                {money(p.ifDelayed)}
              </p>
              <p className="mt-1 text-sm text-white/75">
                Waiting costs you{" "}
                <span className="font-semibold text-white">{money(p.value - p.ifDelayed)}</span>.
                The best time to start is this month.
              </p>
            </div>
          )}
        </div>
      </div>
      <p className="mt-6 text-xs leading-relaxed text-white/55">
        Illustration only, not a forecast or financial advice. It assumes the same amount every
        month and a steady yearly return, compounded monthly, before fees and taxes. Real returns go
        up and down and can be negative.
      </p>
    </div>
  );
}
