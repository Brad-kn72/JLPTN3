#!/usr/bin/env node
// jlpt_n3_gap_fill_partial_bundle.json (또는 이후 번들) → 사이트 스키마로 변환·병합
// 두 번째 백로그 포맷 지원 (contents.* 아래에 *_additional 배열)
// 사용: node scripts/import-bundle.mjs <bundle.json>

import fs from "node:fs";
import path from "node:path";

const BUNDLE = process.argv[2];
if (!BUNDLE) {
  console.error("Usage: node scripts/import-bundle.mjs <bundle.json>");
  process.exit(1);
}

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const DATA = path.join(ROOT, "data");

const bundle = JSON.parse(fs.readFileSync(BUNDLE, "utf8"));
const vocab = JSON.parse(fs.readFileSync(path.join(DATA, "vocabulary.json"), "utf8"));
const grammar = JSON.parse(fs.readFileSync(path.join(DATA, "grammar.json"), "utf8"));
const kanji = JSON.parse(fs.readFileSync(path.join(DATA, "kanji.json"), "utf8"));
const reading = JSON.parse(fs.readFileSync(path.join(DATA, "reading.json"), "utf8"));
const listening = JSON.parse(fs.readFileSync(path.join(DATA, "listening.json"), "utf8"));
const mock = JSON.parse(fs.readFileSync(path.join(DATA, "mock-test.json"), "utf8"));

const C0 = bundle.contents || bundle; // 형식 자동 대응
// *_additional 또는 *_additional_cumulative 둘 다 지원
const C = {
  vocabulary_additional: C0.vocabulary_additional ?? C0.vocabulary_additional_cumulative ?? [],
  grammar_additional: C0.grammar_additional ?? C0.grammar_additional_cumulative ?? [],
  kanji_additional: C0.kanji_additional ?? C0.kanji_additional_cumulative ?? [],
  reading_additional: C0.reading_additional ?? C0.reading_additional_cumulative ?? [],
  listening_additional: C0.listening_additional ?? C0.listening_additional_cumulative ?? [],
  mock_tests_additional: C0.mock_tests_additional ?? C0.mock_tests_additional_cumulative ?? [],
};

/* ============= POS / EXAMPLE 추론 ============= */
const NA_ADJ = new Set([
  "安心","心配","不安","緊張","感動","残念","幸せ","大変","元気","便利","親切","丁寧","複雑","簡単","必要","確か","退屈","面倒","上手","下手","大切","重要","得意","苦手","派手","地味","贅沢","夢中","素敵","健康","熱心","真面目","正直","危険","安全","静か","賑やか","新鮮","公平","暇","残念"
]);

function inferPos(jp, reading) {
  if (jp.endsWith("する")) return "동사";
  if (NA_ADJ.has(jp)) return "な형용사";
  // 명확한 い형용사 어말 패턴
  if (/しい$|くい$|たい$|よい$/.test(reading)) return "い형용사";
  if (/^(嬉|悲|楽|忙|苦|寒|暑|多|少|高|低|早|遅|安|新|古|長|短|広|狭|強|弱|遠|近|赤|青|黒|白|甘|辛|易|難|美|汚|細|薄|厚|軽|重|怖|痛)/.test(jp) && reading.endsWith("い"))
    return "い형용사";
  // 동사 어미
  if (jp.length >= 2 && /(える|ける|げる|せる|てる|でる|ねる|べる|める|れる)$/.test(reading)) return "동사";
  if (jp.length >= 2 && /(む|ぶ|ぐ|つ|う|く|す|ぬ|る)$/.test(reading) && reading.length <= 5) {
    // 명사로 자주 쓰이는 단어 예외
    const nounLike = new Set(["時間","会社","学校","場合","内容","結果","理由","方法","結局","用事"]);
    if (!nounLike.has(jp) && !jp.match(/^[一二三四五六七八九十百千万円]/)) return "동사";
  }
  return "명사";
}

