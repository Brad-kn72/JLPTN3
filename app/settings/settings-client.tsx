"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { loadState, updateSettings } from "@/lib/storage";
import type { Settings } from "@/lib/types";

export function SettingsClient() {
  const [s, setS] = useState<Settings | null>(null);

  useEffect(() => setS(loadState().settings), []);

  if (!s) return null;

  function save(patch: Partial<Settings>) {
    updateSettings(patch);
    setS((prev) => ({ ...(prev as Settings), ...patch }));
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">하루 목표 단어 수</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-3">
          <input
            type="range"
            min={5}
            max={100}
            step={5}
            value={s.dailyGoal}
            onChange={(e) => save({ dailyGoal: parseInt(e.target.value) })}
            className="flex-1 accent-primary"
          />
          <div className="w-20 text-right font-semibold">{s.dailyGoal}단어</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">청해 자동 재생</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">청해 페이지 진입 시 자동 재생</span>
          <Button
            variant={s.autoPlayAudio ? "default" : "outline"}
            onClick={() => save({ autoPlayAudio: !s.autoPlayAudio })}
          >
            {s.autoPlayAudio ? "켜짐" : "꺼짐"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">후리가나 표시</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">단어·예문 위 발음 표기</span>
          <Button
            variant={s.furiganaOn ? "default" : "outline"}
            onClick={() => save({ furiganaOn: !s.furiganaOn })}
          >
            {s.furiganaOn ? "켜짐" : "꺼짐"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
