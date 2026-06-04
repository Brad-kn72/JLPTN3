#!/usr/bin/env node
// 56개 vocab deck → 24개로 통합. abstract-thought는 그대로 유지.

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const DATA = path.join(ROOT, "data");
const v = JSON.parse(fs.readFileSync(path.join(DATA, "vocabulary.json"), "utf8"));

// 매핑: 기존 deck id → 새 deck id
const MERGE = {
  // 입문 (4)
  "starter-basic": "starter-basic",
  "starter-pronoun": "starter-pronoun",
  "starter-numbers": "starter-numbers",
  "foundation-numbers-extended": "starter-numbers",
  "foundation-counters-quantity": "starter-numbers",
  "foundation-time-clock": "starter-time",
  "foundation-calendar": "starter-time",
  "foundation-calendar-time": "starter-time",
  "foundation-duration-frequency": "starter-time",
  // 일상·집·가족 (4)
  "daily-life": "daily-life",
  "imp-voc-n3-001": "daily-life",
  "gap-daily-life": "daily-life",
  "imp-voc-n3-007": "home",
  "gap-home": "home",
  "foundation-home-life": "home",
  "family": "family",
  "imp-voc-n3-010": "family",
  "foundation-family-people": "family",
  "fashion-clothes": "fashion-clothes",
  "foundation-clothes-body": "fashion-clothes",
  // 사회생활 (2)
  "work-school": "work-school",
  "imp-voc-n3-002": "work-school",
  "gap-school-work": "work-school",
  "foundation-classroom-study": "work-school",
  "it-internet": "it-internet",
  // 감정·사고 (2)
  "emotion": "emotion",
  "imp-voc-n3-003": "emotion",
  "gap-emotion-state": "emotion",
  "abstract-thought": "abstract-thought",
  // 몸·음식 (2)
  "body-health": "body-health",
  "imp-voc-n3-005": "body-health",
  "gap-health": "body-health",
  "food-restaurant": "food-restaurant",
  "foundation-food-basics": "food-restaurant",
  // 이동·돈·자연 (4)
  "travel-transport": "travel-transport",
  "imp-voc-n3-004": "travel-transport",
  "gap-transport-travel": "travel-transport",
  "foundation-travel-service": "travel-transport",
  "shopping-money": "shopping-money",
  "imp-voc-n3-006": "shopping-money",
  "gap-shopping-money": "shopping-money",
  "foundation-shopping-service": "shopping-money",
  "nature-time": "nature-weather",
  "imp-voc-n3-008": "nature-weather",
  "animals-nature": "animals-nature",
  // 색·취미 (2)
  "colors-shapes": "colors-shapes",
  "hobby-sports": "hobby-sports",
  // 품사별 (3)
  "verbs-core": "verbs-core",
  "foundation-core-verbs-a": "verbs-core",
  "foundation-core-verbs-b": "verbs-core",
  "adjectives": "adjectives",
  "foundation-adjectives": "adjectives",
  "adverbs": "adverbs",
  "foundation-adverbs-connectors": "adverbs",
  "foundation-order-sequence": "adverbs",
  // 뉴스 (1)
  "imp-voc-n3-009": "news-media",
};

// 새 deck 메타데이터 (표시 순서대로)
const NEW_DECKS = [
  ["starter-basic", "기초 인사·표현", "처음 일본어 시작 — 가장 먼저 익혀야 할 표현", "👋"],
  ["starter-pronoun", "기초 대명사·지시어", "나·당신·이것·저것 가리키는 말", "👉"],
  ["starter-numbers", "기초 숫자·수량", "1~10 숫자와 수량 표현", "🔢"],
  ["starter-time", "기초 시간·날짜", "시각·요일·달·기간 표현", "⏰"],
  ["daily-life", "일상생활", "매일 쓰이는 핵심 어휘", "🏠"],
  ["home", "집·가사", "집과 살림 관련 어휘", "🧹"],
  ["family", "가족·인간관계", "가족·친구·동료", "👨‍👩‍👧"],
  ["fashion-clothes", "패션·옷차림", "옷과 액세서리", "👔"],
  ["work-school", "직장·학교", "사회생활과 학습 어휘", "💼"],
  ["it-internet", "IT·인터넷", "컴퓨터·SNS·앱", "💻"],
  ["emotion", "감정·심리", "감정과 마음 상태", "💗"],
  ["abstract-thought", "추상·사고 (큰 풀)", "독해에 자주 나오는 추상 어휘 — 큰 묶음", "🧠"],
  ["body-health", "몸·건강·병원", "신체와 건강 표현", "🩺"],
  ["food-restaurant", "음식·식당", "외식과 음식 관련", "🍱"],
  ["travel-transport", "여행·교통", "여행과 이동 어휘", "🚄"],
  ["shopping-money", "쇼핑·돈", "구매와 금전", "🛒"],
  ["nature-weather", "자연·날씨", "자연 현상과 시간 흐름", "🌤️"],
  ["animals-nature", "동물·식물", "동물과 자연물", "🐾"],
  ["colors-shapes", "색깔·모양", "기본 색과 모양", "🎨"],
  ["hobby-sports", "취미·스포츠", "여가와 스포츠", "⚽"],
  ["verbs-core", "핵심 동사", "N3 빈출 동사", "⚡"],
  ["adjectives", "형용사", "い형용사·な형용사", "✨"],
  ["adverbs", "부사·접속사", "글의 흐름을 잡는 단어", "🔗"],
  ["news-media", "뉴스·생활정보", "뉴스·미디어 관련 어휘", "📰"],
];

// 1) 모든 기존 deck에서 매핑된 새 deck으로 item 모으기
const buckets = {};
const unmapped = [];

for (const old of v.decks) {
  const newId = MERGE[old.id];
  if (!newId) {
    unmapped.push(old.id);
    continue;
  }
  if (!buckets[newId]) buckets[newId] = [];
  // dedupe within bucket
  for (const itemId of old.items) {
    if (!buckets[newId].includes(itemId)) buckets[newId].push(itemId);
  }
}

if (unmapped.length > 0) {
  console.error("매핑 없는 deck:", unmapped);
}

// 2) 새 decks 배열 구성 (정의 순서대로)
const newDecks = [];
for (const [id, title, description, emoji] of NEW_DECKS) {
  const items = buckets[id] || [];
  if (items.length === 0) continue; // 빈 deck 제외
  newDecks.push({ id, title, description, emoji, items });
}

v.decks = newDecks;
fs.writeFileSync(path.join(DATA, "vocabulary.json"), JSON.stringify(v, null, 2));

console.log("==== Consolidation summary ====");
console.log(`Total items: ${v.items.length}`);
console.log(`Decks: ${newDecks.length}`);
for (const d of newDecks) {
  console.log(`  ${d.emoji} ${d.title.padEnd(20)} : ${d.items.length}`);
}