function makeExample(jp, reading, ko, pos) {
  const ko1 = ko.split(/[,，·\/]/)[0].trim();
  switch (pos) {
    case "동사":
      return { example: `毎日${jp}ようにしています。`, exampleTranslation: `매일 ${ko1}려고 하고 있어요.` };
    case "い형용사":
      return { example: `今日はとても${jp}です。`, exampleTranslation: `오늘은 매우 ${ko1}.` };
    case "な형용사":
      return { example: `この問題は${jp}です。`, exampleTranslation: `이 문제는 ${ko1}.` };
    case "부사":
      return { example: `${jp}そう思います。`, exampleTranslation: `${ko1} 그렇게 생각합니다.` };
    default:
      return { example: `${jp}を確認してください。`, exampleTranslation: `${ko1}을(를) 확인해 주세요.` };
  }
}

/* ============= VOCABULARY ============= */
const CAT_MAP = {
  daily_life: { title: "일상생활 (보강)", emoji: "🏡" },
  school_work: { title: "학교·직장 (보강)", emoji: "🎓" },
  emotion_state: { title: "감정·상태 (보강)", emoji: "💭" },
  transport_travel: { title: "교통·여행 (보강)", emoji: "🚉" },
  health: { title: "건강·병원 (보강)", emoji: "🏥" },
  shopping_money: { title: "쇼핑·돈 (보강)", emoji: "🛒" },
  home: { title: "집·가사 (보강)", emoji: "🧹" },
  nature_media_people: { title: "자연·미디어·인간 (보강)", emoji: "🌤️" },
};

const existingWordKeys = new Set(vocab.items.map((v) => `${v.word}|${v.reading}`));
let vid = 1000;
function nextVid() { while (vocab.items.some(v=>v.id===`v${vid}`)) vid++; return `v${vid++}`; }

const newVocabByCategory = {};
let vocabAdded = 0;
let vocabSkipped = 0;
const gapIdToVocabId = {}; // V-GAP-* → v* 변환표 (mock에서 ref 풀 때 사용)

for (const w of C.vocabulary_additional || []) {
  const key = `${w.word}|${w.reading}`;
  if (existingWordKeys.has(key)) {
    const existing = vocab.items.find(v => `${v.word}|${v.reading}` === key);
    gapIdToVocabId[w.id] = existing.id;
    vocabSkipped++;
    continue;
  }
  existingWordKeys.add(key);
  const pos = inferPos(w.word, w.reading);
  const ex = makeExample(w.word, w.reading, w.meaning_ko, pos);
  const id = nextVid();
  const item = { id, word: w.word, reading: w.reading, meaning: w.meaning_ko, pos, ...ex };
  vocab.items.push(item);
  gapIdToVocabId[w.id] = id;
  (newVocabByCategory[w.category] ??= []).push(id);
  vocabAdded++;
}

// 카테고리별 deck 추가
for (const [cat, ids] of Object.entries(newVocabByCategory)) {
  const meta = CAT_MAP[cat] || { title: cat, emoji: "📚" };
  const baseId = `gap-${cat.replace(/_/g, "-")}`;
  let deckId = baseId;
  let n = 2;
  while (vocab.decks.some(d => d.id === deckId)) deckId = `${baseId}-${n++}`;
  vocab.decks.push({
    id: deckId,
    title: meta.title,
    description: `${meta.title} · 백로그 보강`,
    emoji: meta.emoji,
    items: ids,
  });
}

/* ============= GRAMMAR ============= */
const USAGE_TO_CAT = [
  [/추측|예상|확신/, "추측"],
  [/원인|이유|덕분|탓|때문/, "원인이유"],
  [/역접|양보|반전|불구|예상 반전/, "역접양보"],
  [/변화|되다|진행|도달/, "변화"],
  [/수동|사역|허락/, "수동사역"],
  [/조건|가정|장면/, "조건"],
  [/시간|동안|간격|지속|반복|중간|행동 후|전$/, "시간"],
  [/경어|존경|겸양/, "경어"],
  [/희망|의지|결정|예정|작정/, "의지희망"],
  [/비교|대조|기준|입장|평가/, "비교"],
  [/명령|금지/, "명령금지"],
  [/강조|한정|극단|선택지 없음/, "강조"],
  [/예시|열거|선택/, "예시열거"],
];
function inferCategory(u = "") { for (const [re, c] of USAGE_TO_CAT) if (re.test(u)) return c; return "기타"; }

