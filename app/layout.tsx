import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Petals } from "@/components/layout/petals";

export const metadata: Metadata = {
  title: "JLPT N3 — 한국인을 위한 일본어능력시험 학습",
  description:
    "JLPT N3 합격을 위한 통합 학습 플랫폼. 어휘·문법·한자·독해·청해·모의고사를 한 곳에서. 최신 개정판 출제 기준 기반.",
  keywords: ["JLPT", "N3", "일본어", "JLPT N3", "일본어능력시험", "한국인", "독학"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col relative">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <Petals />
          <Header />
          <main className="flex-1 container py-8 relative z-10">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
