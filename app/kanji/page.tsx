import { kanjiItems } from "@/lib/data";
import { KanjiListClient } from "./list-client";

export const metadata = { title: "한자 — JLPT N3" };

export default function KanjiPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">한자</h1>
        <p className="text-muted-foreground mt-1">
          노베이스부터 N3까지 {kanjiItems.length}자. N5(기초) → N4(중급) → N3(고급) 순으로 단계별
          학습이 가능합니다. 한국 한자음을 함께 표기해 한국인 학습자에게 친숙합니다.
        </p>
      </div>
      <KanjiListClient items={kanjiItems} />
    </div>
  );
}
