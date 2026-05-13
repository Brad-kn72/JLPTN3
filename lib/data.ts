import vocabData from "@/data/vocabulary.json";
import grammarData from "@/data/grammar.json";
import kanjiData from "@/data/kanji.json";
import readingData from "@/data/reading.json";
import listeningData from "@/data/listening.json";
import mockTestData from "@/data/mock-test.json";
import type {
  VocabDeck,
  VocabItem,
  GrammarItem,
  KanjiItem,
  ReadingPassage,
  ListeningPassage,
  MockTest,
} from "./types";

export const vocabularyDecks: VocabDeck[] = vocabData.decks as VocabDeck[];
export const vocabularyItems: VocabItem[] = vocabData.items as VocabItem[];

export const vocabularyMap: Record<string, VocabItem> = Object.fromEntries(
  vocabularyItems.map((v) => [v.id, v])
);

export function getDeckItems(deckId: string): VocabItem[] {
  const deck = vocabularyDecks.find((d) => d.id === deckId);
  if (!deck) return [];
  return deck.items.map((id) => vocabularyMap[id]).filter(Boolean);
}

export const grammarItems: GrammarItem[] = grammarData.items as GrammarItem[];
export const kanjiItems: KanjiItem[] = kanjiData.items as KanjiItem[];
export const readingPassages: ReadingPassage[] = readingData.items as ReadingPassage[];
export const listeningPassages: ListeningPassage[] = listeningData.items as ListeningPassage[];
export const mockTests: MockTest[] = mockTestData.tests as MockTest[];

export function countAll() {
  return {
    vocab: vocabularyItems.length,
    grammar: grammarItems.length,
    kanji: kanjiItems.length,
    reading: readingPassages.length,
    listening: listeningPassages.length,
    mock: mockTests.length,
  };
}
