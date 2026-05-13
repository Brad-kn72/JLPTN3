"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MultipleChoice } from "@/components/quiz/multiple-choice";
import { grammarItems } from "@/lib/data";
import { updateItemProgress } from "@/lib/storage";
import { shuffle } from "@/lib/utils";
import type { GrammarItem, QuizQuestion } from "@/lib/types";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { loadState } from "@/lib/storage";

export function GrammarMiniQuiz({ item }: { item: GrammarItem }) {
  const [bookmarked, setBookmarked] = useState(() => !!loadState().grammar[item.id]?.bookmarked);
  const [started, setStarted] = useState(false);
  const [q, setQ] = useState<QuizQuestion | null>(null);

  function start() {
    setQ(buildQuestion(item));
    setStarted(true);
  }

  function toggleBookmark() {
    const next = !bookmarked;
    updateItemProgress("grammar", item.id, { bookmark: next });
    setBookmarked(next);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">미니 퀴즈</CardTitle>
          <Button variant="ghost" size="icon" onClick={toggleBookmark}>
            {bookmarked ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!started || !q ? (
          <Button onClick={start} variant="outline" className="w-full">
            퀴즈 시작
          </Button>
        ) : (
          <div className="space-y-3">
            <MultipleChoice
              question={q}
              onAnswer={(correct) => {
                updateItemProgress("grammar", item.id, {
                  seenInc: 1,
                  masteryDelta: correct ? 15 : -5,
                });
              }}
            />
            <Button variant="outline" onClick={start} className="w-full">
              다른 문제
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function buildQuestion(target: GrammarItem): QuizQuestion {
  const others = shuffle(grammarItems.filter((g) => g.id !== target.id)).slice(0, 3);
  const choices = shuffle([target.meaning, ...others.map((o) => o.meaning)]);
  const answerIndex = choices.indexOf(target.meaning);
  return {
    id: `gq-${target.id}-${Date.now()}`,
    prompt: `「${target.pattern}」의 의미로 가장 적절한 것은?`,
    choices,
    answerIndex,
    explanation: target.explanation,
  };
}
