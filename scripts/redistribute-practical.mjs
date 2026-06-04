#!/usr/bin/env node
// gap-practical-expressions deck의 1680 단어를 base noun 기준으로 기존 카테고리로 분산.
// 분류 불가 시 abstract-thought로.

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const DATA = path.join(ROOT, "data");
const v = JSON.parse(fs.readFileSync(path.join(DATA, "vocabulary.json"), "utf8"));

// base noun → deck id 매핑
const BASE_TO_DECK = {
  // work-school (학교·직장)
  "申込み":"work-school","予定":"work-school","日程":"work-school","会場":"work-school",
  "資料":"work-school","書類":"work-school","提出":"work-school","確認":"work-school",
  "質問":"work-school","出席":"work-school","欠席":"work-school","授業":"work-school",
  "講座":"work-school","課題":"work-school","発表":"work-school","会議":"work-school",
  "担当":"work-school","上司":"work-school","同僚":"work-school","応募":"work-school",
  "面接":"work-school","採用":"work-school","研修":"work-school","休暇":"work-school",
  "残業":"work-school","出張":"work-school","通勤":"work-school","通学":"work-school",
  "試験":"work-school","点数":"work-school","宿題":"work-school",
  // daily-life
  "予約":"daily-life","時間":"daily-life","場所":"daily-life","連絡":"daily-life",
  "相談":"daily-life","案内":"daily-life","注意":"daily-life","約束":"daily-life",
  "協力":"daily-life","習慣":"daily-life",
  // transport-travel
  "駅":"transport-travel","電車":"transport-travel","切符":"transport-travel",
  "改札":"transport-travel","座席":"transport-travel","道路":"transport-travel",
  "交差点":"transport-travel","地図":"transport-travel","観光地":"transport-travel",
  "旅行":"transport-travel","宿泊":"transport-travel","温泉":"transport-travel",
  "荷物":"transport-travel",
  // home (집·가사)
  "家賃":"home","部屋":"home","台所":"home","玄関":"home","浴室":"home",
  "家具":"home","設備":"home","修理":"home","故障":"home","掃除":"home",
  "洗濯":"home","家事":"home",
  // food-restaurant
  "食事":"food-restaurant","朝食":"food-restaurant","昼食":"food-restaurant",
  "夕食":"food-restaurant","注文":"food-restaurant","配達":"food-restaurant",
  // shopping-money
  "会計":"shopping-money","領収書":"shopping-money","割引":"shopping-money",
  "現金":"shopping-money","口座":"shopping-money","振込":"shopping-money",
  "収入":"shopping-money","支出":"shopping-money","貯金":"shopping-money",
  "予算":"shopping-money",
  // body-health
  "病院":"body-health","診察":"body-health","症状":"body-health","薬":"body-health",
  "体調":"body-health","健康":"body-health",
  // nature-time
  "天気":"nature-time","気温":"nature-time","雨":"nature-time","台風":"nature-time",
  "地震":"nature-time","災害":"nature-time",
  // abstract-thought (추상·사고 — 의견·이유·뉴스 등)
  "理由":"abstract-thought","方法":"abstract-thought","結果":"abstract-thought",
  "問題":"abstract-thought","説明":"abstract-thought","意見":"abstract-thought",
  "感想":"abstract-thought","ニュース":"abstract-thought","記事":"abstract-thought",
  "番組":"abstract-thought","広告":"abstract-thought","目標":"abstract-thought",
  "成長":"abstract-thought",
  // emotion (감정·심리 — 인간관계 신뢰·태도 등)
  "信頼":"emotion","誤解":"emotion","印象":"emotion","態度":"emotion","努力":"emotion",
};

function extractBase(word) {
  const m = word.match(/^([^をにがの]+?)(?:を|に|が|について|から|まで)/);
  return m ? m[1] : null;
}

// 1) gap-practical-expressions deck 찾기 + 단어 분류
const peIdx = v.decks.findIndex(d => d.id === "gap-practical-expressions");
if (peIdx < 0) {
  console.log("gap-practical-expressions deck가 이미 없음.");
  process.exit(0);
}
const peDeck = v.decks[peIdx];

const itemById = new Map(v.items.map(it => [it.id, it]));
const deckById = new Map(v.decks.map(d => [d.id, d]));

const dist = {};
const unclassified = [];

for (const id of peDeck.items) {
  const it = itemById.get(id);
  if (!it) continue;
  const base = extractBase(it.word);
  const targetDeckId = base ? BASE_TO_DECK[base] : null;
  if (targetDeckId && deckById.has(targetDeckId)) {
    const d = deckById.get(targetDeckId);
    if (!d.items.includes(id)) d.items.push(id);
    dist[targetDeckId] = (dist[targetDeckId] || 0) + 1;
  } else {
    unclassified.push({ id, word: it.word, base });
  }
}

// 분류 못 한 단어는 abstract-thought로
if (unclassified.length > 0) {
  const at = deckById.get("abstract-thought");
  if (at) {
    for (const u of unclassified) {
      if (!at.items.includes(u.id)) at.items.push(u.id);
    }
    dist["abstract-thought"] = (dist["abstract-thought"] || 0) + unclassified.length;
  }
}

// 2) gap-practical-expressions deck 제거
v.decks.splice(peIdx, 1);

fs.writeFileSync(path.join(DATA, "vocabulary.json"), JSON.stringify(v, null, 2));

console.log("==== Redistribution summary ====");
for (const [deckId, count] of Object.entries(dist).sort((a,b) => b[1]-a[1])) {
  console.log(`  ${deckId}: +${count}`);
}
console.log(`Unclassified → abstract-thought: ${unclassified.length}`);
console.log(`Total moved: ${peDeck.items.length}`);
console.log(`Remaining decks: ${v.decks.length}`);
