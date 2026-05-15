"use client";
import { Volume2 } from "lucide-react";
import { Button } from "./button";
import { speakJa } from "@/lib/speak";
import { cn } from "@/lib/utils";

export function SpeakButton({
  text,
  size = "icon",
  className,
  label = "발음 듣기",
  rate,
}: {
  text: string;
  size?: "sm" | "icon";
  className?: string;
  label?: string;
  rate?: number;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size={size}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        speakJa(text, { rate });
      }}
      className={cn(
        "text-primary hover:text-primary hover:bg-primary/10",
        // 모바일에서 충분한 터치 타깃 (최소 44x44)
        size === "icon" && "h-11 w-11 md:h-10 md:w-10",
        size === "sm" && "h-10 md:h-9 px-3 md:px-2.5",
        className
      )}
    >
      <Volume2 className={size === "sm" ? "h-4 w-4" : "h-5 w-5 md:h-4 md:w-4"} />
      {size === "sm" && <span className="ml-1.5 text-sm md:text-xs">발음</span>}
    </Button>
  );
}
