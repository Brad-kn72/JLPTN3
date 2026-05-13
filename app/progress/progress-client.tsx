"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { loadState, resetState } from "@/lib/storage";
import { countAll, vocabularyItems, grammarItems, kanjiItems } from "@/lib/data";
import type { PersistedState } from "@/lib/types";
import { Flame, Trash2 } from "lucide-react";

export function ProgressClient() {
  const [state, setState] = useState<PersistedState | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => setState(loadState()), [tick]);

  if (!state) return null;

  const counts = countAll();

  const vocabSeen = Object.values(state.vocabulary).filter((p) => p.seen > 0).length;
  const vocabMastered = Object.values(state.vocabulary).filter((p) => p.box >= 4).length;
  const vocabBookmarked = Object.entries(state.vocabulary)
    .filter(([, p]) => p.bookmarked)
    .map(([id]) => vocabularyItems.find((v) => v.id === id))
    .filter(Boolean) as typeof vocabularyItems;

  const grammarSeen = Object.values(state.grammar).filter((p) => p.seen > 0).length;
  const kanjiSeen = Object.values(state.kanji).filter((p) => p.seen > 0).length;

  const vocabPct = Math.round((vocabSeen / counts.vocab) * 100);
  const grammarPct = Math.round((grammarSeen / counts.grammar) * 100);
  const kanjiPct = Math.round((kanjiSeen / counts.kanji) * 100);
  const masterPct = Math.round((vocabMastered / counts.vocab) * 100);

  const lastMocks = state.mockTests.slice(0, 5);

  function reset() {
    if (confirm("학습 기록을 모두 초기화하시겠습니까?")) {
      resetState();
      setTick((t) => t + 1);
    }
  }

  return (
    <div className="space-y-6">
      {/* 상단 통계 */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="연속 학습일" value={`${state.streak.days}일`} icon={<Flame className="h-4 w-4 text-orange-500" />} />
        <StatCard label="어휘" value={`${vocabSeen}/${counts.vocab}`} sub={`마스터 ${vocabMastered}`} />
        <StatCard label="문법" value={`${grammarSeen}/${counts.grammar}`} />
        <StatCard label="한자" value={`${kanjiSeen}/${counts.kanji}`} />
      </div>

      {/* 영역별 진행률 */}
      <Card>
        <CardHeader>
          <CardTitle>영역별 진행률</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Row label="어휘 학습" pct={vocabPct} />
          <Row label="어휘 마스터 (Box 4+)" pct={masterPct} />
          <Row label="문법" pct={grammarPct} />
          <Row label="한자" pct={kanjiPct} />
        </CardContent>
      </Card>

      {/* 최근 모의고사 */}
      <Card>
        <CardHeader>
          <CardTitle>최근 모의고사</CardTitle>
        </CardHeader>
        <CardContent>
          {lastMocks.length === 0 ? (
            <div className="text-sm text-muted-foreground py-6 text-center">
              아직 응시한 모의고사가 없습니다.
            </div>
          ) : (
            <div className="space-y-3">
              {lastMocks.map((m) => {
                const pct = Math.round((m.total.correct / m.total.total) * 100);
                return (
                  <div key={m.id} className="rounded-lg border border-border p-3">
                    <div className="flex justify-between items-center mb-2 flex-wrap gap-1">
                      <div className="text-sm text-muted-foreground">
                        {new Date(m.takenAt).toLocaleString("ko-KR")}
                      </div>
                      <div className="font-bold text-primary">{pct}점</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(m.byArea).map(([area, s]) => (
                        <Badge key={area} variant="outline" className="text-xs">
                          {area}: {s.correct}/{s.total}
                        </Badge>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 즐겨찾기 */}
      {vocabBookmarked.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>⭐ 즐겨찾기한 단어</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2">
            {vocabBookmarked.map((v) => (
              <div key={v!.id} className="rounded-lg border border-border p-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-lg jp font-bold">{v!.word}</span>
                  <span className="text-xs text-muted-foreground jp">{v!.reading}</span>
                </div>
                <div className="text-sm text-foreground/80">{v!.meaning}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">데이터 관리</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={reset}>
            <Trash2 className="h-4 w-4 mr-2" />
            모든 학습 기록 초기화
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            데이터는 브라우저에만 저장됩니다. 다른 기기와는 동기화되지 않습니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  icon?: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{label}</span>
          {icon}
        </div>
        <div className="text-2xl font-bold mt-1">{value}</div>
        {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
      </CardContent>
    </Card>
  );
}

function Row({ label, pct }: { label: string; pct: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className="font-medium">{pct}%</span>
      </div>
      <Progress value={pct} />
    </div>
  );
}
