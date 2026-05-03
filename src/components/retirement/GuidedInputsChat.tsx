import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowRight, Pencil, RotateCcw } from "lucide-react";
import { IndianNumberInput } from "@/components/retirement/IndianNumberInput";
import type { RetirementInputs } from "@/lib/retirement";

type FieldType = "text" | "date" | "money" | "age" | "percent" | "number" | "signed-percent";

interface Question {
  id: string;
  prompt: (v: RetirementInputs) => string;
  type: FieldType;
  defaultFrom: (v: RetirementInputs) => string; // string representation pre-fill
  apply: (v: RetirementInputs, raw: string) => RetirementInputs;
  validate?: (raw: string, v: RetirementInputs) => string | null;
  helper?: string;
  // Display label for summary
  label: string;
  format: (v: RetirementInputs) => string;
}

const TODAY = new Date().toISOString().slice(0, 10);
const MIN_DOB = "1900-01-01";

const fmtINR = (n: number) => `₹${(n || 0).toLocaleString("en-IN")}`;
const pct = (n: number, dp = 0) => `${(n * 100).toFixed(dp)}%`;

function parseNumber(raw: string): number {
  const cleaned = raw.replace(/,/g, "").replace(/[%₹\s]/g, "").trim();
  if (cleaned === "" || cleaned === "-") return NaN;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : NaN;
}

