"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { GrammarItem } from "@/lib/types";
import { Search } from "lucide-react";

const CATEGORIES = ["전체", "추측", "원인이유", "역접양보", "변화", "수동사역", "조건", "시간", "기타"] as const;

export function GrammarListClient({ items }: { items: GrammarItem[] }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>("전체");

  const filtered = useMemo(() => {
    return items.filter((it) => {
      if (cat !== "전체" && it.category !== cat) return false;
      if (q) {
        const t = `${it.pattern} ${it.meaning} ${it.explanation}`.toLowerCase();
        if (!t.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [items, q, cat]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="문형·의미·해설로 검색"
            className="w-full h-10 pl-9 pr-3 rounded-md border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <Button
            key={c}
            variant={cat === c ? "default" : "outline"}
            size="sm"
            onClick={() => setCat(c)}
          >
            {c}
          </Button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map((it) => (
          <Link key={it.id} href={`/grammar/${it.id}`}>
            <Card className="h-full transition-all hover:-translate-y-0.5 hover:shadow-md">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="text-lg font-bold jp">{it.pattern}</div>
                  <Badge variant="secondary" className="text-[10px] shrink-0">
                    {it.category}
                  </Badge>
                </div>
                <div className="text-sm text-foreground/80">{it.meaning}</div>
                <div className="text-xs text-muted-foreground line-clamp-2">{it.explanation}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            검색 결과가 없습니다.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
