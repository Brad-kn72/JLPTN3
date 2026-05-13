import { grammarItems } from "@/lib/data";
import { GrammarListClient } from "./list-client";

export const metadata = { title: "문법 — JLPT N3" };

export default function GrammarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">문법</h1>
        <p className="text-muted-foreground mt-1">
          N3 빈출 문형 {grammarItems.length}개. 카테고리별로 필터하거나 검색해 보세요.
        </p>
      </div>
      <GrammarListClient items={grammarItems} />
    </div>
  );
}
