#!/usr/bin/env node
// translations.json의 역방향(KO→JP) + handwritten.json(추가 KO→JP) 매핑으로
// reading/listening/mock-test의 문제·선택지를 일본어로 변환.
//
// 사용: node scripts/revert-to-japanese.mjs

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const DATA = path.join(ROOT, "data");

const T = JSON.parse(fs.readFileSync(path.join(ROOT, "scripts", "translations.json"), "utf8"));
const H = JSON.parse(fs.readFileSync(path.join(ROOT, "scripts", "handwritten-ja.json"), "utf8"));

const reading = JSON.parse(fs.readFileSync(path.join(DATA, "reading.json"), "utf8"));
const listening = JSON.parse(fs.readFileSync(path.join(DATA, "listening.json"), "utf8"));
const mock = JSON.parse(fs.readFileSync(path.join(DATA, "mock-test.json"), "utf8"));

// 역방향 매핑 구성 (translations.json: JP → KO 이므로 반대로)
const koToJa = { prompts: {}, choices: {} };
for (const [jp, ko] of Object.entries(T.prompts)) koToJa.prompts[ko] = jp;
for (const [jp, ko] of Object.entries(T.choices)) koToJa.choices[ko] = jp;

// 손글씨용 추가 매핑 병합
for (const [ko, jp] of Object.entries(H.prompts || {})) koToJa.prompts[ko] = jp;
for (const [ko, jp] of Object.entries(H.choices || {})) koToJa.choices[ko] = jp;

let promptRev = 0, promptMissed = 0;
let choiceRev = 0, choiceMissed = 0;
const missingPrompts = new Set();
const missingChoices = new Set();

function processItem(it) {
  for (const q of it.questions) {
    const jp = koToJa.prompts[q.prompt];
    if (jp) { q.prompt = jp; promptRev++; }
    else if (/[가-힣]/.test(q.prompt)) { missingPrompts.add(q.prompt); promptMissed++; }
    q.choices = q.choices.map(c => {
      const j = koToJa.choices[c];
      if (j) { choiceRev++; return j; }
      if (/[가-힣]/.test(c)) { missingChoices.add(c); choiceMissed++; }
      return c;
    });
  }
}

reading.items.forEach(processItem);
listening.items.forEach(processItem);

// mock test의 sections.questions도 처리
for (const t of mock.tests) {
  for (const sec of t.sections) {
    processItem(sec);
  }
}

fs.writeFileSync(path.join(DATA, "reading.json"), JSON.stringify(reading, null, 2));
fs.writeFileSync(path.join(DATA, "listening.json"), JSON.stringify(listening, null, 2));
fs.writeFileSync(path.join(DATA, "mock-test.json"), JSON.stringify(mock, null, 2));

console.log("==== Revert summary ====");
console.log(`Prompts : reverted ${promptRev}, missing ${promptMissed}`);
console.log(`Choices : reverted ${choiceRev}, missing ${choiceMissed}`);
if (missingPrompts.size > 0) {
  console.log("\n--- Missing prompts (still Korean) ---");
  [...missingPrompts].forEach(p => console.log(" ", p));
}
if (missingChoices.size > 0) {
  console.log("\n--- Missing choices (still Korean) ---");
  [...missingChoices].slice(0,80).forEach(c => console.log(" ", c));
  if (missingChoices.size > 80) console.log(`  ... +${missingChoices.size-80} more`);
}
