"use client";
import { Volume2 } from "lucide-react";
import { kanaToKorean } from "@/lib/kana-to-korean";
import { speakJa } from "@/lib/speak";
import { cn } from "@/lib/utils";

/**
 * 일본어 텍스트 옆에 [한국어 발음] 을 표시하고, 클릭 시 TTS 재생.
 * 모바일에서 충분히 큰 터치 타깃(최소 36~44px)을 확보.
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
        "inline-flex items-center gap-1.5 rounded-md text-primary bg-primary/5 hover:bg-primary/15 active:bg-primary/25 transition-colors border border-primary/20",
        // 모바일에서 충분히 큰 터치 영역, 데스크탑에서는 살짝 작게
        size === "sm"
          ? "px-2.5 py-1.5 text-sm md:px-2 md:py-1 md:text-xs min-h-[36px] md:min-h-0"
          : "px-3 py-2 text-base md:px-2.5 md:py-1.5 md:text-sm min-h-[40px] md:min-h-0",
        className
      )}
      aria-label="발음 듣기"
      title="클릭하면 발음을 들을 수 있습니다"
    >
      <Volume2
        className={cn(size === "sm" ? "h-4 w-4 md:h-3.5 md:w-3.5" : "h-5 w-5 md:h-4 md:w-4")}
      />
      <span className="font-medium">[{korean}]</span>
    </button>
  );
}
