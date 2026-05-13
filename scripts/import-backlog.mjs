#!/usr/bin/env node
// 업로드된 jlpt_n3_expansion_backlog.json → 사이트 스키마로 변환·병합
// 사용: node scripts/import-backlog.mjs <backlog.json>

import fs from "node:fs";
import path from "node:path";

const BACKLOG = process.argv[2] || "/tmp/backlog.json";
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const DATA = path.join(ROOT, "data");

const backlog = JSON.parse(fs.readFileSync(BACKLOG, "utf8"));
const vocabData = JSON.parse(fs.readFileSync(path.join(DATA, "vocabulary.json"), "utf8"));
const grammarData = JSON.parse(fs.readFileSync(path.join(DATA, "grammar.json"), "utf8"));
const kanjiData = JSON.parse(fs.readFileSync(path.join(DATA, "kanji.json"), "utf8"));

/* =========================== VOCABULARY =========================== */

const existingWordKeys = new Set(vocabData.items.map((v) => `${v.word}|${v.reading}`));
const NA_ADJ = new Set([
  "安心","心配","不安","緊張","感動","残念","幸せ","大変","元気","便利","親切","丁寧","複雑","簡単","必要","確か","退屈","面倒","上手","下手","大切","重要","得意","苦手","派手","地味","贅沢","夢中","素敵"
]);

function inferPos(jp, reading) {
  const endsIru = /[るり]$/.test(jp);
  // する 동사
  if (jp.endsWith("する") || jp.endsWith("じる")) return "동사";
  // い형용사 (단, 한자로 끝나는 ‐い 형용사는 hiragana 마지막이 い 인지 reading으로 확인)
  if (reading.endsWith("い") && !reading.endsWith("ない")) {
    // 名詞 중에 おい 등 끝나는 단어가 있을 수 있어 보수적으로 잘 알려진 패턴만 처리
    if (/(しい|たい|ない|くい|よい|高い|安い|長い|短い)$/.test(jp) || jp.endsWith("い")) {
      // 명사 중 "い"로 끝나지만 형용사 아닌 것: 弟い, 妹い 같은 단어는 거의 없음
      // 그래도 너무 광범위해서 false positive 가능 → 명확한 い형용사만
      if (NA_ADJ.has(jp)) return "な형용사";
      return /^(嬉|悲|楽|忙|苦|寒|暑|多|少|高|低|早|遅|安|新|古|長|短|広|狭|強|弱|遠|近|赤|青|黒|白|甘|辛|酸|苦|易|難|美|汚|細|太|薄|厚|軽|重)/.test(jp) ||
        /(しい|くい|たい|よい|わるい|大きい|小さい|新しい|古い)$/.test(jp)
        ? "い형용사"
        : "명사";
    }
  }
  // な형용사 (명확 화이트리스트)
  if (NA_ADJ.has(jp)) return "な형용사";
  // 동사 어미 (1·2그룹 약식 추론)
  if (/(る|む|ぶ|ぐ|つ|う|く|す)$/.test(reading) && jp !== reading && reading.length >= 2) {
    // 명사로 끝나는 う/く도 많아 단정 어려움 — 사전형 동사 패턴이 강한 경우만
    if (/(える|ける|げる|せる|てる|でる|ねる|べる|める|れる)$/.test(reading)) return "동사";
    if (/(む|ぶ|ぐ|つ|う|く|す|ぬ|る)$/.test(reading) && reading.length <= 4) {
      // 짧고 동사 어미면 동사일 확률 ↑. 단, 명사로 자주 쓰이는 단어는 예외
      const nounLike = new Set(["時間","会社","学校","場合","内容","結果","理由","方法","結局","用事","片付け"]);
      if (!nounLike.has(jp)) return "동사";
    }
  }
  return "명사";
}

