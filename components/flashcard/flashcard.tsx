"use client";
import { useState, useEffect } from "react";
import type { VocabItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { updateVocabProgress, toggleVocabBookmark, getVocabProgress } from "@/lib/storage";
import { Bookmark, BookmarkCheck, RotateCcw, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Pronunciation } from "@/components/ui/pronunciation";
import { kanaToKorean } from "@/lib/kana-to-korean";
import { speakJa } from "@/lib/speak";

export function Flashcard({
  item,
  onResult,
}: {
  item: VocabItem;
  onResult: (r: "known" | "fuzzy" | "unknown") => void;
}) {
  const [flipped, setFlipped] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    setFlipped(false);
    setBookmarked(!!getVocabProgress(item.id).bookmarked);
  }, [item.id]);

  function handleResult(r: "known" | "fuzzy" | "unknown") {
    updateVocabProgress(item.id, r);
    onResult(r);
  }

  function handleBookmark() {
    const v = toggleVocabBookmark(item.id);
    setBookmarked(v);
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        className="perspective w-full max-w-xl cursor-pointer select-none"
        onClick={() => setFlipped((f) => !f)}
        role="button"
        aria-label="카드 뒤집기"
      >
        <div
          className={cn(
            "relative preserve-3d transition-transform duration-500 w-full h-72",
            flipped && "rotate-y-180"
          )}
        >
          {/* 앞면 */}
          <div className="absolute inset-0 backface-hidden rounded-2xl bg-card border border-border shadow-lg flex flex-col items-center justify-center p-8">
            <Badge variant="secondary" className="mb-3">
              {item.pos}
            </Badge>
            <div className="text-sm text-muted-foreground mb-2 jp">{item.reading}</div>
            <div className="text-5xl md:text-6xl font-bold jp text-foreground tracking-wider">
              {item.word}
            </div>
            <div
              className="mt-3 inline-flex items-center gap-1 text-primary text-base font-medium"
              onClick={(e) => {
                e.stopPropagation();
                speakJa(item.reading);
              }}
            >
              <Volume2 className="h-4 w-4" />
              [{kanaToKorean(item.reading)}]
            </div>
            <div className="absolute bottom-4 right-4 text-xs text-muted-foreground">
              탭하여 뒤집기
            </div>
          </div>
          {/* 뒷면 */}
          <div className="absolute inset-0 rotate-y-180 backface-hidden rounded-2xl bg-primary/10 border border-primary/30 shadow-lg flex flex-col items-center justify-center p-8 text-center">
            <div className="text-3xl font-bold text-primary mb-3">{item.meaning}</div>
            <div className="flex items-center gap-2 mb-2">
              <div className="text-base jp text-foreground/90">{item.example}</div>
              <Pronunciation text={item.example} hint={item.exampleReading ?? item.example} />
            </div>
            <div className="text-sm text-muted-foreground">{item.exampleTranslation}</div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={handleBookmark} aria-label="즐겨찾기">
          {bookmarked ? (
            <BookmarkCheck className="h-4 w-4 text-primary" />
          ) : (
            <Bookmark className="h-4 w-4" />
          )}
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setFlipped((f) => !f)} aria-label="뒤집기">
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2 w-full max-w-xl">
        <Button
          variant="outline"
          className="border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
          onClick={() => handleResult("unknown")}
        >
          모름
        </Button>
        <Button
          variant="outline"
          className="border-amber-300 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950"
          onClick={() => handleResult("fuzzy")}
        >
          헷갈림
        </Button>
        <Button
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
          onClick={() => handleResult("known")}
        >
          안다
        </Button>
      </div>
    </div>
  );
}