const existingPatterns = new Set(grammar.items.map(g => g.pattern));
let gid = 300;
function nextGid() { while (grammar.items.some(g=>g.id===`g${gid}`)) gid++; return `g${gid++}`; }
const gapIdToGrammarId = {};
let grammarAdded = 0;
let grammarSkipped = 0;

for (const p of C.grammar_additional || []) {
  if (existingPatterns.has(p.pattern)) {
    const existing = grammar.items.find(g => g.pattern === p.pattern);
    if (existing) gapIdToGrammarId[p.id] = existing.id;
    grammarSkipped++;
    continue;
  }
  existingPatterns.add(p.pattern);
  const id = nextGid();
  grammar.items.push({
    id,
    pattern: p.pattern,
    meaning: p.meaning_ko,
    connection: "—",
    explanation: p.usage || p.meaning_ko,
    examples: [{ jp: p.example_jp, ko: p.example_ko }],
    category: inferCategory(p.usage),
  });
  gapIdToGrammarId[p.id] = id;
  grammarAdded++;
}

/* ============= KANJI ============= */
const KO_READING = {
  // 1차 백로그
  備:"비",験:"험",説:"설",連:"련",絡:"락",報:"보",告:"고",確:"확",認:"인",提:"제",出:"출",
  締:"체",切:"절",談:"담",査:"사",調:"조",増:"증",減:"감",比:"비",較:"교",約:"약",束:"속",
  慣:"관",急:"급",遅:"지",慮:"려",招:"초",待:"대",訪:"방",問:"문",世:"세",話:"화",信:"신",
  頼:"뢰",誤:"오",解:"해",理:"리",迎:"영",送:"송",景:"경",災:"재",害:"해",避:"피",難:"난",
  震:"진",湿:"습",度:"도",測:"측",予:"예",
  // 2차 번들
  温:"온",積:"적",被:"피",流:"류",節:"절",収:"수",支:"지",貯:"저",振:"진",込:"입",
  領:"령",庫:"고",売:"매",現:"현",費:"비",交:"교",勤:"근",職:"직",場:"장",
  採:"채",用:"용",研:"연",修:"수",休:"휴",暇:"가",転:"전",換:"환",泊:"박",
  色:"색",順:"순",症:"증",状:"상",処:"처",方:"방",看:"간",護:"호",胃:"위",
  胸:"흉",肩:"견",痛:"통",眠:"면",欲:"욕",防:"방",障:"장",故:"고",
  玄:"현",壁:"벽",床:"상",暮:"모",燃:"연",資:"자",源:"원",設:"설",
  // 3차 cumulative 번들 (대량)
  一:"일",七:"칠",三:"삼",上:"상",下:"하",不:"불",並:"병",中:"중",乗:"승",九:"구",
  乾:"건",了:"료",事:"사",二:"이",五:"오",井:"정",京:"경",人:"인",今:"금",仕:"사",
  付:"부",以:"이",会:"회",佐:"좌",体:"체",作:"작",使:"사",価:"가",便:"편",保:"보",
  倒:"도",借:"차",値:"치",停:"정",健:"건",傘:"산",働:"동",僚:"료",優:"우",先:"선",
  入:"입",全:"전",八:"팔",六:"육",具:"구",内:"내",円:"원",冊:"책",冷:"랭",分:"분",
  列:"열",初:"초",判:"판",別:"별",利:"리",到:"도",刷:"쇄",刻:"각",前:"전",剤:"제",
  割:"할",力:"력",功:"공",加:"가",努:"노",動:"동",募:"모",包:"포",化:"화",医:"의",
  十:"십",午:"오",半:"반",協:"협",印:"인",却:"각",参:"참",友:"우",取:"취",受:"수",
  口:"구",古:"고",台:"대",号:"호",司:"사",各:"각",合:"합",同:"동",名:"명",吐:"토",
  向:"향",含:"함",周:"주",品:"품",員:"원",商:"상",四:"사",回:"회",困:"곤",図:"도",
  国:"국",土:"토",在:"재",地:"지",壊:"괴",変:"변",夕:"석",外:"외",多:"다",夜:"야",
  大:"대",天:"천",夫:"부",失:"실",女:"녀",始:"시",嫌:"혐",子:"자",季:"계",守:"수",
  安:"안",定:"정",客:"객",室:"실",家:"가",容:"용",察:"찰",寮:"료",寺:"사",射:"사",
  少:"소",局:"국",届:"계",屋:"옥",履:"리",山:"산",川:"천",工:"공",差:"차",市:"시",
  布:"포",希:"희",師:"사",席:"석",帰:"귀",常:"상",平:"평",広:"광",店:"점",座:"좌",
  庭:"정",康:"강",引:"인",張:"장",強:"강",当:"당",影:"영",役:"역",往:"왕",後:"후",
  徒:"도",得:"득",復:"복",心:"심",必:"필",忘:"망",応:"응",快:"쾌",念:"념",怒:"노",
  思:"사",性:"성",恐:"공",恥:"치",悩:"뇌",悪:"악",情:"정",惑:"혹",想:"상",意:"의",
  感:"감",態:"태",成:"성",戦:"전",戻:"려",所:"소",手:"수",払:"불",承:"승",折:"절",
  押:"압",担:"담",持:"지",挑:"도",掃:"소",授:"수",接:"접",揺:"요",改:"개",放:"방",
  敗:"패",
  // 4차 추가 100자 (kanji_extra_100)
  券:"권",航:"항",港:"항",機:"기",飛:"비",留:"류",旅:"려",貸:"대",枚:"매",箱:"상",
  皿:"명",段:"단",坂:"판",路:"로",登:"등",海:"해",岸:"안",湖:"호",島:"도",林:"림",
  原:"원",畑:"전",農:"농",建:"건",窓:"창",門:"문",柱:"주",戸:"호",畳:"첩",団:"단",
  洋:"양",帽:"모",靴:"화",荷:"하",軽:"경",暗:"암",明:"명",低:"저",深:"심",浅:"천",
  狭:"협",弱:"약",薬:"약",写:"사",真:"진",有:"유",神:"신",社:"사",祭:"제",文:"문",
  房:"방",筆:"필",科:"과",術:"술",
};
const STROKES_X = {
  温:12,積:16,被:10,流:10,節:13,収:4,支:4,貯:12,振:10,込:5,
  領:14,庫:10,売:7,現:11,費:12,交:6,勤:12,職:18,場:12,
  採:11,用:5,研:9,修:10,休:6,暇:13,転:11,換:12,泊:8,
  色:6,順:12,症:10,状:7,処:5,方:4,看:9,護:20,胃:9,
  胸:10,肩:8,痛:12,眠:10,欲:11,防:7,障:14,故:9,
  玄:5,壁:16,床:7,暮:14,燃:16,資:13,源:13,設:11,
};
const RADICALS_X = {
  温:"氵",積:"禾",被:"衤",流:"氵",節:"竹",収:"又",支:"支",貯:"貝",振:"扌",込:"辶",
  領:"頁",庫:"广",売:"士",現:"王",費:"貝",交:"亠",勤:"力",職:"耳",場:"土",
  採:"扌",用:"用",研:"石",修:"亻",休:"亻",暇:"日",転:"車",換:"扌",泊:"氵",
  色:"色",順:"頁",症:"疒",状:"犬",処:"几",方:"方",看:"目",護:"言",胃:"田",
  胸:"月",肩:"月",痛:"疒",眠:"目",欲:"欠",防:"阝",障:"阝",故:"攵",
  玄:"玄",壁:"土",床:"广",暮:"日",燃:"火",資:"貝",源:"氵",設:"言",
};

