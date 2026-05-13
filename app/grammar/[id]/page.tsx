import Link from "next/link";
import { notFound } from "next/navigation";
import { grammarItems } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { GrammarMiniQuiz } from "./mini-quiz";
import { Pronunciation } from "@/components/ui/pronunciation";

export function generateStaticParams() {
  return grammarItems.map((g) => ({ id: g.id }));
}

export default function GrammarDetail({ params }: { params: { id: string } }) {
  const item = grammarItems.find((g) => g.id === params.id);
  if (!item) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/grammar"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> 문법 목록
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <CardTitle className="text-2xl jp">{item.pattern}</CardTitle>
              <p className="text-xl text-primary font-semibold mt-2">{item.meaning}</p>
            </div>
            <Badge variant="secondary">{item.category}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-1">접속</h3>
            <p className="jp">{item.connection}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-1">해설</h3>
            <p className="leading-relaxed">{item.explanation}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">예문</h3>
            <div className="space-y-3">
              {item.examples.map((ex, i) => (
                <div key={i} className="rounded-lg bg-muted p-3">
                  <div className="flex items-start gap-2 flex-wrap">
                    <p className="jp text-base flex-1 min-w-0">{ex.jp}</p>
                    <Pronunciation text={ex.jp} hint={ex.reading ?? ex.jp} />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{ex.ko}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <GrammarMiniQuiz item={item} />
    </div>
  );
}
