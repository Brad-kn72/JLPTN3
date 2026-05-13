/**
 * 일본어 카나(히라가나/가타카나) → 한국어 음역.
 * 학습용 보조 표기이므로 표준 외래어 표기법보다는 발음 직관에 충실하게 처리.
 *
 * 규칙:
 *  - 카나 한 글자(또는 요음 두 글자) → 한국어 한 음절
 *  - っ/ッ (촉음): 다음 음절을 받침으로 (예: いっぱい → 입파이)
 *  - ん/ン (발음): 다음 자음에 따라 ㄴ/ㅁ/ㅇ (예: あんない → 안나이, さんぽ → 삼포)
 *  - ー (장음): 직전 음절을 그대로 한 번 더 적지 않고 "—"로 표기 (학습 직관용)
 *  - 한자 등 카나가 아닌 글자는 그대로 통과
 */

const TWO: Record<string, string> = {
  // 히라가나 요음
  きゃ: "캬", きゅ: "큐", きょ: "쿄",
  しゃ: "샤", しゅ: "슈", しょ: "쇼",
  ちゃ: "챠", ちゅ: "츄", ちょ: "쵸",
  にゃ: "냐", にゅ: "뉴", にょ: "뇨",
  ひゃ: "햐", ひゅ: "휴", ひょ: "효",
  みゃ: "먀", みゅ: "뮤", みょ: "묘",
  りゃ: "랴", りゅ: "류", りょ: "료",
  ぎゃ: "갸", ぎゅ: "규", ぎょ: "교",
  じゃ: "자", じゅ: "주", じょ: "조",
  びゃ: "뱌", びゅ: "뷰", びょ: "뵤",
  ぴゃ: "퍄", ぴゅ: "퓨", ぴょ: "표",
  // 가타카나 요음
  キャ: "캬", キュ: "큐", キョ: "쿄",
  シャ: "샤", シュ: "슈", ショ: "쇼",
  チャ: "챠", チュ: "츄", チョ: "쵸",
  ニャ: "냐", ニュ: "뉴", ニョ: "뇨",
  ヒャ: "햐", ヒュ: "휴", ヒョ: "효",
  ミャ: "먀", ミュ: "뮤", ミョ: "묘",
  リャ: "랴", リュ: "류", リョ: "료",
  ギャ: "갸", ギュ: "규", ギョ: "교",
  ジャ: "자", ジュ: "주", ジョ: "조",
  ビャ: "뱌", ビュ: "뷰", ビョ: "뵤",
  ピャ: "퍄", ピュ: "퓨", ピョ: "표",
};

const ONE: Record<string, string> = {
  // 히라가나
  あ:"아",い:"이",う:"우",え:"에",お:"오",
  か:"카",き:"키",く:"쿠",け:"케",こ:"코",
  さ:"사",し:"시",す:"스",せ:"세",そ:"소",
  た:"타",ち:"치",つ:"츠",て:"테",と:"토",
  な:"나",に:"니",ぬ:"누",ね:"네",の:"노",
  は:"하",ひ:"히",ふ:"후",へ:"헤",ほ:"호",
  ま:"마",み:"미",む:"무",め:"메",も:"모",
  や:"야",ゆ:"유",よ:"요",
  ら:"라",り:"리",る:"루",れ:"레",ろ:"로",
  わ:"와",を:"오",
  が:"가",ぎ:"기",ぐ:"구",げ:"게",ご:"고",
  ざ:"자",じ:"지",ず:"즈",ぜ:"제",ぞ:"조",
  だ:"다",ぢ:"지",づ:"즈",で:"데",ど:"도",
  ば:"바",び:"비",ぶ:"부",べ:"베",ぼ:"보",
  ぱ:"파",ぴ:"피",ぷ:"푸",ぺ:"페",ぽ:"포",
  // 가타카나
  ア:"아",イ:"이",ウ:"우",エ:"에",オ:"오",
  カ:"카",キ:"키",ク:"쿠",ケ:"케",コ:"코",
  サ:"사",シ:"시",ス:"스",セ:"세",ソ:"소",
  タ:"타",チ:"치",ツ:"츠",テ:"테",ト:"토",
  ナ:"나",ニ:"니",ヌ:"누",ネ:"네",ノ:"노",
  ハ:"하",ヒ:"히",フ:"후",ヘ:"헤",ホ:"호",
  マ:"마",ミ:"미",ム:"무",メ:"메",モ:"모",
  ヤ:"야",ユ:"유",ヨ:"요",
  ラ:"라",リ:"리",ル:"루",レ:"레",ロ:"로",
  ワ:"와",ヲ:"오",
  ガ:"가",ギ:"기",グ:"구",ゲ:"게",ゴ:"고",
  ザ:"자",ジ:"지",ズ:"즈",ゼ:"제",ゾ:"조",
  ダ:"다",ヂ:"지",ヅ:"즈",デ:"데",ド:"도",
  バ:"바",ビ:"비",ブ:"부",ベ:"베",ボ:"보",
  パ:"파",ピ:"피",プ:"푸",ペ:"페",ポ:"포",
};

// ん/ン 받침 결정: 후속 한글 음절의 초성으로 판단
function nFinal(nextSyllable: string): string {
  if (!nextSyllable) return "ㄴ";
  const d = decomposeHangulSyllable(nextSyllable[0]);
  const initial = d?.i;
  // 양순음 앞 → ㅁ (ま·ば·ぱ行 = ㅁ/ㅂ/ㅍ)
  if (initial === "ㅁ" || initial === "ㅂ" || initial === "ㅍ") return "ㅁ";
  // 연구개음 앞 → ㅇ (か·が行 = ㅋ/ㄱ)
  if (initial === "ㄱ" || initial === "ㅋ") return "ㅇ";
  return "ㄴ";
}

