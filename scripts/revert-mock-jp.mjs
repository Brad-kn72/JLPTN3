#!/usr/bin/env node
// mock-test.json의 자동생성된 한국어 prompt/choice 패턴을 일본어로 일괄 치환.
// reading/listening의 잔존 한국어도 함께 처리.

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const DATA = path.join(ROOT, "data");

const mock = JSON.parse(fs.readFileSync(path.join(DATA, "mock-test.json"), "utf8"));
const reading = JSON.parse(fs.readFileSync(path.join(DATA, "reading.json"), "utf8"));
const listening = JSON.parse(fs.readFileSync(path.join(DATA, "listening.json"), "utf8"));
const vocab = JSON.parse(fs.readFileSync(path.join(DATA, "vocabulary.json"), "utf8"));

// 단어 뜻 (한국어) 매핑 — choice 한국어 뜻에 대응
const meaningToKorean = new Map(); // word|reading -> korean meaning (그대로 둠)

// Prompt 변환 규칙 (정규식 → 치환)
const PROMPT_RULES = [
  // Vocab quiz: 「予定」(よてい) 의 한국어 뜻은?
  [/^「(.+?)」\((.+?)\)\s*의\s*한국어\s*뜻은\?$/u, (m, w, r) => `「${w}」(${r}) の意味は次のうちどれですか。`],
  // Grammar quiz: 「～ように」 의 의미로 가장 적절한 것은?
  [/^「(.+?)」\s*의\s*의미로\s*가장\s*적절한\s*것은\?$/u, (m, p) => `「${p}」 の意味として最も適切なものはどれですか。`],
  // Mock auto-gen reading prefix: [Title] 스크립트: body...\n\n질문
  [/^\[(.+?)\]\s*스크립트:\s*([\s\S]*?)\.\.\.\n\n([\s\S]*)$/u, (m, title, body, q) => `[${title}] スクリプト:${body}...\n\n${q}`],
  // Plain "스크립트:" prefix anywhere
  [/스크립트:/g, "スクリプト:"],
];

let promptRewrites = 0;

function transformPrompt(p) {
  for (const [re, fn] of PROMPT_RULES) {
    if (typeof fn === "function") {
      const r = re.exec(p);
      if (r) { promptRewrites++; return fn(...r); }
    } else {
      const before = p;
      p = p.replace(re, fn);
      if (p !== before) promptRewrites++;
    }
  }
  return p;
}

function processItem(it) {
  for (const q of it.questions) {
    if (/[가-힣]/.test(q.prompt)) {
      const newP = transformPrompt(q.prompt);
      if (newP !== q.prompt) q.prompt = newP;
    }
  }
}

// Mock의 sections 처리
for (const t of mock.tests) {
  for (const sec of t.sections) processItem(sec);
}
// reading/listening은 이미 거의 끝났지만 잔존 처리
reading.items.forEach(processItem);
listening.items.forEach(processItem);

fs.writeFileSync(path.join(DATA, "mock-test.json"), JSON.stringify(mock, null, 2));
fs.writeFileSync(path.join(DATA, "reading.json"), JSON.stringify(reading, null, 2));
fs.writeFileSync(path.join(DATA, "listening.json"), JSON.stringify(listening, null, 2));

// 잔존 한국어 prompt/choices 카운트
const hasKo = s => /[가-힣]/.test(s);
let rKo = 0, lKo = 0, mKo = 0;
for (const it of reading.items) for (const q of it.questions) {
  if (hasKo(q.prompt) || q.choices.some(hasKo)) rKo++;
}
for (const it of listening.items) for (const q of it.questions) {
  if (hasKo(q.prompt) || q.choices.some(hasKo)) lKo++;
}
for (const t of mock.tests) for (const sec of t.sections) for (const q of sec.questions) {
  if (hasKo(q.prompt) || q.choices.some(hasKo)) mKo++;
}

console.log(`Prompt rewrites: ${promptRewrites}`);
console.log(`Remaining Korean: reading ${rKo}, listening ${lKo}, mock ${mKo}`);
