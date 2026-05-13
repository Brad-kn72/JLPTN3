import { Cherry } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border mt-16">
      <div className="container py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Cherry className="h-4 w-4 text-primary" />
          <span>JLPT N3 · 합격을 응원합니다 🌸</span>
        </div>
        <div>최신 개정판(2010~) 출제 기준 기반 · 한국인 학습자용</div>
      </div>
    </footer>
  );
}
