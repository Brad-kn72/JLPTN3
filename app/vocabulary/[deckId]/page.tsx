import { notFound } from "next/navigation";
import { vocabularyDecks, getDeckItems } from "@/lib/data";
import { DeckClient } from "./deck-client";

export function generateStaticParams() {
  return vocabularyDecks.map((d) => ({ deckId: d.id }));
}

export default function DeckPage({ params }: { params: { deckId: string } }) {
  const deck = vocabularyDecks.find((d) => d.id === params.deckId);
  if (!deck) notFound();
  const items = getDeckItems(deck.id);
  return <DeckClient deck={deck} items={items} />;
}
