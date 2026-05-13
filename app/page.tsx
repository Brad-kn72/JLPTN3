import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { countAll } from "@/lib/data";
import { ArrowRight, BookOpen, Brain, Headphones, FileText, GraduationCap, Sparkles, Languages } from "lucide-react";
import { DashboardSummary } from "./_dashboard-summary";

const MODULES = [
  {
    href: "/kana",
    title: "가나 (히라가나/가타카나)",
    desc: "노베이스부터 시작 — 50음도, 탁음, 요음 + 발음 퀴즈",
    icon: Languages,
    color: "from-sakura-200 to-sakura-400",
  },
  {
    href: "/vocabulary",
    title: "어휘",
    desc: "N3 핵심 단어 + 플래시카드 + 라이트너 박스 SRS",
    icon: BookOpen,
    color: "from-sakura-300 to-sakura-500",
  },
  {
    href: "/grammar",
    title: "문법",
    desc: "추측·조건·수동사역 등 빈출 문형과 한국어 해설",
    icon: Sparkles,
    color: "from-rose-300 to-rose-500",
  },
  {
    href: "/kanji",
    title: "한자",
    desc: "한국 한자음 매핑으로 한국인 학습자 강점 살리기",
    icon: Brain,
    color: "from-pink-300 to-pink-500",
  },
  {
    href: "/reading",
    title: "독해",
    desc: "지문 + 4지선다, 한국어 번역 확인",
    icon: FileText,
    color: "from-fuchsia-300 to-fuchsia-500",
  },
  {
    href: "/listening",
    title: "청해",
    desc: "스크립트 노출 가능한 청해 연습",
    icon: Headphones,
    color: "from-rose-200 to-rose-400",
  },
  {
    href: "/mock-test",
    title: "모의고사",
    desc: "타이머 + 영역별 점수 + 자동 오답 노트",
    icon: GraduationCap,
    color: "from-sakura-400 to-sakura-600",
  },
];

export default function HomePage() {
  const counts = countAll();
  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-sakura-100 via-background to-sakura-50 dark:from-sakura-900/30 dark:via-background dark:to-sakura-800/20 p-8 md:p-12">
        <div className="absolute -top-10 -right-10 text-9xl opacity-20 select-none">🌸</div>
        <div className="relative max-w-2xl space-y-4">
          <Badge variant="secondary">최신 개정판 기준 · 한국인 학습자 전용</Badge>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
            JLPT <span className="text-primary">N3</span> 합격, 오늘부터.
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            어휘부터 모의고사까지, 흩어진 학습을 한 곳에서. 한국어 해설과 한국 한자음으로
            모국어 강점을 살려 효율적으로 합격하세요.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild size="lg">
              <Link href="/vocabulary">
                지금 학습 시작 <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/mock-test">모의고사 풀기</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 진도 요약 */}
      <DashboardSummary />

      {/* 모듈 그리드 */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-2xl font-bold">학습 모듈</h2>
          <div className="text-sm text-muted-foreground">
            어휘 {counts.vocab} · 문법 {counts.grammar} · 한자 {counts.kanji} · 독해 {counts.reading} · 청해 {counts.listening}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((m) => (
            <Link key={m.href} href={m.href}>
              <Card className="group h-full transition-all hover:-translate-y-1 hover:shadow-md">
                <CardHeader>
                  <div
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${m.color} text-white shadow-md mb-2`}
                  >
                    <m.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="flex items-center gap-2">
                    {m.title}
                    <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                  </CardTitle>
                  <CardDescription>{m.desc}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* 학습 팁 */}
      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">📅 매일 조금씩</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            라이트너 박스 SRS가 적절한 복습 간격을 자동으로 제안합니다. 매일 20단어가 합격의 지름길.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">🈶 한국 한자음 활용</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            모든 한자에 한국식 한자음을 함께 표시해 한자어 어휘를 빠르게 익힐 수 있습니다.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">📝 약점 자동 분석</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            모의고사 결과를 영역별로 분석해, 어느 영역을 더 보강해야 하는지 알려드립니다.
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
