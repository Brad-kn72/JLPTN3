"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { MockTest, QuizQuestion } from "@/lib/types";
import { addMockResult } from "@/lib/storage";
import { Clock, ChevronLeft, ChevronRight, Flag } from "lucide-react";
import { cn } from "@/lib/utils";

type Phase = "intro" | "running" | "result";

export function MockRunner({ test }: { test: MockTest }) {
  const allQuestions = useMemo(() => {
    const arr: { sec: string; secType: string; q: QuizQuestion }[] = [];
    for (const s of test.sections) {
      for (const q of s.questions) {
        arr.push({ sec: s.title, secType: s.type, q });
      }
    }
    return arr;
  }, [test]);

  const [phase, setPhase] = useState<Phase>("intro");
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(allQuestions.length).fill(null)
  );
  const [index, setIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(test.duration * 60);
  const [startedAt, setStartedAt] = useState<number | null>(null);

  useEffect(() => {
    if (phase !== "running") return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(id);
          finalize();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  function start() {
    setPhase("running");
    setStartedAt(Date.now());
  }

  function finalize() {
    setPhase("result");
    const byArea: Record<string, { correct: number; total: number }> = {};
    let totalCorrect = 0;
    allQuestions.forEach(({ sec, q }, i) => {
      byArea[sec] ??= { correct: 0, total: 0 };
      byArea[sec].total += 1;
      if (answers[i] === q.answerIndex) {
        byArea[sec].correct += 1;
        totalCorrect += 1;
      }
    });
    addMockResult({
      id: `r-${Date.now()}`,
      testId: test.id,
      takenAt: new Date().toISOString(),
      durationSec: startedAt ? Math.floor((Date.now() - startedAt) / 1000) : 0,
      byArea,
      total: { correct: totalCorrect, total: allQuestions.length },
    });
  }

  if (phase === "intro") {
    return <Intro test={test} onStart={start} total={allQuestions.length} />;
  }

  if (phase === "result") {
    return <Result test={test} answers={answers} questions={allQuestions} />;
  }

  const current = allQuestions[index];
  const min = Math.floor(secondsLeft / 60);
  const sec = secondsLeft % 60;

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-xs text-muted-foreground">{current.sec}</div>
            <div className="font-semibold">{test.title}</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-primary/10 text-primary font-mono">
              <Clock className="h-4 w-4" />
              {String(min).padStart(2, "0")}:{String(sec).padStart(2, "0")}
            </div>
            <Button variant="destructive" size="sm" onClick={finalize}>
              <Flag className="h-4 w-4 mr-1" /> 제출
            </Button>
          </div>
        </CardContent>
      </Card>

      <Progress value={((index + 1) / allQuestions.length) * 100} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            문제 {index + 1} / {allQuestions.length}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-medium jp whitespace-pre-wrap mb-4">{current.q.prompt}</p>
          <div className="grid gap-2">
            {current.q.choices.map((c, i) => {
              const chosen = answers[index] === i;
              return (
                <button
                  key={i}
                  onClick={() =>
                    setAnswers((a) => {
                      const b = [...a];
                      b[index] = i;
                      return b;
                    })
                  }
                  className={cn(
                    "w-full text-left rounded-lg border px-4 py-3 transition-colors",
                    chosen
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50 hover:bg-accent"
                  )}
                >
                  <span className="inline-flex items-center gap-3">
                    <span
                      className={cn(
                        "h-6 w-6 rounded-full border flex items-center justify-center text-xs",
                        chosen ? "bg-primary border-primary text-primary-foreground" : ""
                      )}
                    >
                      {["A", "B", "C", "D"][i]}
                    </span>
                    <span className="jp">{c}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between gap-2">
        <Button
          variant="outline"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> 이전
        </Button>
        {index === allQuestions.length - 1 ? (
          <Button onClick={finalize}>채점하기</Button>
        ) : (
          <Button onClick={() => setIndex((i) => Math.min(allQuestions.length - 1, i + 1))}>
            다음 <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>

      {/* 문제 번호 그리드 */}
      <Card>
        <CardContent className="p-4">
          <div className="text-xs text-muted-foreground mb-2">문제 이동</div>
          <div className="grid grid-cols-10 gap-1.5">
            {allQuestions.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={cn(
                  "h-8 rounded text-xs font-medium border",
                  i === index && "ring-2 ring-primary",
                  answers[i] !== null
                    ? "bg-primary/20 border-primary/40 text-primary"
                    : "bg-muted border-border text-muted-foreground"
                )}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Intro({ test, onStart, total }: { test: MockTest; onStart: () => void; total: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{test.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Info label="제한 시간">{test.duration}분</Info>
          <Info label="총 문항">{total}문항</Info>
        </div>
        <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
          시작하면 타이머가 작동합니다. 중간에 「제출」을 누르거나 마지막 문제에서 「채점하기」를
          누르면 결과를 확인할 수 있습니다.
        </div>
        <Button onClick={onStart} className="w-full" size="lg">
          시험 시작
        </Button>
      </CardContent>
    </Card>
  );
}

function Result({
  test,
  answers,
  questions,
}: {
  test: MockTest;
  answers: (number | null)[];
  questions: { sec: string; secType: string; q: QuizQuestion }[];
}) {
  const byArea: Record<string, { correct: number; total: number }> = {};
  let totalCorrect = 0;
  questions.forEach(({ sec, q }, i) => {
    byArea[sec] ??= { correct: 0, total: 0 };
    byArea[sec].total += 1;
    if (answers[i] === q.answerIndex) {
      byArea[sec].correct += 1;
      totalCorrect += 1;
    }
  });
  const totalPct = Math.round((totalCorrect / questions.length) * 100);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>📊 채점 결과 — {test.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="text-6xl font-bold text-primary">{totalPct}점</div>
            <div className="text-sm text-muted-foreground mt-1">
              {totalCorrect} / {questions.length} 정답
            </div>
          </div>

          <div className="space-y-3 mt-4">
            {Object.entries(byArea).map(([area, s]) => {
              const pct = Math.round((s.correct / s.total) * 100);
              return (
                <div key={area} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{area}</span>
                    <span className="font-medium">
                      {s.correct}/{s.total} ({pct}%)
                    </span>
                  </div>
                  <Progress value={pct} />
                </div>
              );
            })}
          </div>

          <div className="flex gap-2 mt-6">
            <Button asChild className="flex-1">
              <Link href="/mock-test">목록으로</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/progress">진도 보기</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">📝 오답 노트</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {questions.map(({ sec, q }, i) => {
            const correct = answers[i] === q.answerIndex;
            if (correct) return null;
            return (
              <div key={q.id} className="rounded-lg border border-border p-3">
                <div className="flex justify-between gap-2 mb-2">
                  <Badge variant="secondary" className="text-[10px]">{sec}</Badge>
                  <Badge variant="outline" className="text-[10px]">
                    {i + 1}번
                  </Badge>
                </div>
                <p className="jp font-medium text-sm whitespace-pre-wrap mb-2">{q.prompt}</p>
                <div className="text-sm">
                  <span className="text-red-600">선택: </span>
                  <span className="jp">
                    {answers[i] !== null ? q.choices[answers[i] as number] : "(미응답)"}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-emerald-600">정답: </span>
                  <span className="jp">{q.choices[q.answerIndex]}</span>
                </div>
                {q.explanation && (
                  <div className="text-xs text-muted-foreground mt-2">{q.explanation}</div>
                )}
              </div>
            );
          })}
          {questions.every((_, i) => answers[i] === questions[i].q.answerIndex) && (
            <div className="text-center py-6 text-muted-foreground">
              🌸 모든 문제 정답! 훌륭합니다.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-muted p-3">
      <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</div>
      <div className="mt-1 font-semibold">{children}</div>
    </div>
  );
}