const existingChars = new Set(kanji.items.map(k => k.char));
let kanjiAdded = 0;
let kanjiSkipped = 0;

for (const k of C.kanji_additional || []) {
  if (existingChars.has(k.kanji)) { kanjiSkipped++; continue; }
  const kr = KO_READING[k.kanji];
  if (!kr) { kanjiSkipped++; continue; } // 매핑 없는 한자는 안전하게 스킵
  existingChars.add(k.kanji);
  kanji.items.push({
    char: k.kanji,
    onyomi: k.onyomi ? [k.onyomi] : [],
    kunyomi: k.kunyomi ? [k.kunyomi] : [],
    koreanReading: kr,
    meanings: (k.meaning_ko || k.meaning || "").split(/[,，、·]/).map(s => s.trim()).filter(Boolean),
    strokes: STROKES_X[k.kanji] ?? 0,
    radical: RADICALS_X[k.kanji] ?? "?",
    level: "N3",
    examples: k.sample_word ? [{ word: k.sample_word, reading: "—", meaning: "—" }] : [],
  });
  kanjiAdded++;
}

/* ============= READING ============= */
const existingReadingIds = new Set(reading.items.map(r => r.id));
const gapIdToReadingId = {};
let readingAdded = 0;
let rid = 100;
function nextRid() { let id; do { id = `r${String(rid++).padStart(3,'0')}`; } while (existingReadingIds.has(id)); return id; }

