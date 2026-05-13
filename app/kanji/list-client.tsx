"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { JlptLevel, KanjiItem } from "@/lib/types";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

type LevelFilter = "전체" | JlptLevel;

const LEVEL_COLORS: Record<JlptLevel, string> = {
  N5: "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
  N4: "bg-sky-100 text-sky-700 border-sky-300 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800",
  N3: "bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800",
};

export function KanjiListClient({ items }: { items: KanjiItem[] }) {
  const [q, setQ] = useState("");
  const [level, setLevel] = useState<LevelFilter>("전체");

  const counts = useMemo(() => {
    const c: Record<LevelFilter, number> = { 전체: items.length, N5: 0, N4: 0, N3: 0 };
    for (const it of items) c[it.level]++;
    return c;
  }, [items]);

  const filtered = useMemo(() => {
    let arr = items;
    if (level !== "전체") arr = arr.filter((it) => it.level === level);
    if (q) {
      const ql = q.toLowerCase();
      arr = arr.filter((it) =>
        `${it.char} ${it.onyomi.join(" ")} ${it.kunyomi.join(" ")} ${it.koreanReading} ${it.meanings.join(" ")}`
          .toLowerCase()
          .includes(ql)
      );
    }
    // N5 → N4 → N3 순으로 보이게 정렬
    const order: Record<JlptLevel, number> = { N5: 0, N4: 1, N3: 2 };
    return [...arr].sort((a, b) => order[a.level] - order[b.level]);
  }, [items, q, level]);

  const LEVELS: LevelFilter[] = ["전체", "N5", "N4", "N3"];

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="한자·뜻·한국 한자음·음독으로 검색"
          className="w-full h-10 pl-9 pr-3 rounded-md border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {LEVELS.map((l) => (
          <Button
            key={l}
            variant={level === l ? "default" : "outline"}
            size="sm"
            onClick={() => setLevel(l)}
          >
            {l}{" "}
            <span className={cn("ml-1.5 text-[10px] opacity-70")}>{counts[l]}</span>
          </Button>
        ))}
      </div>

      <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
        💡 <strong>학습 순서 안내:</strong> N5(기초) → N4(중급) → N3(고급) 순으로 익히는 것을
        권장합니다. 노베이스라면 N5부터 시작하세요. 색상이 진할수록 난이도가 높습니다.
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {filtered.map((k) => (
          <Link key={k.char} href={`/kanji/${encodeURIComponent(k.char)}`}>
            <Card className="aspect-square transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-primary relative">
              <span
                className={cn(
                  "absolute top-1.5 right-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded border",
                  LEVEL_COLORS[k.level]
                )}
              >
                {k.level}
              </span>
              <CardContent className="p-3 h-full flex flex-col items-center justify-center text-center">
                <div className="text-5xl jp font-bold">{k.char}</div>
                <div className="mt-2 text-xs text-primary font-semibold">{k.koreanReading}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                  {k.meanings.join(", ")}
                </div>
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