function makeExample(jp, reading, ko, pos) {
  // 단어를 직접 활용한 간단·자연스러운 예문
  switch (pos) {
    case "동사":
      return {
        example: `毎日${jp}ようにしています。`,
        exampleTranslation: `매일 ${ko.split(/[,，·]/)[0]}려고 하고 있어요.`,
      };
    case "い형용사":
      return {
        example: `今日はとても${jp}です。`,
        exampleTranslation: `오늘은 매우 ${ko.split(/[,，·]/)[0]}.`,
      };
    case "な형용사":
      return {
        example: `この問題は${jp}です。`,
        exampleTranslation: `이 문제는 ${ko.split(/[,，·]/)[0]}.`,
      };
    case "부사":
      return {
        example: `${jp}そう思います。`,
        exampleTranslation: `${ko.split(/[,，·]/)[0]} 그렇게 생각합니다.`,
      };
    default:
      return {
        example: `${jp}を確認してください。`,
        exampleTranslation: `${ko.split(/[,，·]/)[0]}을(를) 확인해 주세요.`,
      };
  }
}

const newVocabItems = [];
const newDecks = [];
let vocabIdCounter = 600; // 기존 v5xx 이후

for (const pack of backlog.vocabulary_expansion.packs) {
  const deckId = `imp-${pack.id.toLowerCase()}`;
  const deckItemIds = [];

  for (const w of pack.words) {
    const key = `${w.jp}|${w.reading}`;
    if (existingWordKeys.has(key)) {
      // 중복이지만 새 카테고리에 포함하기 위해 기존 id 찾아서 deck에 추가
      const existing = vocabData.items.find((v) => `${v.word}|${v.reading}` === key);
      if (existing) deckItemIds.push(existing.id);
      continue;
    }
    existingWordKeys.add(key);
    const pos = inferPos(w.jp, w.reading);
    const { example, exampleTranslation } = makeExample(w.jp, w.reading, w.ko, pos);
    const id = `v${vocabIdCounter++}`;
    newVocabItems.push({
      id,
      word: w.jp,
      reading: w.reading,
      meaning: w.ko,
      pos,
      example,
      exampleTranslation,
    });
    deckItemIds.push(id);
  }

  if (deckItemIds.length > 0) {
    newDecks.push({
      id: deckId,
      title: pack.title,
      description: `${pack.category} · 백로그 임포트`,
      emoji: pickEmoji(pack.category),
      items: deckItemIds,
    });
  }
}

function pickEmoji(category) {
  const m = {
    "일상생활-확장": "🏡",
    "학교-직장": "🎓",
    "감정-상태": "💭",
    "이동-교통": "🚉",
    "건강-병원": "🏥",
    "쇼핑-금전": "🛒",
    "집-가사": "🧹",
    "날씨-자연": "🌤️",
    "뉴스-생활정보": "📰",
    "인간관계": "🤝",
  };
  return m[category] ?? "📚";
}

vocabData.items.push(...newVocabItems);
vocabData.decks.push(...newDecks);

/* =========================== GRAMMAR =========================== */

const USAGE_TO_CATEGORY = [
  [/추측|예상|확신/, "추측"],
  [/원인|이유|덕분|탓|때문/, "원인이유"],
  [/역접|양보|반전|불구|예상 반전/, "역접양보"],
  [/변화|되다|진행|도달/, "변화"],
  [/수동|사역|허락/, "수동사역"],
  [/조건|가정|장면/, "조건"],
  [/시간|동안|간격|지속|반복|중간|행동 후/, "시간"],
  [/경어|존경|겸양/, "경어"],
  [/희망|의지|결정|예정|작정/, "의지희망"],
  [/비교|대조|기준|입장|평가/, "비교"],
  [/명령|금지/, "명령금지"],
  [/강조|한정|극단|선택지 없음/, "강조"],
  [/예시|열거|선택/, "예시열거"],
];

function inferCategory(usage = "") {
  for (const [re, cat] of USAGE_TO_CATEGORY) if (re.test(usage)) return cat;
  return "기타";
}

const existingPatterns = new Set(grammarData.items.map((g) => g.pattern));
let grammarIdCounter = 200; // g200 부터 임포트

const newGrammarItems = [];
for (const p of backlog.grammar_expansion.patterns) {
  if (existingPatterns.has(p.pattern)) continue;
  existingPatterns.add(p.pattern);
  newGrammarItems.push({
    id: `g${grammarIdCounter++}`,
    pattern: p.pattern,
    meaning: p.meaning,
    connection: "—", // 원본에 없음. 후속 보강 필요
    explanation: p.usage || p.meaning,
    examples: [{ jp: p.example, ko: p.translation }],
    category: inferCategory(p.usage),
  });
}
grammarData.items.push(...newGrammarItems);

