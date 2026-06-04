#!/usr/bin/env node
// reading/listening/mock-test의 일본어 제목을 한국어로 변환.
// 패턴 매칭 + 직접 매핑 병용.

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const DATA = path.join(ROOT, "data");
const r = JSON.parse(fs.readFileSync(path.join(DATA, "reading.json"), "utf8"));
const l = JSON.parse(fs.readFileSync(path.join(DATA, "listening.json"), "utf8"));
const m = JSON.parse(fs.readFileSync(path.join(DATA, "mock-test.json"), "utf8"));

// 직접 매핑 (베이스 제목)
const BASE_KO = {
  // reading
  "図書館のお知らせ":"도서관 안내",
  "面接時間の変更メール":"면접 시간 변경 메일",
  "サークル紹介":"동아리 소개",
  "引っ越しの相談":"이사 상담",
  "スマホアプリの更新":"스마트폰 앱 업데이트",
  "電車の案内文":"전철 안내문",
  "旅行の感想":"여행 후기",
  "学校の掲示":"학교 게시문",
  "アルバイト募集":"아르바이트 모집",
  "市民講座":"시민 강좌",
  "忘れ物のお知らせ":"분실물 안내",
  "店の休業案内":"가게 휴업 안내",
  "試験の結果":"시험 결과",
  "昼休みのお知らせ":"점심 시간 안내",
  "商品の説明":"상품 설명",
  "寮のルール":"기숙사 규칙",
  "天気予報の記事":"날씨 예보 기사",
  "引っ越しの広告":"이사 광고",
  "図書館の利用変更":"도서관 이용 변경",
  "アルバイトの連絡":"아르바이트 연락",
  "旅行の予定":"여행 일정",
  "学校のお知らせ":"학교 공지",
  // listening
  "駅の案内放送":"역 안내 방송",
  "友達との会話":"친구와의 대화",
  "店の電話":"가게 전화",
  "先生の説明":"선생님의 설명",
  "会社の会話":"회사 대화",
  "病院の受付":"병원 접수",
  "天気予報":"날씨 예보",
  "図書館の案内":"도서관 안내",
  "寮の放送":"기숙사 방송",
  "買い物の会話":"쇼핑 대화",
  "学校の連絡":"학교 연락",
  "アルバイトの指示":"아르바이트 지시",
  "旅行会社の説明":"여행사 설명",
  "会社の電話":"회사 전화",
  "バスの放送":"버스 방송",
  "店の案内":"가게 안내",
  "学校放送":"학교 방송",
  "会議資料":"회의 자료",
  "予約変更":"예약 변경",
  "駅放送":"역 방송",
  "授業連絡":"수업 연락",
  // mock
  "N3追加ミニ模試":"N3 추가 미니 모의고사",
};

function translateTitle(t) {
  // 정확 일치
  if (BASE_KO[t]) return BASE_KO[t];
  // "<base> <number>" 패턴
  const m1 = t.match(/^(.+?)\s+(\d+)$/);
  if (m1) {
    const base = m1[1].trim();
    const num = m1[2];
    if (BASE_KO[base]) return `${BASE_KO[base]} ${num}`;
  }
  return null;
}

const hasJa = s => /[぀-ゟ゠-ヿ一-鿿]/.test(s);
let translated = 0;
let missed = [];

function processItems(items, label) {
  for (const it of items) {
    if (!hasJa(it.title)) continue;
    const ko = translateTitle(it.title);
    if (ko) {
      it.title = ko;
      translated++;
    } else {
      missed.push(`${label} ${it.id}: ${it.title}`);
    }
  }
}

processItems(r.items, "reading");
processItems(l.items, "listening");
processItems(m.tests, "mock");

fs.writeFileSync(path.join(DATA, "reading.json"), JSON.stringify(r, null, 2));
fs.writeFileSync(path.join(DATA, "listening.json"), JSON.stringify(l, null, 2));
fs.writeFileSync(path.join(DATA, "mock-test.json"), JSON.stringify(m, null, 2));

console.log(`Translated: ${translated}`);
if (missed.length > 0) {
  console.log(`Missed: ${missed.length}`);
  missed.slice(0,20).forEach(s => console.log("  ", s));
}