for (const r of C.reading_additional || []) {
  // 백로그 id와 우리 id가 다르므로 새 id 발급
  const newId = nextRid();
  existingReadingIds.add(newId);
  reading.items.push({
    id: newId,
    title: r.title,
    body: r.passage_jp,
    translation: r.translation_ko,
    questions: (r.questions || []).map((q, i) => ({
      id: `${newId}q${i+1}`,
      prompt: q.question_jp,
      choices: q.options,
      answerIndex: q.answer_index,
      explanation: q.explanation_ko,
    })),
  });
  gapIdToReadingId[r.id] = newId;
  readingAdded++;
}

/* ============= LISTENING ============= */
const existingListeningIds = new Set(listening.items.map(l => l.id));
const gapIdToListeningId = {};
let listeningAdded = 0;
let lid = 100;
function nextLid() { let id; do { id = `l${String(lid++).padStart(3,'0')}`; } while (existingListeningIds.has(id)); return id; }

for (const l of C.listening_additional || []) {
  const newId = nextLid();
  existingListeningIds.add(newId);
  listening.items.push({
    id: newId,
    title: l.title,
    script: l.script_jp,
    translation: l.translation_ko,
    questions: (l.questions || []).map((q, i) => ({
      id: `${newId}q${i+1}`,
      prompt: q.question_jp,
      choices: q.options,
      answerIndex: q.answer_index,
      explanation: q.explanation_ko,
    })),
  });
  gapIdToListeningId[l.id] = newId;
  listeningAdded++;
}

/* ============= MOCK TESTS (refs → 실제 4지선다 자동 생성) ============= */
function shuffle(a) { a = [...a]; for (let i = a.length-1; i>0; i--) { const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]] = [a[j],a[i]]; } return a; }
function pickDistractors(pool, exclude, n) {
  return shuffle(pool.filter(x => x !== exclude)).slice(0, n);
}

let mockAdded = 0;
let mid = 6;
function nextMid() { while (mock.tests.some(t=>t.id===`mock${mid}`)) mid++; return `mock${mid++}`; }

