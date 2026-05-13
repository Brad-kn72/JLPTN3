"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MultipleChoice } from "@/components/quiz/multiple-choice";
import type { ListeningPassage } from "@/lib/types";
import { Play, Pause, Eye, EyeOff } from "lucide-react";

export function ListeningClient({ passages }: { passages: ListeningPassage[] }) {
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

function PassagePanel({ passage }: { passage: ListeningPassage }) {
  const [showScript, setShowScript] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});

  function speak() {
    if (typeof window === "undefined") return;
    if (playing) {
      window.speechSynthesis.cancel();
      setPlaying(false);
      return;
    }
    const u = new SpeechSynthesisUtterance(passage.script);
    u.lang = "ja-JP";
    u.rate = 0.95;
    u.onend = () => setPlaying(false);
    u.onerror = () => setPlaying(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
    setPlaying(true);
  }

  const answered = Object.keys(answers).length;
  const correct = Object.values(answers).filter(Boolean).length;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">{passage.title}</CardTitle>
          <Badge variant="secondary">청해</Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          {passage.audioUrl ? (
            <audio controls src={passage.audioUrl} className="w-full" />
          ) : (
            <Button onClick={speak} className="w-full">
              {playing ? (
                <>
                  <Pause className="mr-2 h-4 w-4" /> 중지
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" /> 음성 재생 (브라우저 TTS)
                </>
              )}
            </Button>
          )}

          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowScript((s) => !s)}>
              {showScript ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
              스크립트
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowTranslation((s) => !s)}>
              {showTranslation ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
              번역
            </Button>
          </div>

          {showScript && (
            <div className="rounded-lg bg-muted p-3 text-sm jp whitespace-pre-wrap leading-relaxed">
              {passage.script}
            </div>
          )}
          {showTranslation && (
            <div className="rounded-lg bg-primary/10 p-3 text-sm whitespace-pre-wrap leading-relaxed">
              {passage.translation}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div className="text-sm text-muted-foreground">
          문제 {passage.questions.length}개 · 정답 {correct}/{answered}
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
