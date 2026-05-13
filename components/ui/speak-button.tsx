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
      className={cn("text-primary hover:text-primary hover:bg-primary/10", className)}
    >
      <Volume2 className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
      {size === "sm" && <span className="ml-1 text-xs">발음</span>}
    </Button>
  );
}
