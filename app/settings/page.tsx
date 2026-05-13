import { SettingsClient } from "./settings-client";

export const metadata = { title: "설정 — JLPT N3" };

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">설정</h1>
        <p className="text-muted-foreground mt-1">학습 환경을 내 스타일에 맞게 조정하세요.</p>
      </div>
      <SettingsClient />
    </div>
  );
}
