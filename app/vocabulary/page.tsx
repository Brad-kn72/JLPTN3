import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { vocabularyDecks, getDeckItems } from "@/lib/data";
import { ChevronRight } from "lucide-react";

export const metadata = { title: "어휘 — JLPT N3" };

export default function VocabularyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">어휘 단어장</h1>
        <p className="text-muted-foreground mt-1">
          주제별로 묶인 단어장 중 하나를 선택해 플래시카드로 학습합니다.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {vocabularyDecks.map((deck) => {
          const count = getDeckItems(deck.id).length;
          return (
            <Link key={deck.id} href={`/vocabulary/${deck.id}`}>
              <Card className="h-full group transition-all hover:-translate-y-1 hover:shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="text-4xl">{deck.emoji}</div>
                    <Badge variant="secondary">{count}단어</Badge>
                  </div>
                  <CardTitle className="flex items-center gap-2 mt-2">
                    {deck.title}
                    <ChevronRight className="h-4 w-4 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                  </CardTitle>
                  <CardDescription>{deck.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
