import { readingPassages } from "@/lib/data";
import { ReadingClient } from "./reading-client";

export const metadata = { title: "독해 — JLPT N3" };

export default function ReadingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">독해</h1>
        <p className="text-muted-foreground mt-1">
          짧은 지문 + 4지선다 형식의 독해 연습. 한국어 번역은 답안 확인 후 노출됩니다.
        </p>
      </div>
      <ReadingClient passages={readingPassages} />
    </div>
  );
}
