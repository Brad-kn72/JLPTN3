import { notFound } from "next/navigation";
import { mockTests } from "@/lib/data";
import { MockRunner } from "./runner";

export function generateStaticParams() {
  return mockTests.map((t) => ({ sessionId: t.id }));
}

export default function MockSessionPage({ params }: { params: { sessionId: string } }) {
  const test = mockTests.find((t) => t.id === params.sessionId);
  if (!test) notFound();
  return <MockRunner test={test} />;
}
