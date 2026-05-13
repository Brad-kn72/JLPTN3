import { listeningPassages } from "@/lib/data";
import { ListeningClient } from "./listening-client";

export const metadata = { title: "청해 — JLPT N3" };

export default function ListeningPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">청해</h1>
        <p className="text-muted-foreground mt-1">
          브라우저의 음성 합성 기능으로 스크립트를 들어볼 수 있습니다. 처음에는 스크립트를 가리고
          문제를 풀어보세요.
        </p>
      </div>
      <ListeningClient passages={listeningPassages} />
    </div>
  );
}
