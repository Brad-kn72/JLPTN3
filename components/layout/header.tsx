"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cherry, Menu, X } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "홈" },
  { href: "/kana", label: "가나" },
  { href: "/vocabulary", label: "어휘" },
  { href: "/grammar", label: "문법" },
  { href: "/kanji", label: "한자" },
  { href: "/reading", label: "독해" },
  { href: "/listening", label: "청해" },
  { href: "/mock-test", label: "모의고사" },
  { href: "/progress", label: "진도" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Cherry className="h-6 w-6 text-primary" />
          <span>
            JLPT <span className="text-primary">N3</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {NAV.map((n) => {
            const active = pathname === n.href || (n.href !== "/" && pathname?.startsWith(n.href));
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  active
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="메뉴"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="container flex flex-col py-2">
            {NAV.map((n) => {
              const active = pathname === n.href || (n.href !== "/" && pathname?.startsWith(n.href));
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "px-3 py-3 rounded-md text-sm font-medium",
                    active
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
