"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";
import type { QuizQuestion } from "@/lib/types";

export function MultipleChoice({
  question,
  onAnswer,
  showExplanation = true,
}: {
  question: QuizQuestion;
  onAnswer: (correct: boolean, choiceIndex: number) => void;
  showExplanation?: boolean;
}) {
  const [chosen, setChosen] = useState<number | null>(null);

  function pick(i: number) {
    if (chosen !== null) return;
    setChosen(i);
    onAnswer(i === question.answerIndex, i);
  }

  return (
    <Card className="w-full">
      <CardContent className="p-6 space-y-4">
        <div className="text-base font-medium jp whitespace-pre-wrap">{question.prompt}</div>
        <div className="grid gap-2">
          {question.choices.map((c, i) => {
            const isAnswer = i === question.answerIndex;
            const isChosen = i === chosen;
            return (
              <button
                key={i}
                onClick={() => pick(i)}
                disabled={chosen !== null}
                className={cn(
                  "w-full text-left rounded-lg border border-border px-4 py-3 transition-colors",
                  chosen === null && "hover:border-primary hover:bg-accent",
                  chosen !== null && isAnswer && "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40",
                  chosen !== null && isChosen && !isAnswer && "border-red-500 bg-red-50 dark:bg-red-950/40"
                )}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "h-6 w-6 rounded-full border flex items-center justify-center text-xs",
                      chosen !== null && isAnswer && "bg-emerald-500 border-emerald-500 text-white",
                      chosen !== null && isChosen && !isAnswer && "bg-red-500 border-red-500 text-white",
                      chosen === null && "border-border text-muted-foreground"
                    )}
                  >
                    {chosen !== null && isAnswer ? (
                      <Check className="h-3 w-3" />
                    ) : chosen !== null && isChosen && !isAnswer ? (
                      <X className="h-3 w-3" />
                    ) : (
                      ["A", "B", "C", "D"][i]
                    )}
                  </span>
                  <span className="jp">{c}</span>
                </div>
              </button>
            );
          })}
        </div>
        {chosen !== null && showExplanation && question.explanation && (
          <div className="rounded-lg bg-muted p-3 text-sm">
            <span className="font-semibold">해설:</span> {question.explanation}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