function buildQuestions(): Question[] {
  return [
    {
      id: "name",
      label: "Name",
      prompt: () => "Hi! I'm going to help you figure out if you're on track for retirement. What's your name?",
      type: "text",
      defaultFrom: (v) => v.name || "",
      apply: (v, raw) => ({ ...v, name: raw.trim() }),
      validate: (raw) => (raw.trim() ? null : "Please enter your name"),
      format: (v) => v.name || "—",
    },
    {
      id: "dob",
      label: "Date of birth",
      prompt: (v) => `Nice to meet you, ${v.name || "friend"}! What's your date of birth?`,
      type: "date",
      defaultFrom: (v) => v.dob || "",
      apply: (v, raw) => ({ ...v, dob: raw }),
      validate: (raw) => {
        if (!raw) return "Please enter your date of birth";
        const yr = Number(raw.slice(0, 4));
        if (!Number.isFinite(yr) || yr < 1900 || yr > new Date().getFullYear()) return "Enter a valid year";
        return null;
      },
      format: (v) => v.dob || "—",
    },
    {
      id: "retirementAge",
      label: "Retirement age",
      prompt: () => "At what age would you like to retire?",
      type: "age",
      defaultFrom: (v) => String(v.retirementAge || 60),
      apply: (v, raw) => {
        const age = parseNumber(raw);
        return { ...v, retirementAge: age };
      },
      validate: (raw) => {
        const n = parseNumber(raw);
        if (!Number.isFinite(n) || n < 30 || n > 90) return "Enter an age between 30 and 90";
        return null;
      },
      format: (v) => `${v.retirementAge}`,
    },
    {
      id: "lifeExpectancyAge",
      label: "Plan until age",
      prompt: (v) => `Until what age would you like to plan for? (life expectancy)`,
      type: "age",
      defaultFrom: (v) => String(v.lifeExpectancyAge ?? v.retirementAge + 30),
      apply: (v, raw) => {
        const age = parseNumber(raw);
        return {
          ...v,
          lifeExpectancyAge: age,
          lifeExpectancyYears: Math.max(1, age - v.retirementAge),
        };
      },
      validate: (raw, v) => {
        const n = parseNumber(raw);
        if (!Number.isFinite(n)) return "Enter a valid age";
        if (n <= v.retirementAge) return `Must be greater than ${v.retirementAge}`;
        if (n > 120) return "Enter an age under 120";
        return null;
      },
      format: (v) => `${v.lifeExpectancyAge ?? v.retirementAge + v.lifeExpectancyYears}`,
    },
    {
      id: "currentMonthlyExpenses",
      label: "Current monthly expenses",
      prompt: () => "What are your current monthly household expenses? (₹)",
      type: "money",
      defaultFrom: (v) => String(v.currentMonthlyExpenses || ""),
      apply: (v, raw) => ({ ...v, currentMonthlyExpenses: parseNumber(raw) || 0 }),
      validate: (raw) => {
        const n = parseNumber(raw);
        if (!Number.isFinite(n) || n <= 0) return "Enter a positive amount";
        return null;
      },
      format: (v) => fmtINR(v.currentMonthlyExpenses),
    },
    {
      id: "inflationRate",
      label: "Inflation rate",
      prompt: () => "What inflation rate should we assume? (e.g. 7%)",
      type: "percent",
      defaultFrom: (v) => String(Math.round((v.inflationRate || 0.07) * 1000) / 10),
      apply: (v, raw) => ({ ...v, inflationRate: (parseNumber(raw) || 0) / 100 }),
      validate: (raw) => {
        const n = parseNumber(raw);
        if (!Number.isFinite(n) || n < 0 || n > 30) return "Enter 0–30";
        return null;
      },
      format: (v) => pct(v.inflationRate, 1),
    },
    {
      id: "currentCorpus",
      label: "Current retirement corpus",
      prompt: () => "How much have you already saved or invested towards retirement? (₹)",
      type: "money",
      defaultFrom: (v) => String(v.currentCorpus || ""),
      apply: (v, raw) => ({ ...v, currentCorpus: parseNumber(raw) || 0 }),
      validate: (raw) => {
        const n = parseNumber(raw);
        if (!Number.isFinite(n) || n < 0) return "Enter zero or more";
        return null;
      },
      format: (v) => fmtINR(v.currentCorpus),
    },
    {
      id: "monthlyInvestment",
      label: "Monthly investment",
      prompt: () => "How much are you investing every month right now? (₹)",
      type: "money",
      defaultFrom: (v) => String(v.monthlyInvestment || ""),
      apply: (v, raw) => ({ ...v, monthlyInvestment: parseNumber(raw) || 0 }),
      validate: (raw) => {
        const n = parseNumber(raw);
        if (!Number.isFinite(n) || n < 0) return "Enter zero or more";
        return null;
      },
      format: (v) => fmtINR(v.monthlyInvestment),
    },
    {
      id: "sipStepUpRate",
      label: "SIP annual step-up",
      prompt: () => "How much do you step up your SIP every year? (e.g. 4%)",
      type: "percent",
      defaultFrom: (v) => String(Math.round((v.sipStepUpRate ?? 0.04) * 100)),
      apply: (v, raw) => ({ ...v, sipStepUpRate: (parseNumber(raw) || 0) / 100 }),
      validate: (raw) => {
        const n = parseNumber(raw);
        if (!Number.isFinite(n) || n < 0 || n > 50) return "Enter 0–50";
        return null;
      },
      format: (v) => pct(v.sipStepUpRate, 0),
    },
    // Bucket 1 — Accumulation
    {
      id: "accReturn",
      label: "Accumulation: equity return",
      prompt: () => "What annual return do you expect from your equity investments? (e.g. 10%)",
      type: "percent",
      defaultFrom: (v) => String(Math.round((v.sequenceCagr ?? v.accReturn ?? 0.1) * 1000) / 10),
      apply: (v, raw) => {
        const r = (parseNumber(raw) || 0) / 100;
        return { ...v, sequenceCagr: r, accReturn: r };
      },
      validate: (raw) => {
        const n = parseNumber(raw);
        if (!Number.isFinite(n) || n < 0 || n > 30) return "Enter 0–30";
        return null;
      },
      format: (v) => pct(v.sequenceCagr, 1),
    },
    {
      id: "sequenceMinReturn",
      label: "Bad-year return",
      prompt: () => "In a bad year, how much could your portfolio fall? (e.g. -25%)",
      type: "signed-percent",
      defaultFrom: (v) => String(Math.round((v.sequenceMinReturn ?? -0.25) * 100)),
      apply: (v, raw) => ({ ...v, sequenceMinReturn: (parseNumber(raw) || 0) / 100 }),
      validate: (raw) => {
        const n = parseNumber(raw);
        if (!Number.isFinite(n) || n < -90 || n > 10) return "Enter between -90 and 10";
        return null;
      },
      format: (v) => pct(v.sequenceMinReturn, 0),
    },
    {
      id: "sequenceMaxReturn",
      label: "Good-year return",
      prompt: () => "And in a good year, how much could it rise? (e.g. +25%)",
      type: "signed-percent",
      defaultFrom: (v) => String(Math.round((v.sequenceMaxReturn ?? 0.25) * 100)),
      apply: (v, raw) => ({ ...v, sequenceMaxReturn: (parseNumber(raw) || 0) / 100 }),
      validate: (raw, v) => {
        const n = parseNumber(raw);
        if (!Number.isFinite(n)) return "Enter a number";
        const r = n / 100;
        if (r <= v.sequenceMinReturn) return "Must be greater than the bad-year return";
        if (r > 1) return "Enter at most 100";
        return null;
      },
      format: (v) => pct(v.sequenceMaxReturn, 0),
    },
    // Preparation — de-risking glide path
    {
      id: "prepYearsBeforeRetirement",
      label: "Years before retirement to start de-risking",
      prompt: () =>
        "As you approach retirement, you'll want to gradually move money out of equity into safer options. How many years before retirement should this shift begin? (e.g. 3)",
      type: "number",
      defaultFrom: (v) => String(v.prepYearsBeforeRetirement ?? 3),
      apply: (v, raw) => ({ ...v, prepYearsBeforeRetirement: Math.round(parseNumber(raw) || 0) }),
      validate: (raw) => {
        const n = parseNumber(raw);
        if (!Number.isFinite(n) || n < 1 || n > 20) return "Enter 1–20";
        return null;
      },
      format: (v) => `${v.prepYearsBeforeRetirement} yrs`,
    },
    {
      id: "prepReturn",
      label: "Return on de-risked money",
      prompt: () =>
        "During this de-risking period, what return do you expect on this money? (mostly debt with a bit of equity, e.g. 7%)",
      type: "percent",
      defaultFrom: (v) => String(Math.round((v.prepReturn ?? 0.07) * 1000) / 10),
      apply: (v, raw) => ({ ...v, prepReturn: (parseNumber(raw) || 0) / 100 }),
      validate: (raw) => {
        const n = parseNumber(raw);
        if (!Number.isFinite(n) || n < 0 || n > 30) return "Enter 0–30";
        return null;
      },
      format: (v) => pct(v.prepReturn, 1),
    },
    {
      id: "prepEquityPct",
      label: "Equity % during de-risking",
      prompt: () =>
        "What % of this de-risked money should still stay in equity? (default 30%)",
      type: "percent",
      defaultFrom: (v) => String(Math.round((v.prepEquityPct ?? 0.3) * 100)),
      apply: (v, raw) => ({ ...v, prepEquityPct: (parseNumber(raw) || 0) / 100 }),
      validate: (raw) => {
        const n = parseNumber(raw);
        if (!Number.isFinite(n) || n < 0 || n > 100) return "Enter 0–100";
        return null;
      },
      format: (v) => pct(v.prepEquityPct, 0),
    },
    // Withdrawal — safe income reserve
    {
      id: "withdrawalYears",
      label: "Years of expenses in safe instruments",
      prompt: () =>
        "Once retired, you'll want a few years' worth of expenses parked in risk-free / minimal-risk instruments so market dips don't force you to sell. How many years of expenses should sit there? (e.g. 3)",
      type: "number",
      defaultFrom: (v) => String(v.withdrawalYears ?? 3),
      apply: (v, raw) => ({ ...v, withdrawalYears: Math.round(parseNumber(raw) || 0) }),
      validate: (raw) => {
        const n = parseNumber(raw);
        if (!Number.isFinite(n) || n < 1 || n > 15) return "Enter 1–15";
        return null;
      },
      format: (v) => `${v.withdrawalYears} yrs`,
    },
    {
      id: "withdrawalReturn",
      label: "Return on safe withdrawal money",
      prompt: () =>
        "What return do you expect on this safe money? (e.g. 5.5%)",
      type: "percent",
      defaultFrom: (v) => String(Math.round((v.withdrawalReturn ?? 0.055) * 1000) / 10),
      apply: (v, raw) => ({ ...v, withdrawalReturn: (parseNumber(raw) || 0) / 100 }),
      validate: (raw) => {
        const n = parseNumber(raw);
        if (!Number.isFinite(n) || n < 0 || n > 20) return "Enter 0–20";
        return null;
      },
      format: (v) => pct(v.withdrawalReturn, 2),
    },
    {
      id: "emergencyFundMonths",
      label: "Emergency fund (months)",
      prompt: () => "Finally, how many months of expenses do you want as an emergency fund? (e.g. 12)",
      type: "number",
      defaultFrom: (v) => String(v.emergencyFundMonths ?? 12),
      apply: (v, raw) => {
        const months = Math.round(parseNumber(raw) || 0);
        return {
          ...v,
          emergencyFundMonths: months,
          emergencyFundToday: months * v.currentMonthlyExpenses,
        };
      },
      validate: (raw) => {
        const n = parseNumber(raw);
        if (!Number.isFinite(n) || n < 0 || n > 60) return "Enter 0–60";
        return null;
      },
      format: (v) => `${v.emergencyFundMonths ?? 0} months`,
    },
  ];
}

