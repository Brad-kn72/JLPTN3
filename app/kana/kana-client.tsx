"use client";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn, shuffle } from "@/lib/utils";
import { speakJa } from "@/lib/speak";
import { KANA_EXAMPLES } from "@/lib/kana-examples";
import { Volume2, RotateCw, Check, X } from "lucide-react";

type KanaCell = { k: string; r: string; ko: string };
type KanaSet = {
  gojuon: KanaCell[][];
  dakuten: KanaCell[][];
  youon: KanaCell[][];
};

interface KanaQuizQuestion {
  id: string;
  category: "hiragana_basic" | "katakana_basic" | "dakuten_handakuten" | "youon" | "word_pronunciation";
  question: string;
  options: string[];
  answer_index: number;
  answer_romaji: string;
  meaning_ko?: string;
  explanation_ko?: string;
}

export function KanaClient({
  hiragana,
  katakana,
  quizQuestions,
}: {
  hiragana: KanaSet;
  katakana: KanaSet;
  quizQuestions: KanaQuizQuestion[];
}) {
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
        <KanaQuiz questions={quizQuestions} />
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
        <CardTitle className="text-base md:text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            "grid gap-2 md:gap-3",
            cols === 3 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-3 sm:grid-cols-5"
          )}
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
    return <div className="rounded-lg bg-muted/20 min-h-[120px]" />;
  }
  const example = KANA_EXAMPLES[cell.k];

  function playKana(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    speakJa(cell.k, { rate: 0.85 });
  }
  function playExample(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (example) speakJa(example.word, { rate: 0.9 });
  }

  return (
    <button
      type="button"
      onClick={playKana}
      className="group relative rounded-xl border-2 border-border bg-card hover:border-primary hover:bg-primary/5 active:bg-primary/10 transition-all p-3 md:p-4 flex flex-col items-center text-center touch-manipulation min-h-[140px] md:min-h-[170px] select-none"
      title={`${cell.r} (${cell.ko}) — 탭하면 발음 재생`}
      aria-label={`${cell.k} ${cell.r} 발음 듣기`}
    >
      {/* 큰 가나 글자 */}
      <div className="text-5xl md:text-7xl jp font-bold leading-none mt-1">
        {cell.k}
      </div>

      {/* 로마자 + 한국어 발음 */}
      <div className="mt-2 flex items-center gap-1.5 text-xs md:text-sm">
        <span className="font-mono font-semibold text-primary">{cell.r}</span>
        <span className="text-muted-foreground">·</span>
        <span className="text-foreground/80 font-medium">{cell.ko}</span>
      </div>

      {/* 예시 단어 (탭하면 별도 발음) */}
      {example && (
        <div
          role="button"
          tabIndex={0}
          onClick={playExample}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") playExample(e as any); }}
          className="mt-2 md:mt-3 w-full px-2 py-1.5 rounded-md bg-secondary/60 dark:bg-secondary/40 hover:bg-secondary active:bg-secondary cursor-pointer transition-colors"
          aria-label={`예시 단어 ${example.word} 발음 듣기`}
        >
          <div className="text-xs md:text-sm jp font-semibold truncate">
            {example.word}
          </div>
          <div className="text-[10px] md:text-xs text-muted-foreground truncate mt-0.5">
            {example.meaning}
          </div>
        </div>
      )}

      {/* 발음 아이콘 - 탭 가능 영역임을 시각적으로 알림 */}
      <Volume2 className="absolute top-2 right-2 h-3.5 w-3.5 md:h-4 md:w-4 text-primary/40 group-hover:text-primary transition-colors" />
    </button>
  );
}

/* ------------------ 가나 발음 퀴즈 (220 문제 풀) ------------------ */
const CATEGORY_LABEL: Record<string, string> = {
  all: "전체",
  hiragana_basic: "히라가나 기본",
  katakana_basic: "가타카나 기본",
  dakuten_handakuten: "탁음·반탁음",
  youon: "요음",
  word_pronunciation: "단어 발음",
};

