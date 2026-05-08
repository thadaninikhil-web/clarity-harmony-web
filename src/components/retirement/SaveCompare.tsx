import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trash2, Save, RefreshCw, Link2, Check } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  loadScenarios,
  saveScenario,
  deleteScenario,
  encodeInputsToHash,
  type SavedScenario,
} from "@/lib/scenarios";
import { formatINR, type ProjectionResult, type RetirementInputs } from "@/lib/retirement";

interface Props {
  inputs: RetirementInputs;
  result: ProjectionResult;
  onLoad: (inputs: RetirementInputs) => void;
  /** Namespace ("swr" etc.) so each calculator keeps its own scenario list. */
  kind?: string;
  /** Where the share link should land (defaults to current pathname). */
  shareBasePath?: string;
}

export function SaveCompare({ inputs, result, onLoad, kind, shareBasePath }: Props) {
  const [scenarios, setScenarios] = useState<SavedScenario[]>([]);
  const [name, setName] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    setScenarios(loadScenarios(kind));
  }, [kind]);

  const onSave = () => {
    const next = saveScenario(name || inputs.name || "Untitled scenario", inputs, result, kind);
    setScenarios(next);
    setName("");
  };

  const onDelete = (id: string) => setScenarios(deleteScenario(id, kind));

  const buildShareUrl = (ins: RetirementInputs): string => {
    if (typeof window === "undefined") return "";
    const base = shareBasePath ?? window.location.pathname;
    const hash = encodeInputsToHash(ins);
    return `${window.location.origin}${base}#s=${hash}`;
  };

  const onShare = async (id: string, ins: RetirementInputs) => {
    const url = buildShareUrl(ins);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(id);
      setTimeout(() => setCopied((c) => (c === id ? null : c)), 1800);
    } catch {
      window.prompt("Copy this link", url);
    }
  };

  const onShareCurrent = () => onShare("__current", inputs);

  const compareData = useMemo(
    () =>
      scenarios.map((s) => ({
        name: s.name,
        Corpus: Math.round(s.summary.corpusAtRetirement),
        Final: Math.round(s.summary.finalCorpus),
      })),
    [scenarios],
  );

  return (
    <Card className="shadow-[var(--shadow-card)]">
      <CardHeader>
        <CardTitle className="font-serif">Save & compare scenarios</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            placeholder="Name this scenario (e.g. Aggressive 15% return)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Button onClick={onSave} className="gap-2 shrink-0">
            <Save className="size-4" /> Save current
          </Button>
          <Button onClick={onShareCurrent} variant="outline" className="gap-2 shrink-0">
            {copied === "__current" ? <Check className="size-4" /> : <Link2 className="size-4" />}
            {copied === "__current" ? "Link copied" : "Share link"}
          </Button>
        </div>

        {scenarios.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No saved scenarios yet. Save the current configuration to compare alternative
            assumptions side by side.
          </p>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {scenarios.map((s) => (
                <div
                  key={s.id}
                  className="rounded-md border border-border bg-card p-3 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-medium text-sm">{s.name}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {new Date(s.savedAt).toLocaleString()}
                      </div>
                    </div>
                    {s.summary.depleted ? (
                      <Badge variant="destructive" className="text-[10px]">
                        Depletes @ {s.summary.depletionAge}
                      </Badge>
                    ) : (
                      <Badge className="text-[10px]">Sustained</Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                    <span className="text-muted-foreground">Corpus@retire</span>
                    <span className="text-right tabular-nums">
                      {formatINR(s.summary.corpusAtRetirement)}
                    </span>
                    <span className="text-muted-foreground">Final corpus</span>
                    <span className="text-right tabular-nums">
                      {formatINR(s.summary.finalCorpus)}
                    </span>
                    <span className="text-muted-foreground">Acc return</span>
                    <span className="text-right tabular-nums">
                      {(s.inputs.accReturn * 100).toFixed(1)}%
                    </span>
                    <span className="text-muted-foreground">SIP / month</span>
                    <span className="text-right tabular-nums">
                      {formatINR(s.inputs.monthlyInvestment)}
                    </span>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-1 h-8"
                      onClick={() => onLoad(s.inputs)}
                    >
                      <RefreshCw className="size-3" /> Load
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2"
                      onClick={() => onShare(s.id, s.inputs)}
                      aria-label="Copy share link"
                      title="Copy share link"
                    >
                      {copied === s.id ? <Check className="size-3" /> : <Link2 className="size-3" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2"
                      onClick={() => onDelete(s.id)}
                      aria-label="Delete scenario"
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {scenarios.length >= 2 && (
              <div className="h-[260px] w-full pt-2">
                <ResponsiveContainer>
                  <BarChart data={compareData} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <YAxis
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                      tickFormatter={(v) => formatINR(Number(v))}
                      width={80}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 4,
                      }}
                      formatter={(v) => formatINR(Number(v))}
                    />
                    <Legend />
                    <Bar dataKey="Corpus" fill="var(--color-bucket-accumulation)" />
                    <Bar dataKey="Final" fill="var(--color-bucket-preparation)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
