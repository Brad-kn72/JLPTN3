"use client";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn, shuffle } from "@/lib/utils";
import { speakJa } from "@/lib/speak";
import { Volume2, RotateCw, Check, X } from "lucide-react";

type KanaCell = { k: string; r: string; ko: string };
type KanaSet = {
  gojuon: KanaCell[][];
  dakuten: KanaCell[][];
  youon: KanaCell[][];
};

export function KanaClient({ hiragana, katakana }: { hiragana: KanaSet; katakana: KanaSet }) {
  return (
    <Tabs defaultValue="hiragana">
      <TabsList className="h-auto p-1.5 bg-secondary/70 dark:bg-secondary/40 grid grid-cols-3 w-full md:w-auto md:inline-grid gap-1">
        <TabsTrigger
          value="hiragana"
          className="text-base md:text-lg font-semibold py-2.5 px-5 text-foreground/70 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
        >
          히라가나
        </TabsTrigger>
        <TabsTrigger
          value="katakana"
          className="text-base md:text-lg font-semibold py-2.5 px-5 text-foreground/70 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
        >
          가타카나
        </TabsTrigger>
        <TabsTrigger
          value="quiz"
          className="text-base md:text-lg font-semibold py-2.5 px-5 text-foreground/70 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
        >
          발음 퀴즈
        </TabsTrigger>
      </TabsList>

      <TabsContent value="hiragana" className="space-y-6">
        <KanaIntro
          title="히라가나(ひらがな)"
          desc="일본어의 가장 기본 글자. 토씨, 어미, 일본 고유어에 사용."
        />
        <KanaSection title="기본 50음도" rows={hiragana.gojuon} />
        <KanaSection title="탁음 · 반탁음" rows={hiragana.dakuten} />
        <KanaSection title="요음" rows={hiragana.youon} cols={3} />
      </TabsContent>

      <TabsContent value="katakana" className="space-y-6">
        <KanaIntro
          title="가타카나(カタカナ)"
          desc="외래어, 의성어, 강조 표현에 쓰는 글자. 히라가나와 짝이 됨."
        />
        <KanaSection title="기본 50음도" rows={katakana.gojuon} />
        <KanaSection title="탁음 · 반탁음" rows={katakana.dakuten} />
        <KanaSection title="요음" rows={katakana.youon} cols={3} />
      </TabsContent>

      <TabsContent value="quiz">
        <KanaQuiz hiragana={hiragana} katakana={katakana} />
      </TabsContent>
    </Tabs>
  );
}

function KanaIntro({ title, desc }: { title: string; desc: string }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-start gap-3">
        <div className="text-3xl">🌸</div>
        <div>
          <div className="font-semibold">{title}</div>
          <div className="text-sm text-muted-foreground">{desc}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function KanaSection({
  title,
  rows,
  cols = 5,
}: {
  title: string;
  rows: KanaCell[][];
  cols?: number;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={cn("grid gap-1.5", cols === 3 ? "grid-cols-3" : "grid-cols-5")}
        >
          {rows.flat().map((c, i) => (
            <KanaCellTile key={`${title}-${i}`} cell={c} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function KanaCellTile({ cell }: { cell: KanaCell }) {
  if (!cell.k) {
    return <div className="aspect-square rounded-lg bg-muted/30" />;
  }
  return (
    <button
      type="button"
      onClick={() => speakJa(cell.k, { rate: 0.85 })}
      className="group aspect-square rounded-lg border border-border bg-card flex flex-col items-center justify-center transition-all hover:border-primary hover:bg-primary/5 hover:-translate-y-0.5"
      title={`${cell.r} (${cell.ko})`}
    >
      <div className="text-2xl md:text-3xl jp font-bold leading-none">{cell.k}</div>
      <div className="mt-1 text-[10px] text-muted-foreground">{cell.r}</div>
      <Volume2 className="h-2.5 w-2.5 mt-0.5 text-primary opacity-0 group-hover:opacity-100" />
    </button>
  );
}

/* ------------------ 가나 발음 퀴즈 ------------------ */
function KanaQuiz({ hiragana, katakana }: { hiragana: KanaSet; katakana: KanaSet }) {
  const pool = useMemo(() => {
    const all: KanaCell[] = [];
    for (const set of [hiragana, katakana]) {
      for (const group of [set.gojuon, set.dakuten, set.youon]) {
        for (const row of group) {
          for (const c of row) if (c.k) all.push(c);
        }
      }
    }
    return all;
  }, [hiragana, katakana]);

  const [round, setRound] = useState(0);
  const [score, setScore] = useState({ ok: 0, ng: 0 });
  const [chosen, setChosen] = useState<number | null>(null);

  const quiz = useMemo(() => buildQuiz(pool), [pool, round]);

  function pick(i: number) {
    if (chosen !== null) return;
    setChosen(i);
    const correct = quiz.choices[i].k === quiz.target.k;
    setScore((s) => (correct ? { ...s, ok: s.ok + 1 } : { ...s, ng: s.ng + 1 }));
    setTimeout(() => {
      setChosen(null);
      setRound((r) => r + 1);
    }, 1200);
  }

  const total = score.ok + score.ng;
  const pct = total > 0 ? Math.round((score.ok / total) * 100) : 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <Badge variant="secondary">정답률 {pct}%</Badge>
            <span className="text-sm text-muted-foreground">
              ✅ {score.ok} · ❌ {score.ng}
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={() => { setScore({ ok: 0, ng: 0 }); setRound((r) => r + 1); }}>
            <RotateCw className="h-3.5 w-3.5 mr-1" /> 리셋
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">아래 가나의 로마자 표기는?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center gap-3 py-6 bg-primary/5 rounded-xl">
            <div className="text-7xl jp font-bold">{quiz.target.k}</div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => speakJa(quiz.target.k, { rate: 0.85 })}
              aria-label="발음"
            >
              <Volume2 className="h-5 w-5" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {quiz.choices.map((c, i) => {
              const isAnswer = c.k === quiz.target.k;
              const isChosen = i === chosen;
              return (
                <button
                  key={i}
                  onClick={() => pick(i)}
                  disabled={chosen !== null}
                  className={cn(
                    "rounded-lg border px-4 py-3 text-left transition-colors",
                    chosen === null && "hover:border-primary hover:bg-accent",
                    chosen !== null && isAnswer && "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40",
                    chosen !== null && isChosen && !isAnswer && "border-red-500 bg-red-50 dark:bg-red-950/40"
                  )}
                >
                  <span className="flex items-center justify-between">
                    <span className="text-base font-medium">{c.r}</span>
                    {chosen !== null && isAnswer && <Check className="h-4 w-4 text-emerald-600" />}
                    {chosen !== null && isChosen && !isAnswer && <X className="h-4 w-4 text-red-600" />}
                  </span>
                </button>
              );
            })}
          </div>
          {chosen !== null && (
            <div className="text-center text-sm text-muted-foreground">
              {quiz.target.k} = <span className="font-medium">{quiz.target.r}</span> ({quiz.target.ko})
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function buildQuiz(pool: KanaCell[]) {
  const target = pool[Math.floor(Math.random() * pool.length)];
  const distract = shuffle(pool.filter((c) => c.r !== target.r)).slice(0, 3);
  const choices = shuffle([target, ...distract]);
  return { target, choices };
}
