import type { VocabItem, VocabProgress } from "./types";
import { loadState } from "./storage";

/**
 * 단어 학습 큐 생성: 복습 기한 지난 단어 우선, 그 다음 새 단어
 */
export function buildStudyQueue(items: VocabItem[], max = 20): VocabItem[] {
  const state = loadState();
  const now = Date.now();
  const due: VocabItem[] = [];
  const fresh: VocabItem[] = [];
  for (const it of items) {
    const p = state.vocabulary[it.id];
    if (!p) {
      fresh.push(it);
    } else if (new Date(p.nextReview).getTime() <= now) {
      due.push(it);
    }
  }
  return [...due, ...fresh].slice(0, max);
}

export function masteryOf(p?: VocabProgress): number {
  if (!p || p.seen === 0) return 0;
  return Math.round((p.correct / p.seen) * 100);
}

export function summarizeProgress(items: VocabItem[]) {
  const state = loadState();
  let seen = 0;
  let mastered = 0;
  for (const it of items) {
    const p = state.vocabulary[it.id];
    if (p && p.seen > 0) seen += 1;
    if (p && p.box >= 4) mastered += 1;
  }
  return { total: items.length, seen, mastered };
}
