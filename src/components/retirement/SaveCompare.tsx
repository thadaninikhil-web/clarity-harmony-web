import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trash2, Save, RefreshCw } from "lucide-react";
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
  type SavedScenario,
} from "@/lib/scenarios";
import { formatINR, type ProjectionResult, type RetirementInputs } from "@/lib/retirement";

interface Props {
  inputs: RetirementInputs;
  result: ProjectionResult;
  onLoad: (inputs: RetirementInputs) => void;
}

export function SaveCompare({ inputs, result, onLoad }: Props) {
  const [scenarios, setScenarios] = useState<SavedScenario[]>([]);
  const [name, setName] = useState("");

  useEffect(() => {
    setScenarios(loadScenarios());
  }, []);

  const onSave = () => {
    const next = saveScenario(name || inputs.name || "Untitled scenario", inputs, result);
    setScenarios(next);
    setName("");
  };

  const onDelete = (id: string) => setScenarios(deleteScenario(id));

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
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                    <YAxis
                      tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                      tickFormatter={(v) => formatINR(Number(v))}
                      width={80}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "var(--popover)",
                        border: "1px solid var(--border)",
                        borderRadius: 4,
                      }}
                      formatter={(v) => formatINR(Number(v))}
                    />
                    <Legend />
                    <Bar dataKey="Corpus" fill="var(--bucket-accumulation)" />
                    <Bar dataKey="Final" fill="var(--bucket-preparation)" />
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
