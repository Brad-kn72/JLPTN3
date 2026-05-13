"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MultipleChoice } from "@/components/quiz/multiple-choice";
import type { ReadingPassage } from "@/lib/types";

export function ReadingClient({ passages }: { passages: ReadingPassage[] }) {
  const [openId, setOpenId] = useState<string | null>(passages[0]?.id ?? null);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {passages.map((p) => (
          <Button
            key={p.id}
            variant={openId === p.id ? "default" : "outline"}
            size="sm"
            onClick={() => setOpenId(p.id)}
          >
            {p.title}
          </Button>
        ))}
      </div>

      {passages
        .filter((p) => p.id === openId)
        .map((p) => (
          <PassagePanel key={p.id} passage={p} />
        ))}
    </div>
  );
}

function PassagePanel({ passage }: { passage: ReadingPassage }) {
  const [showTranslation, setShowTranslation] = useState(false);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});

  const total = passage.questions.length;
  const answered = Object.keys(answers).length;
  const correct = Object.values(answers).filter(Boolean).length;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">{passage.title}</CardTitle>
          <Badge variant="secondary">독해</Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="jp leading-relaxed whitespace-pre-wrap">{passage.body}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTranslation((s) => !s)}
            className="w-full"
          >
            {showTranslation ? "번역 숨기기" : "한국어 번역 보기"}
          </Button>
          {showTranslation && (
            <div className="rounded-lg bg-muted p-3 text-sm leading-relaxed whitespace-pre-wrap">
              {passage.translation}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div className="text-sm text-muted-foreground">
          문제 {total}개 · 정답 {correct}/{answered}
        </div>
        {passage.questions.map((q) => (
          <MultipleChoice
            key={q.id}
            question={q}
            onAnswer={(c) => setAnswers((a) => ({ ...a, [q.id]: c }))}
          />
        ))}
      </div>
    </div>
  );
}
