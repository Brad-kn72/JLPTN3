import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="text-8xl mb-4">🌸</div>
      <h1 className="text-3xl font-bold mb-2">페이지를 찾을 수 없습니다</h1>
      <p className="text-muted-foreground mb-6">주소를 다시 확인하시거나, 홈으로 돌아가 주세요.</p>
      <Button asChild>
        <Link href="/">홈으로</Link>
      </Button>
    </div>
  );
}