for (const m of C.mock_tests_additional || []) {
  const sections = [];
  const refs = m.questions || {};

  // vocabulary 섹션
  if (refs.vocabulary_refs?.length) {
    const allMeanings = vocab.items.map(v => v.meaning);
    const qs = refs.vocabulary_refs
      .map(gapId => {
        const localId = gapIdToVocabId[gapId];
        return vocab.items.find(v => v.id === localId);
      })
      .filter(Boolean)
      .map((item, i) => {
        const distractors = pickDistractors(allMeanings, item.meaning, 3);
        const choices = shuffle([item.meaning, ...distractors]);
        return {
          id: `${m.id}-v${i+1}`,
          prompt: `「${item.word}」(${item.reading}) 의 한국어 뜻은?`,
          choices,
          answerIndex: choices.indexOf(item.meaning),
          explanation: `${item.word}(${item.reading}) → ${item.meaning}.`,
        };
      });
    if (qs.length) sections.push({ id: "s1", title: "언어지식 - 어휘", type: "vocabulary", questions: qs });
  }

  // grammar 섹션
  if (refs.grammar_refs?.length) {
    const allMeanings = grammar.items.map(g => g.meaning);
    const qs = refs.grammar_refs
      .map(gapId => grammar.items.find(g => g.id === gapIdToGrammarId[gapId]))
      .filter(Boolean)
      .map((g, i) => {
        const distractors = pickDistractors(allMeanings, g.meaning, 3);
        const choices = shuffle([g.meaning, ...distractors]);
        return {
          id: `${m.id}-g${i+1}`,
          prompt: `「${g.pattern}」 의 의미로 가장 적절한 것은?`,
          choices,
          answerIndex: choices.indexOf(g.meaning),
          explanation: g.explanation,
        };
      });
    if (qs.length) sections.push({ id: "s2", title: "언어지식 - 문법", type: "grammar", questions: qs });
  }

  // reading 섹션 (첫 문제만 사용)
  if (refs.reading_refs?.length) {
    const qs = refs.reading_refs
      .map(gapId => reading.items.find(r => r.id === gapIdToReadingId[gapId]))
      .filter(Boolean)
      .filter(r => r.questions.length > 0)
      .map((r, i) => ({
        id: `${m.id}-r${i+1}`,
        prompt: `[${r.title}] ${r.body.slice(0, 80)}...\n\n${r.questions[0].prompt}`,
        choices: r.questions[0].choices,
        answerIndex: r.questions[0].answerIndex,
        explanation: r.questions[0].explanation,
      }));
    if (qs.length) sections.push({ id: "s3", title: "독해", type: "reading", questions: qs });
  }

  // listening 섹션
  if (refs.listening_refs?.length) {
    const qs = refs.listening_refs
      .map(gapId => listening.items.find(l => l.id === gapIdToListeningId[gapId]))
      .filter(Boolean)
      .filter(l => l.questions.length > 0)
      .map((l, i) => ({
        id: `${m.id}-l${i+1}`,
        prompt: `[${l.title}] 스크립트: ${l.script.slice(0, 80)}...\n\n${l.questions[0].prompt}`,
        choices: l.questions[0].choices,
        answerIndex: l.questions[0].answerIndex,
        explanation: l.questions[0].explanation,
      }));
    if (qs.length) sections.push({ id: "s4", title: "청해", type: "listening", questions: qs });
  }

  if (sections.length) {
    mock.tests.push({
      id: nextMid(),
      title: m.title || `추가 모의고사 ${mockAdded+1}`,
      duration: 40,
      sections,
    });
    mockAdded++;
  }
}

/* ============= SAVE ============= */
fs.writeFileSync(path.join(DATA, "vocabulary.json"), JSON.stringify(vocab, null, 2));
fs.writeFileSync(path.join(DATA, "grammar.json"), JSON.stringify(grammar, null, 2));
fs.writeFileSync(path.join(DATA, "kanji.json"), JSON.stringify(kanji, null, 2));
fs.writeFileSync(path.join(DATA, "reading.json"), JSON.stringify(reading, null, 2));
fs.writeFileSync(path.join(DATA, "listening.json"), JSON.stringify(listening, null, 2));
fs.writeFileSync(path.join(DATA, "mock-test.json"), JSON.stringify(mock, null, 2));

console.log("==== Bundle import summary ====");
console.log(`Vocabulary: +${vocabAdded} new, ${vocabSkipped} dup → total ${vocab.items.length} (decks: ${vocab.decks.length})`);
console.log(`Grammar:    +${grammarAdded} new, ${grammarSkipped} dup → total ${grammar.items.length}`);
console.log(`Kanji:      +${kanjiAdded} new, ${kanjiSkipped} skipped → total ${kanji.items.length}`);
console.log(`Reading:    +${readingAdded} new → total ${reading.items.length}`);
console.log(`Listening:  +${listeningAdded} new → total ${listening.items.length}`);
console.log(`Mock tests: +${mockAdded} new → total ${mock.tests.length}`);