function KanaQuiz({ questions }: { questions: KanaQuizQuestion[] }) {
  const [category, setCategory] = useState<string>("all");
  const [round, setRound] = useState(0);
  const [score, setScore] = useState({ ok: 0, ng: 0 });
  const [chosen, setChosen] = useState<number | null>(null);
  const [orderRandom, setOrderRandom] = useState(true);

  const pool = useMemo(() => {
    let arr = category === "all" ? questions : questions.filter((q) => q.category === category);
    if (orderRandom) arr = shuffle(arr);
    return arr;
  }, [questions, category, orderRandom, round === -1 ? 0 : 0]); // pool은 카테고리 변경 시 재구성

  const current = pool[round % pool.length];

  function pick(i: number) {
    if (chosen !== null || !current) return;
    setChosen(i);
    const correct = i === current.answer_index;
    setScore((s) => (correct ? { ...s, ok: s.ok + 1 } : { ...s, ng: s.ng + 1 }));
    setTimeout(() => {
      setChosen(null);
      setRound((r) => r + 1);
    }, 1300);
  }

  function reset() {
    setScore({ ok: 0, ng: 0 });
    setRound(0);
    setChosen(null);
  }

  const total = score.ok + score.ng;
  const pct = total > 0 ? Math.round((score.ok / total) * 100) : 0;

  const cats = ["all", "hiragana_basic", "katakana_basic", "dakuten_handakuten", "youon", "word_pronunciation"];
  const catCounts: Record<string, number> = { all: questions.length };
  for (const q of questions) catCounts[q.category] = (catCounts[q.category] || 0) + 1;

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Badge variant="secondary">정답률 {pct}%</Badge>
            <span className="text-sm text-muted-foreground">
              ✅ {score.ok} · ❌ {score.ng} · 풀이 {total}
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={reset}>
            <RotateCw className="h-3.5 w-3.5 mr-1" /> 리셋
          </Button>
        </CardContent>
      </Card>

      {/* 카테고리 선택 */}
      <div className="flex flex-wrap gap-2">
        {cats.map((c) => (
          <Button
            key={c}
            variant={category === c ? "default" : "outline"}
            size="sm"
            onClick={() => { setCategory(c); reset(); }}
          >
            {CATEGORY_LABEL[c]} <span className="ml-1.5 text-[10px] opacity-70">{catCounts[c] ?? 0}</span>
          </Button>
        ))}
      </div>

      {!current ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            문제가 준비되지 않았습니다.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {current.category === "word_pronunciation"
                ? "아래 단어의 발음은?"
                : "아래 가나의 로마자 표기는?"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center gap-3 py-6 bg-primary/5 rounded-xl">
              <div className={cn(
                "jp font-bold",
                current.category === "word_pronunciation" ? "text-4xl md:text-5xl" : "text-7xl md:text-8xl"
              )}>
                {current.question}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => speakJa(current.question, { rate: 0.85 })}
                aria-label="발음"
                className="h-11 w-11"
              >
                <Volume2 className="h-5 w-5" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {current.options.map((c, i) => {
                const isAnswer = i === current.answer_index;
                const isChosen = i === chosen;
                return (
                  <button
                    key={i}
                    onClick={() => pick(i)}
                    disabled={chosen !== null}
                    className={cn(
                      "rounded-lg border-2 px-4 py-3 text-left transition-colors min-h-[48px]",
                      chosen === null && "hover:border-primary hover:bg-accent",
                      chosen !== null && isAnswer && "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40",
                      chosen !== null && isChosen && !isAnswer && "border-red-500 bg-red-50 dark:bg-red-950/40",
                      chosen !== null && !isAnswer && !isChosen && "opacity-60",
                      chosen === null && "border-border"
                    )}
                  >
                    <span className="flex items-center justify-between">
                      <span className="text-base font-mono font-medium">{c}</span>
                      {chosen !== null && isAnswer && <Check className="h-4 w-4 text-emerald-600" />}
                      {chosen !== null && isChosen && !isAnswer && <X className="h-4 w-4 text-red-600" />}
                    </span>
                  </button>
                );
              })}
            </div>
            {chosen !== null && (
              <div className="rounded-lg bg-muted p-3 text-sm space-y-1">
                <div>
                  <span className="font-semibold">{current.question}</span> →{" "}
                  <span className="font-mono text-primary">{current.answer_romaji}</span>
                  {current.meaning_ko && (
                    <span className="text-muted-foreground"> ({current.meaning_ko})</span>
                  )}
                </div>
                {current.explanation_ko && (
                  <div className="text-xs text-muted-foreground">{current.explanation_ko}</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
