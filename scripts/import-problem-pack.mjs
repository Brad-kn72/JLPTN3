#!/usr/bin/env node
// jlpt_n3_additional_problem_pack_full.json → 사이트 데이터로 통합
//  - reading_sets / listening_sets → reading.json / listening.json 에 신규 추가
//  - mock_tests (refs) → vocab/grammar 4지선다 + reading/listening 첫 문제를 풀어서 mock-test.json 에 추가

import fs from "node:fs";
import path from "node:path";

const SRC = process.argv[2];
if (!SRC) { console.error("Usage: node scripts/import-problem-pack.mjs <pack.json>"); process.exit(1); }

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const DATA = path.join(ROOT, "data");

const pack = JSON.parse(fs.readFileSync(SRC, "utf8"));
const reading = JSON.parse(fs.readFileSync(path.join(DATA, "reading.json"), "utf8"));
const listening = JSON.parse(fs.readFileSync(path.join(DATA, "listening.json"), "utf8"));
const mock = JSON.parse(fs.readFileSync(path.join(DATA, "mock-test.json"), "utf8"));

// 인덱스 구축
const vqMap = new Map(pack.vocabulary_questions.map(q => [q.id, q]));
const gqMap = new Map(pack.grammar_questions.map(q => [q.id, q]));
const rqMap = new Map(pack.reading_sets.map(q => [q.id, q]));
const lqMap = new Map(pack.listening_sets.map(q => [q.id, q]));

/* === reading 추가 === */
const usedReadingIds = new Set(reading.items.map(r => r.id));
let rCount = 200;
function nextRid() { let id; do { id = `r${String(rCount++).padStart(3,"0")}`; } while (usedReadingIds.has(id)); return id; }
const packIdToReadingId = {};
let readingAdded = 0;

for (const rs of pack.reading_sets) {
  const newId = nextRid();
  usedReadingIds.add(newId);
  reading.items.push({
    id: newId,
    title: rs.title,
    body: rs.passage_jp,
    translation: rs.translation_ko,
    questions: rs.questions.map((q, i) => ({
      id: `${newId}q${i+1}`,
      prompt: q.question_jp,
      choices: q.options,
      answerIndex: q.answer_index,
      explanation: q.explanation_ko,
    })),
  });
  packIdToReadingId[rs.id] = newId;
  readingAdded++;
}

/* === listening 추가 === */
const usedListeningIds = new Set(listening.items.map(l => l.id));
let lCount = 200;
function nextLid() { let id; do { id = `l${String(lCount++).padStart(3,"0")}`; } while (usedListeningIds.has(id)); return id; }
const packIdToListeningId = {};
let listeningAdded = 0;

for (const ls of pack.listening_sets) {
  const newId = nextLid();
  usedListeningIds.add(newId);
  listening.items.push({
    id: newId,
    title: ls.title,
    script: ls.script_jp,
    translation: ls.translation_ko,
    questions: ls.questions.map((q, i) => ({
      id: `${newId}q${i+1}`,
      prompt: q.question_jp,
      choices: q.options,
      answerIndex: q.answer_index,
      explanation: q.explanation_ko,
    })),
  });
  packIdToListeningId[ls.id] = newId;
  listeningAdded++;
}

/* === mock_tests 추가 (refs → 실제 문제) === */
const usedMockIds = new Set(mock.tests.map(t => t.id));
let mCount = 20;
function nextMid() { let id; do { id = `mock${mCount++}`; } while (usedMockIds.has(id)); return id; }
let mockAdded = 0;

for (const m of pack.mock_tests) {
  const sec = m.sections;
  const sections = [];

  // 어휘 4지선다
  if (sec.vocabulary_question_ids?.length) {
    const qs = sec.vocabulary_question_ids
      .map(id => vqMap.get(id))
      .filter(Boolean)
      .map((q, i) => ({
        id: `${m.id}-v${i+1}`,
        prompt: `${q.instruction_jp}\n${q.question_jp}`,
        choices: q.options,
        answerIndex: q.answer_index,
        explanation: q.explanation_ko,
      }));
    if (qs.length) sections.push({ id: "s1", title: "言語知識 - 語彙", type: "vocabulary", questions: qs });
  }

  // 문법 4지선다
  if (sec.grammar_question_ids?.length) {
    const qs = sec.grammar_question_ids
      .map(id => gqMap.get(id))
      .filter(Boolean)
      .map((q, i) => ({
        id: `${m.id}-g${i+1}`,
        prompt: `${q.instruction_jp}\n${q.question_jp}`,
        choices: q.options,
        answerIndex: q.answer_index,
        explanation: q.explanation_ko,
      }));
    if (qs.length) sections.push({ id: "s2", title: "言語知識 - 文法", type: "grammar", questions: qs });
  }

  // 독해 — 각 reading의 모든 문제 임베드 (지문 + 문제)
  if (sec.reading_set_ids?.length) {
    const qs = [];
    let i = 1;
    for (const rid of sec.reading_set_ids) {
      const rs = rqMap.get(rid);
      if (!rs) continue;
      for (const q of rs.questions) {
        qs.push({
          id: `${m.id}-r${i++}`,
          prompt: `[${rs.title}]\n${rs.passage_jp}\n\n${q.question_jp}`,
          choices: q.options,
          answerIndex: q.answer_index,
          explanation: q.explanation_ko,
        });
      }
    }
    if (qs.length) sections.push({ id: "s3", title: "読解", type: "reading", questions: qs });
  }

  // 청해 — 동일하게 스크립트 + 문제
  if (sec.listening_set_ids?.length) {
    const qs = [];
    let i = 1;
    for (const lid of sec.listening_set_ids) {
      const ls = lqMap.get(lid);
      if (!ls) continue;
      for (const q of ls.questions) {
        qs.push({
          id: `${m.id}-l${i++}`,
          prompt: `[${ls.title}] スクリプト: ${ls.script_jp}\n\n${q.question_jp}`,
          choices: q.options,
          answerIndex: q.answer_index,
          explanation: q.explanation_ko,
        });
      }
    }
    if (qs.length) sections.push({ id: "s4", title: "聴解", type: "listening", questions: qs });
  }

  if (sections.length) {
    const newId = nextMid();
    usedMockIds.add(newId);
    mock.tests.push({
      id: newId,
      title: m.title,
      duration: 50,
      sections,
    });
    mockAdded++;
  }
}

fs.writeFileSync(path.join(DATA, "reading.json"), JSON.stringify(reading, null, 2));
fs.writeFileSync(path.join(DATA, "listening.json"), JSON.stringify(listening, null, 2));
fs.writeFileSync(path.join(DATA, "mock-test.json"), JSON.stringify(mock, null, 2));

console.log("==== Problem pack import summary ====");
console.log(`Reading  : +${readingAdded} sets → total ${reading.items.length}`);
console.log(`Listening: +${listeningAdded} sets → total ${listening.items.length}`);
console.log(`Mock     : +${mockAdded} tests → total ${mock.tests.length}`);
