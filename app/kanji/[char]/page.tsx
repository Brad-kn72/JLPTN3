import Link from "next/link";
import { notFound } from "next/navigation";
import { kanjiItems } from "@/lib/data";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { Pronunciation } from "@/components/ui/pronunciation";

export function generateStaticParams() {
  return kanjiItems.map((k) => ({ char: encodeURIComponent(k.char) }));
}

export default function KanjiDetail({ params }: { params: { char: string } }) {
  const decoded = decodeURIComponent(params.char);
  const item = kanjiItems.find((k) => k.char === decoded);
  if (!item) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/kanji"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> 한자 목록
      </Link>

      <Card>
        <CardContent className="p-8 grid gap-6 md:grid-cols-[auto_1fr] items-center">
          <div className="flex flex-col items-center">
            <Badge variant="outline" className="mb-2">JLPT {item.level}</Badge>
            <div className="text-9xl jp font-bold leading-none">{item.char}</div>
            <div className="mt-3 text-primary text-2xl font-bold">{item.koreanReading}</div>
          </div>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {item.meanings.map((m) => (
                <Badge key={m} variant="secondary" className="text-sm">{m}</Badge>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Info label="음독 (音読み)">
                <div className="jp">{item.onyomi.length > 0 ? item.onyomi.join(", ") : "—"}</div>
              </Info>
              <Info label="훈독 (訓読み)">
                <div className="jp">{item.kunyomi.length > 0 ? item.kunyomi.join(", ") : "—"}</div>
              </Info>
              <Info label="획수">
                <div>{item.strokes}획</div>
              </Info>
              <Info label="부수">
                <div className="jp">{item.radical}</div>
              </Info>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-semibold">이 한자가 포함된 단어</h2>
        </CardHeader>
        <CardContent className="space-y-2">
          {item.examples.map((ex, i) => (
            <div key={i} className="flex items-baseline justify-between py-2 border-b border-border last:border-0 gap-2">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-lg jp font-semibold">{ex.word}</span>
                <span className="text-sm text-muted-foreground jp">{ex.reading}</span>
                <Pronunciation text={ex.word} hint={ex.reading} />
              </div>
              <span className="text-sm text-foreground/80 shrink-0">{ex.meaning}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-muted p-3">
      <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</div>
      <div className="mt-1 font-medium">{children}</div>
    </div>
  );
}
