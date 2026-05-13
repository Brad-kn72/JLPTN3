"use client";
import { Volume2 } from "lucide-react";
import { kanaToKorean } from "@/lib/kana-to-korean";
import { speakJa } from "@/lib/speak";
import { cn } from "@/lib/utils";

/**
 * 일본어 텍스트 옆에 [한국어 발음] 을 표시하고, 클릭 시 TTS 재생.
 */
export function Pronunciation({
  text,
  hint,
  className,
  size = "sm",
}: {
  text: string;
  /** text에 한자가 섞여 있을 때 발음 변환용 카나 텍스트(보통 reading). */
  hint?: string;
  className?: string;
  size?: "sm" | "md";
}) {
  const korean = kanaToKorean(hint ?? text);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        speakJa(hint ?? text);
      }}
      className={cn(
        "inline-flex items-center gap-1 rounded-md text-primary hover:bg-primary/10 px-1.5 py-0.5 transition-colors",
        size === "sm" ? "text-xs" : "text-sm",
        className
      )}
      aria-label="발음 듣기"
      title="클릭하면 발음을 들을 수 있습니다"
    >
      <Volume2 className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
      <span>[{korean}]</span>
    </button>
  );
}
