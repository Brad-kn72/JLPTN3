"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Flashcard } from "@/components/flashcard/flashcard";
import { MultipleChoice } from "@/components/quiz/multiple-choice";
import { Pronunciation } from "@/components/ui/pronunciation";
import { buildStudyQueue, masteryOf, summarizeProgress } from "@/lib/srs";
import { loadState } from "@/lib/storage";
import { shuffle } from "@/lib/utils";
import type { VocabDeck, VocabItem, QuizQuestion } from "@/lib/types";
import { ArrowLeft, RotateCw } from "lucide-react";

export function DeckClient({ deck, items }: { deck: VocabDeck; items: VocabItem[] }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/vocabulary" className="hover:text-primary inline-flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> 단어장 목록
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="mr-2">{deck.emoji}</span>
            {deck.title}
          </h1>
          <p className="text-muted-foreground mt-1">{deck.description}</p>
        </div>
        <Badge variant="secondary" className="text-sm">{items.length}단어</Badge>
      </div>

      <Tabs defaultValue="flashcard">
        <TabsList>
          <TabsTrigger value="flashcard">플래시카드</TabsTrigger>
          <TabsTrigger value="list">단어 목록</TabsTrigger>
          <TabsTrigger value="quiz">퀴즈</TabsTrigger>
        </TabsList>

        <TabsContent value="flashcard">
          <FlashcardSession items={items} />
        </TabsContent>

        <TabsContent value="list">
          <VocabList items={items} />
        </TabsContent>

        <TabsContent value="quiz">
          <QuizSession items={items} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function FlashcardSession({ items }: { items: VocabItem[] }) {
  const [queue, setQueue] = useState<VocabItem[]>([]);
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState({ known: 0, fuzzy: 0, unknown: 0 });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    setQueue(buildStudyQueue(items, Math.min(items.length, 20)));
    setIndex(0);
    setDone({ known: 0, fuzzy: 0, unknown: 0 });
  }, [items, version]);

  if (queue.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          학습할 단어가 준비 중입니다. 잠시만 기다려 주세요.
        </CardContent>
      </Card>
    );
  }

  if (index >= queue.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>🌸 세션 완료!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg bg-emerald-100 dark:bg-emerald-950/40 p-4">
              <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                {done.known}
              </div>
              <div className="text-xs text-muted-foreground mt-1">안다</div>
            </div>
            <div className="rounded-lg bg-amber-100 dark:bg-amber-950/40 p-4">
              <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                {done.fuzzy}
              </div>
              <div className="text-xs text-muted-foreground mt-1">헷갈림</div>
            </div>
            <div className="rounded-lg bg-red-100 dark:bg-red-950/40 p-4">
              <div className="text-2xl font-bold text-red-700 dark:text-red-400">
                {done.unknown}
              </div>
              <div className="text-xs text-muted-foreground mt-1">모름</div>
            </div>
          </div>
          <Button onClick={() => setVersion((v) => v + 1)} className="w-full">
            <RotateCw className="mr-2 h-4 w-4" />
            다시 학습
          </Button>
        </CardContent>
      </Card>
    );
  }

  const current = queue[index];
  return (
    <div className="space-y-4">
      <Progress value={((index) / queue.length) * 100} />
      <div className="text-center text-sm text-muted-foreground">
        {index + 1} / {queue.length}
      </div>
      <Flashcard
        item={current}
        onResult={(r) => {
          setDone((d) => ({ ...d, [r]: d[r] + 1 }));
          setIndex((i) => i + 1);
        }}
      />
    </div>
  );
}

function VocabList({ items }: { items: VocabItem[] }) {
  const [state, setState] = useState(() => loadState());
  useEffect(() => setState(loadState()), []);
  const summary = summarizeProgress(items);
  const masteryPct = summary.total > 0 ? Math.round((summary.mastered / summary.total) * 100) : 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>마스터 진도</span>
            <span className="font-medium">
              {summary.mastered}/{summary.total} ({masteryPct}%)
            </span>
          </div>
          <Progress value={masteryPct} />
        </CardContent>
      </Card>

      <div className="grid gap-2">
        {items.map((it) => {
          const p = state.vocabulary[it.id];
          const mastery = masteryOf(p);
          return (
            <Card key={it.id}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <div className="text-xl font-bold jp">{it.word}</div>
                    <div className="text-xs text-muted-foreground jp">{it.reading}</div>
                    <Pronunciation text={it.word} hint={it.reading} />
                    <Badge variant="outline" className="text-[10px]">{it.pos}</Badge>
                  </div>
                  <div className="text-sm text-foreground/80">{it.meaning}</div>
                  <div className="text-xs text-muted-foreground jp mt-1 truncate">
                    {it.example} · {it.exampleTranslation}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs text-muted-foreground">정답률</div>
                  <div className="font-bold text-primary">{mastery}%</div>
                  {p?.box && (
                    <Badge variant="outline" className="text-[10px] mt-1">
                      Box {p.box}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function QuizSession({ items }: { items: VocabItem[] }) {
  const questions: QuizQuestion[] = useMemo(() => buildQuiz(items), [items]);
  const [version, setVersion] = useState(0);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });

  useEffect(() => {
    setIndex(0);
    setScore({ correct: 0, wrong: 0 });
  }, [version]);

  if (index >= questions.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>퀴즈 완료 🎉</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-3xl font-bold mb-4">
            {score.correct} / {questions.length}
          </div>
          <Button onClick={() => setVersion((v) => v + 1)} className="w-full">
            <RotateCw className="mr-2 h-4 w-4" />
            다시 풀기
          </Button>
        </CardContent>
      </Card>
    );
  }

  const q = questions[index];

  return (
    <div className="space-y-4">
      <Progress value={(index / questions.length) * 100} />
      <div className="text-center text-sm text-muted-foreground">
        {index + 1} / {questions.length} · 정답 {score.correct} / 오답 {score.wrong}
      </div>
      <MultipleChoice
        key={q.id}
        question={q}
        onAnswer={(correct) => {
          setScore((s) =>
            correct ? { ...s, correct: s.correct + 1 } : { ...s, wrong: s.wrong + 1 }
          );
          setTimeout(() => setIndex((i) => i + 1), 1500);
        }}
      />
    </div>
  );
}

function buildQuiz(items: VocabItem[]): QuizQuestion[] {
  if (items.length < 4) return [];
  const subset = shuffle(items).slice(0, Math.min(10, items.length));
  return subset.map((target, idx) => {
    const others = shuffle(items.filter((i) => i.id !== target.id)).slice(0, 3);
    const choices = shuffle([target.meaning, ...others.map((o) => o.meaning)]);
    const answerIndex = choices.indexOf(target.meaning);
    return {
      id: `q-${target.id}-${idx}`,
      prompt: `「${target.word}」(${target.reading})의 한국어 뜻은?`,
      choices,
      answerIndex,
      explanation: `${target.word}(${target.reading}) → ${target.meaning}. 예: ${target.example}`,
    };
  });
}
