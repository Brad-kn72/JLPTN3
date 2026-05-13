"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { loadState } from "@/lib/storage";
import { countAll } from "@/lib/data";
import { Flame, Target, CheckCircle2 } from "lucide-react";

export function DashboardSummary() {
  const [data, setData] = useState<{
    vocabSeen: number;
    vocabMastered: number;
    streak: number;
    dailyGoal: number;
    todayCount: number;
  } | null>(null);

  useEffect(() => {
    const s = loadState();
    const today = new Date().toISOString().slice(0, 10);
    let vocabSeen = 0;
    let vocabMastered = 0;
    let todayCount = 0;
    for (const id in s.vocabulary) {
      const p = s.vocabulary[id];
      if (p.seen > 0) vocabSeen++;
      if (p.box >= 4) vocabMastered++;
      // 오늘 본 단어 계산은 단순화
    }
    todayCount =
      s.streak.lastDate === today ? Math.min(s.settings.dailyGoal, vocabSeen) : 0;
    setData({
      vocabSeen,
      vocabMastered,
      streak: s.streak.days,
      dailyGoal: s.settings.dailyGoal,
      todayCount,
    });
  }, []);

  const counts = countAll();
  const vocabPercent = data ? Math.round((data.vocabSeen / counts.vocab) * 100) : 0;
  const masteredPercent = data ? Math.round((data.vocabMastered / counts.vocab) * 100) : 0;

  return (
    <section className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">오늘의 목표</CardTitle>
          <Target className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data?.todayCount ?? 0}{" "}
            <span className="text-sm font-normal text-muted-foreground">/ {data?.dailyGoal ?? 20} 단어</span>
          </div>
          <Progress
            className="mt-2"
            value={data ? (data.todayCount / data.dailyGoal) * 100 : 0}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">연속 학습일</CardTitle>
          <Flame className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data?.streak ?? 0}일</div>
          <p className="text-xs text-muted-foreground mt-1">매일 조금이라도 학습하면 유지됩니다</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">어휘 진도</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{vocabPercent}%</div>
          <p className="text-xs text-muted-foreground mt-1">
            마스터 {masteredPercent}% · 학습 {vocabPercent}%
          </p>
          <Progress className="mt-2" value={vocabPercent} />
        </CardContent>
      </Card>
    </section>
  );
}
