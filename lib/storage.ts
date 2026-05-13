"use client";
import type { PersistedState, VocabProgress, ItemProgress, MockResult, Settings } from "./types";

const KEY = "jlpt-n3:v1";
const CURRENT_VERSION = 1;

const DEFAULT_STATE: PersistedState = {
  version: CURRENT_VERSION,
  vocabulary: {},
  grammar: {},
  kanji: {},
  mockTests: [],
  settings: { furiganaOn: true, dailyGoal: 20, autoPlayAudio: false },
  streak: { lastDate: "", days: 0 },
};

export function loadState(): PersistedState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as PersistedState;
    if (!parsed.version || parsed.version < CURRENT_VERSION) {
      return migrate(parsed);
    }
    return { ...DEFAULT_STATE, ...parsed };
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveState(state: PersistedState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {}
}

function migrate(old: any): PersistedState {
  return { ...DEFAULT_STATE, ...old, version: CURRENT_VERSION };
}

export function resetState() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}

export function getVocabProgress(id: string): VocabProgress {
  const s = loadState();
  return (
    s.vocabulary[id] ?? {
      seen: 0,
      correct: 0,
      wrong: 0,
      box: 1,
      nextReview: new Date(0).toISOString(),
    }
  );
}

export function updateVocabProgress(id: string, result: "known" | "fuzzy" | "unknown") {
  const s = loadState();
  const p = s.vocabulary[id] ?? {
    seen: 0,
    correct: 0,
    wrong: 0,
    box: 1,
    nextReview: new Date(0).toISOString(),
  };
  p.seen += 1;
  if (result === "known") {
    p.correct += 1;
    p.box = Math.min(5, p.box + 1);
  } else if (result === "fuzzy") {
    p.box = Math.max(1, p.box);
  } else {
    p.wrong += 1;
    p.box = 1;
  }
  // Leitner 간격: 1, 2, 4, 7, 14 일
  const intervals = [1, 2, 4, 7, 14];
  const days = intervals[Math.min(p.box - 1, 4)];
  p.nextReview = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  s.vocabulary[id] = p;
  touchStreak(s);
  saveState(s);
  return p;
}

export function toggleVocabBookmark(id: string): boolean {
  const s = loadState();
  const p = s.vocabulary[id] ?? {
    seen: 0,
    correct: 0,
    wrong: 0,
    box: 1,
    nextReview: new Date(0).toISOString(),
  };
  p.bookmarked = !p.bookmarked;
  s.vocabulary[id] = p;
  saveState(s);
  return !!p.bookmarked;
}

export function updateItemProgress(
  bucket: "grammar" | "kanji",
  id: string,
  delta: { seenInc?: number; masteryDelta?: number; bookmark?: boolean }
) {
  const s = loadState();
  const p: ItemProgress = s[bucket][id] ?? { seen: 0, mastery: 0 };
  if (delta.seenInc) p.seen += delta.seenInc;
  if (typeof delta.masteryDelta === "number") {
    p.mastery = Math.max(0, Math.min(100, p.mastery + delta.masteryDelta));
  }
  if (typeof delta.bookmark === "boolean") p.bookmarked = delta.bookmark;
  s[bucket][id] = p;
  touchStreak(s);
  saveState(s);
  return p;
}

export function addMockResult(r: MockResult) {
  const s = loadState();
  s.mockTests.unshift(r);
  s.mockTests = s.mockTests.slice(0, 30); // 최근 30개만
  touchStreak(s);
  saveState(s);
}

export function updateSettings(patch: Partial<Settings>) {
  const s = loadState();
  s.settings = { ...s.settings, ...patch };
  saveState(s);
}

function touchStreak(s: PersistedState) {
  const today = new Date().toISOString().slice(0, 10);
  if (s.streak.lastDate === today) return;
  const yest = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  if (s.streak.lastDate === yest) {
    s.streak.days += 1;
  } else {
    s.streak.days = 1;
  }
  s.streak.lastDate = today;
}
