import Link from "next/link";
import { mockTests } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, GraduationCap, FileQuestion } from "lucide-react";

export const metadata = { title: "모의고사 — JLPT N3" };

export default function MockTestPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">모의고사</h1>
        <p className="text-muted-foreground mt-1">
          타이머와 영역별 점수, 자동 채점·해설을 제공합니다. 일정 시간을 정해놓고 도전해 보세요.
        </p>
      </div>

      <div className="grid gap-4">
        {mockTests.map((t) => {
          const totalQuestions = t.sections.reduce((sum, s) => sum + s.questions.length, 0);
          return (
            <Card key={t.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <GraduationCap className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle>{t.title}</CardTitle>
                      <CardDescription className="mt-1 flex items-center gap-3">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {t.duration}분
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <FileQuestion className="h-3.5 w-3.5" />
                          {totalQuestions}문항
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                  <Button asChild>
                    <Link href={`/mock-test/${t.id}`}>시험 시작</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {t.sections.map((s) => (
                    <Badge key={s.id} variant="secondary">
                      {s.title} · {s.questions.length}문
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
