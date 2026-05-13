import { KanaClient } from "./kana-client";
import kanaData from "@/data/kana.json";

export const metadata = { title: "가나 — JLPT N3" };

export default function KanaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">히라가나 · 가타카나</h1>
        <p className="text-muted-foreground mt-1">
          일본어 노베이스부터 시작하는 첫 걸음. 각 글자를 탭하면 발음을 들을 수 있습니다.
        </p>
      </div>
      <KanaClient hiragana={kanaData.hiragana as any} katakana={kanaData.katakana as any} />
    </div>
  );
}