interface Props {
  values: RetirementInputs;
  onChange: (next: RetirementInputs) => void;
  onComplete: () => void;
  completed: boolean;
  onRestart: () => void;
}

interface ChatTurn {
  qid: string;
  question: string;
  answer: string;
}

export function GuidedInputsChat({ values, onChange, onComplete, completed, onRestart }: Props) {
  const questions = useMemo(buildQuestions, []);
  const [stepIdx, setStepIdx] = useState(0);
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [draft, setDraft] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isSummary = stepIdx >= questions.length;
  const currentQ = !isSummary ? questions[stepIdx] : null;

  // Pre-fill draft when question changes
  useEffect(() => {
    if (currentQ) {
      setDraft(currentQ.defaultFrom(values));
      setError(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIdx]);

  // Scroll to bottom on new turn
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [turns.length, isSummary]);

  const submit = () => {
    if (!currentQ) return;
    const err = currentQ.validate?.(draft, values) ?? null;
    if (err) {
      setError(err);
      return;
    }
    const next = currentQ.apply(values, draft);
    onChange(next);
    setTurns((t) => [
      ...t,
      { qid: currentQ.id, question: currentQ.prompt(values), answer: currentQ.format(next) },
    ]);
    setDraft("");
    setError(null);
    setStepIdx((i) => i + 1);
  };

  const editField = (qid: string) => {
    const idx = questions.findIndex((q) => q.id === qid);
    if (idx < 0) return;
    setEditingId(qid);
    setStepIdx(idx);
    // Drop turns after this one
    setTurns((t) => t.filter((tt) => questions.findIndex((q) => q.id === tt.qid) < idx));
  };

  const restart = () => {
    setTurns([]);
    setStepIdx(0);
    setDraft("");
    setError(null);
    setEditingId(null);
    onRestart();
  };

  const renderInput = () => {
    if (!currentQ) return null;
    const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        submit();
      }
    };
    if (currentQ.type === "money") {
      return (
        <IndianNumberInput
          value={Number(draft.replace(/,/g, "")) || 0}
          onChange={(n) => setDraft(String(n))}
          placeholder="₹"
        />
      );
    }
    if (currentQ.type === "date") {
      return (
        <Input
          ref={inputRef}
          type="date"
          min={MIN_DOB}
          max={TODAY}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKey}
        />
      );
    }
    return (
      <Input
        ref={inputRef}
        type={currentQ.type === "text" ? "text" : "text"}
        inputMode={currentQ.type === "text" ? "text" : "decimal"}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKey}
        placeholder={
          currentQ.type === "percent"
            ? "e.g. 10"
            : currentQ.type === "signed-percent"
              ? "e.g. -25"
              : ""
        }
      />
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          {isSummary
            ? "Review your answers"
            : `Question ${stepIdx + 1} of ${questions.length}`}
        </div>
        {(turns.length > 0 || isSummary) && (
          <Button variant="ghost" size="sm" onClick={restart} className="gap-2 h-8">
            <RotateCcw className="size-3.5" />
            Start over
          </Button>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${Math.min(100, (stepIdx / questions.length) * 100)}%` }}
        />
      </div>

      <Card className="p-4 sm:p-6 shadow-[var(--shadow-card)] max-h-[60vh] overflow-y-auto" ref={scrollRef as any}>
        {/* Past turns */}
        <div className="space-y-4">
          {turns.map((t, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-start gap-2">
                <div className="rounded-2xl rounded-tl-sm bg-muted/60 px-4 py-2.5 text-sm max-w-[85%]">
                  {t.question}
                </div>
              </div>
              <div className="flex items-start justify-end gap-2">
                <button
                  onClick={() => editField(t.qid)}
                  className="opacity-0 group-hover:opacity-100 hover:opacity-100 text-muted-foreground hover:text-foreground"
                  title="Edit"
                >
                  <Pencil className="size-3.5" />
                </button>
                <div className="rounded-2xl rounded-tr-sm bg-primary text-primary-foreground px-4 py-2.5 text-sm max-w-[85%] font-medium">
                  {t.answer}
                </div>
              </div>
            </div>
          ))}

          {/* Current question */}
          {currentQ && (
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-2">
                <div className="rounded-2xl rounded-tl-sm bg-muted/60 px-4 py-2.5 text-sm max-w-[85%]">
                  {currentQ.prompt(values)}
                  {editingId === currentQ.id && (
                    <span className="ml-2 text-xs text-muted-foreground">(editing)</span>
                  )}
                </div>
              </div>
              <div className="flex items-end gap-2 pt-1">
                <div className={inputWidthClass(currentQ.type)}>{renderInput()}</div>
                <Button onClick={submit} size="icon" className="shrink-0">
                  <ArrowRight className="size-4" />
                </Button>
              </div>
              {error && <p className="text-xs text-destructive">{error}</p>}
              <p className="text-[11px] text-muted-foreground">Press Enter or → to continue. Default is pre-filled.</p>
            </div>
          )}

          {/* Summary view */}
          {isSummary && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Here's everything you've told me. Click any value to edit, or hit Calculate to see your results.
              </p>
              <div className="divide-y rounded-lg border">
                {questions.map((q) => (
                  <button
                    key={q.id}
                    onClick={() => editField(q.id)}
                    className="flex w-full items-center justify-between gap-4 px-4 py-2.5 text-left hover:bg-muted/40 transition-colors"
                  >
                    <span className="text-xs text-muted-foreground">{q.label}</span>
                    <span className="flex items-center gap-2 text-sm font-medium">
                      {q.format(values)}
                      <Pencil className="size-3 text-muted-foreground" />
                    </span>
                  </button>
                ))}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={restart} className="gap-2">
                  <RotateCcw className="size-4" />
                  Start over
                </Button>
                <Button onClick={onComplete} className="gap-2">
                  {completed ? "Recalculate" : "Calculate"}
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}