/* =========================== KANJI =========================== */

const KOREAN_READINGS = {
  備:"비",験:"험",説:"설",連:"련",絡:"락",報:"보",告:"고",確:"확",認:"인",提:"제",出:"출",
  締:"체",切:"절",談:"담",査:"사",調:"조",増:"증",減:"감",比:"비",較:"교",約:"약",束:"속",
  慣:"관",急:"급",遅:"지",慮:"려",招:"초",待:"대",訪:"방",問:"문",世:"세",話:"화",信:"신",
  頼:"뢰",誤:"오",解:"해",理:"리",迎:"영",送:"송",景:"경",災:"재",害:"해",避:"피",難:"난",
  震:"진",湿:"습",度:"도",測:"측",予:"예",
};

const STROKES = {
  備:12,験:18,説:14,連:10,絡:12,報:12,告:7,確:15,認:14,提:12,出:5,
  締:15,切:4,談:15,査:9,調:15,増:14,減:12,比:4,較:13,約:9,束:7,
  慣:14,急:9,遅:12,慮:15,招:8,待:9,訪:11,問:11,世:5,話:13,信:9,
  頼:16,誤:14,解:13,理:11,迎:7,送:9,景:12,災:7,害:10,避:16,難:18,
  震:15,湿:12,度:9,測:12,予:4,
};

const RADICALS = {
  備:"亻",験:"馬",説:"言",連:"辶",絡:"糸",報:"土",告:"口",確:"石",認:"言",提:"扌",出:"凵",
  締:"糸",切:"刀",談:"言",査:"木",調:"言",増:"土",減:"氵",比:"比",較:"車",約:"糸",束:"木",
  慣:"忄",急:"心",遅:"辶",慮:"心",招:"扌",待:"彳",訪:"言",問:"門",世:"一",話:"言",信:"亻",
  頼:"頁",誤:"言",解:"角",理:"王",迎:"辶",送:"辶",景:"日",災:"火",害:"宀",避:"辶",難:"隹",
  震:"雨",湿:"氵",度:"广",測:"氵",予:"乙",
};

const existingChars = new Set(kanjiData.items.map((k) => k.char));
const newKanjiItems = [];

for (const k of backlog.kanji_expansion.kanji) {
  if (existingChars.has(k.kanji)) continue;
  if (!KOREAN_READINGS[k.kanji]) continue; // 매핑 없는 한자는 스킵 (안전)
  existingChars.add(k.kanji);
  newKanjiItems.push({
    char: k.kanji,
    onyomi: k.onyomi ? [k.onyomi] : [],
    kunyomi: k.kunyomi ? [k.kunyomi] : [],
    koreanReading: KOREAN_READINGS[k.kanji],
    meanings: k.meaning.split(/[,，、·]/).map((s) => s.trim()),
    strokes: STROKES[k.kanji] ?? 0,
    radical: RADICALS[k.kanji] ?? "?",
    level: "N3",
    examples: k.sample
      ? [{ word: k.sample, reading: "—", meaning: "—" }] // reading/meaning은 후속 보강
      : [],
  });
}
kanjiData.items.push(...newKanjiItems);

/* =========================== SAVE =========================== */

fs.writeFileSync(path.join(DATA, "vocabulary.json"), JSON.stringify(vocabData, null, 2));
fs.writeFileSync(path.join(DATA, "grammar.json"), JSON.stringify(grammarData, null, 2));
fs.writeFileSync(path.join(DATA, "kanji.json"), JSON.stringify(kanjiData, null, 2));

console.log("==== Import summary ====");
console.log(`Vocabulary: +${newVocabItems.length} items, +${newDecks.length} decks (total items: ${vocabData.items.length}, decks: ${vocabData.decks.length})`);
console.log(`Grammar:    +${newGrammarItems.length} items (total: ${grammarData.items.length})`);
console.log(`Kanji:      +${newKanjiItems.length} items (total: ${kanjiData.items.length})`);
