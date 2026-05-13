import { ProgressClient } from "./progress-client";

export const metadata = { title: "진도 — JLPT N3" };

export default function ProgressPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">학습 진도</h1>
        <p className="text-muted-foreground mt-1">
          영역별 진행률, 최근 모의고사 결과, 약점 영역을 한눈에 확인하세요.
        </p>
      </div>
      <ProgressClient />
    </div>
  );
}
