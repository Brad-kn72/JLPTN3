#!/usr/bin/env node
// 1) 독해/청해 제목 뒤의 숫자 제거, 중복 시 "(2), (3)..." 부여
// 2) 모의고사 제목 통일: "모의고사 N회"

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const DATA = path.join(ROOT, "data");
const r = JSON.parse(fs.readFileSync(path.join(DATA, "reading.json"), "utf8"));
const l = JSON.parse(fs.readFileSync(path.join(DATA, "listening.json"), "utf8"));
const m = JSON.parse(fs.readFileSync(path.join(DATA, "mock-test.json"), "utf8"));

/* 독해/청해: 끝 숫자 제거 + 중복 시 (n) */
function stripTrailingNumber(title) {
  // 끝의 " 숫자" 또는 " (숫자)" 또는 " #숫자" 패턴 제거
  return title
    .replace(/\s*[\(（]\s*\d+\s*[\)）]\s*$/u, "") // " (1)" or "（1）"
    .replace(/\s+\d+\s*$/u, "")                      // " 1"
    .trim();
}

function dedupeTitles(items) {
  // 1단계: 모든 title을 stripTrailingNumber로 base 통일
  const baseTitles = items.map(it => stripTrailingNumber(it.title));
  // 2단계: base count
  const count = {};
  baseTitles.forEach(t => count[t] = (count[t]||0)+1);
  // 3단계: 중복 안 되는 건 그대로, 중복이면 등장 순서로 첫 번째는 base, 두 번째부터 (2), (3)...
  const seen = {};
  for (let i = 0; i < items.length; i++) {
    const base = baseTitles[i];
    if (count[base] === 1) {
      items[i].title = base;
    } else {
      seen[base] = (seen[base]||0) + 1;
      const n = seen[base];
      items[i].title = n === 1 ? base : `${base} (${n})`;
    }
  }
}

dedupeTitles(r.items);
dedupeTitles(l.items);

/* 모의고사: "모의고사 N회" 통일 (기존 부제 보존 옵션) */
m.tests.forEach((t, i) => {
  // 1~5번은 기존에 "모의고사 N회 — 부제" 형식 사용 — 그대로 유지하되 번호만 통일
  const idx = i + 1;
  // 부제(em dash 뒤) 추출
  const subtitleMatch = t.title.match(/[—–-]\s*(.+)$/);
  const subtitle = subtitleMatch ? subtitleMatch[1].trim() : null;
  if (subtitle && !/^\d+$/.test(subtitle)) {
    t.title = `모의고사 ${idx}회 — ${subtitle}`;
  } else {
    t.title = `모의고사 ${idx}회`;
  }
});

fs.writeFileSync(path.join(DATA, "reading.json"), JSON.stringify(r, null, 2));
fs.writeFileSync(path.join(DATA, "listening.json"), JSON.stringify(l, null, 2));
fs.writeFileSync(path.join(DATA, "mock-test.json"), JSON.stringify(m, null, 2));

console.log("==== Titles cleaned ====");
console.log(`Reading sample: ${r.items.slice(0,5).map(i => i.title).join(' | ')}`);
console.log(`Listening sample: ${l.items.slice(0,5).map(i => i.title).join(' | ')}`);
console.log(`Mock titles:`);
m.tests.forEach(t => console.log(`  ${t.id}: ${t.title}`));