// 작은 つ/ッ → 다음 음절의 첫 자음을 받침으로
const FIRST_CONSONANT_TO_FINAL: Record<string, string> = {
  ㄱ: "ㄱ", ㅋ: "ㄱ",
  ㅅ: "ㅅ", ㅆ: "ㅅ", ㅈ: "ㅅ", ㅊ: "ㅅ",
  ㄷ: "ㄷ", ㅌ: "ㄷ",
  ㅂ: "ㅂ", ㅍ: "ㅂ",
};

const KO_INITIAL = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
const KO_MEDIAL = ["ㅏ","ㅐ","ㅑ","ㅒ","ㅓ","ㅔ","ㅕ","ㅖ","ㅗ","ㅘ","ㅙ","ㅚ","ㅛ","ㅜ","ㅝ","ㅞ","ㅟ","ㅠ","ㅡ","ㅢ","ㅣ"];
const KO_FINAL = ["","ㄱ","ㄲ","ㄳ","ㄴ","ㄵ","ㄶ","ㄷ","ㄹ","ㄺ","ㄻ","ㄼ","ㄽ","ㄾ","ㄿ","ㅀ","ㅁ","ㅂ","ㅄ","ㅅ","ㅆ","ㅇ","ㅈ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];

function decomposeHangulSyllable(syl: string): { i: string; m: string; f: string } | null {
  const code = syl.charCodeAt(0) - 0xac00;
  if (code < 0 || code > 11171) return null;
  const i = Math.floor(code / 588);
  const m = Math.floor((code % 588) / 28);
  const f = code % 28;
  return { i: KO_INITIAL[i], m: KO_MEDIAL[m], f: KO_FINAL[f] };
}

function composeHangulSyllable(i: string, m: string, f: string): string {
  const iIdx = KO_INITIAL.indexOf(i);
  const mIdx = KO_MEDIAL.indexOf(m);
  const fIdx = KO_FINAL.indexOf(f);
  if (iIdx < 0 || mIdx < 0 || fIdx < 0) return i + m + f;
  return String.fromCharCode(0xac00 + iIdx * 588 + mIdx * 28 + fIdx);
}

function addFinal(syllable: string, finalJamo: string): string {
  const d = decomposeHangulSyllable(syllable);
  if (!d) return syllable;
  return composeHangulSyllable(d.i, d.m, finalJamo);
}

function firstConsonantOf(syllable: string): string | null {
  const d = decomposeHangulSyllable(syllable);
  return d?.i ?? null;
}

const SOKUON = new Set(["っ", "ッ"]);
const N_MORA = new Set(["ん", "ン"]);
const LONG = new Set(["ー"]);

/**
 * 카나 + 한자 혼합 문자열을 한국어 발음으로 변환.
 * 한자는 그대로 유지(읽을 수 없으므로). 카나만 변환.
 */
export function kanaToKorean(input: string): string {
  if (!input) return "";
  let out = "";
  let pending: { type: "sokuon" } | { type: "n" } | null = null;

  const consume = (syl: string) => {
    if (pending?.type === "sokuon") {
      const c = firstConsonantOf(syl);
      const f = c ? FIRST_CONSONANT_TO_FINAL[c] : null;
      if (f && out) {
        out = out.slice(0, -1) + addFinal(out.slice(-1), f);
      }
      pending = null;
      out += syl;
      return;
    }
    if (pending?.type === "n" && out) {
      const final = nFinal(syl);
      out = out.slice(0, -1) + addFinal(out.slice(-1), final);
      pending = null;
    }
    out += syl;
  };

  let i = 0;
  while (i < input.length) {
    const c1 = input[i];
    const c2 = input[i + 1] ?? "";
    const two = c1 + c2;

    if (TWO[two]) {
      consume(TWO[two]);
      i += 2;
      continue;
    }

    if (SOKUON.has(c1)) {
      // 다음 음절 처리 시 받침으로 흡수
      // 만약 다음에 카나가 안 오면 그냥 무시 (혹은 'ㅅ')
      // 펜딩만 세팅
      // 단, 이전 펜딩이 ん이면 먼저 처리
      if (pending?.type === "n" && out) {
        out = out.slice(0, -1) + addFinal(out.slice(-1), "ㄴ");
      }
      pending = { type: "sokuon" };
      i += 1;
      continue;
    }

    if (N_MORA.has(c1)) {
      if (pending?.type === "n" && out) {
        out = out.slice(0, -1) + addFinal(out.slice(-1), "ㄴ");
      }
      pending = { type: "n" };
      i += 1;
      continue;
    }

    if (LONG.has(c1)) {
      // 장음: 마지막 음절의 중성을 한 번 더 표시하지 않고 — 로 (학습 직관)
      out += "—";
      i += 1;
      continue;
    }

    if (ONE[c1]) {
      consume(ONE[c1]);
      i += 1;
      continue;
    }

    // 카나가 아닌 글자 (한자 등) → 그대로 둠
    // 펜딩 청산
    if (pending?.type === "n" && out) {
      out = out.slice(0, -1) + addFinal(out.slice(-1), "ㄴ");
    }
    pending = null;
    out += c1;
    i += 1;
  }

  // 끝 처리
  if (pending?.type === "n" && out) {
    out = out.slice(0, -1) + addFinal(out.slice(-1), "ㄴ");
  }

  return out;
}
