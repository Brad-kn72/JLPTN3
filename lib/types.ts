export type PartOfSpeech =
  | "명사"
  | "동사"
  | "い형용사"
  | "な형용사"
  | "부사"
  | "접속사"
  | "조사"
  | "표현";

export interface VocabItem {
  id: string;
  word: string;          // 일본어 표기 (한자 우선)
  reading: string;       // 후리가나
  meaning: string;       // 한국어 뜻
  pos: PartOfSpeech;     // 품사
  example: string;       // 일본어 예문
  exampleReading?: string;
  exampleTranslation: string;
  tags?: string[];
}

export interface VocabDeck {
  id: string;
  title: string;
  description: string;
  emoji: string;
  items: string[]; // VocabItem.id 리스트
}

export interface GrammarItem {
  id: string;
  pattern: string;       // 문형
  meaning: string;       // 한국어 의미
  connection: string;    // 접속 형태
  explanation: string;   // 한국어 해설
  examples: { jp: string; reading?: string; ko: string }[];
  similar?: string[];    // 유사 문형 id
  category: "추측" | "원인이유" | "역접양보" | "변화" | "수동사역" | "조건" | "시간" | "경어" | "의지희망" | "비교" | "명령금지" | "강조" | "예시열거" | "기타";
}

export type JlptLevel = "N5" | "N4" | "N3";

export interface KanjiItem {
  char: string;
  onyomi: string[];      // 음독 (카타카나)
  kunyomi: string[];     // 훈독 (히라가나)
  koreanReading: string; // 한국 한자음
  meanings: string[];    // 한국어 뜻
  strokes: number;
  radical: string;
  level: JlptLevel;      // JLPT 레벨
  examples: { word: string; reading: string; meaning: string }[];
}

export interface ReadingPassage {
  id: string;
  title: string;
  body: string;           // 일본어 본문
  bodyReading?: string;   // 후리가나 버전 (옵션)
  translation: string;    // 한국어 번역
  questions: QuizQuestion[];
}

export interface ListeningPassage {
  id: string;
  title: string;
  audioUrl?: string;      // mp3 경로 (옵션 - 없으면 TTS 안내)
  script: string;         // 일본어 스크립트
  translation: string;
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  choices: string[];
  answerIndex: number;
  explanation?: string;
}

export interface MockTest {
  id: string;
  title: string;
  duration: number;        // 분
  sections: MockSection[];
}

export interface MockSection {
  id: string;
  title: string;
  type: "vocabulary" | "grammar" | "reading" | "listening";
  questions: QuizQuestion[];
}

// localStorage 모델
export interface PersistedState {
  version: number;
  vocabulary: Record<string, VocabProgress>;
  grammar: Record<string, ItemProgress>;
  kanji: Record<string, ItemProgress>;
  mockTests: MockResult[];
  settings: Settings;
  streak: { lastDate: string; days: number };
}

export interface VocabProgress {
  seen: number;
  correct: number;
  wrong: number;
  box: number;       // 1~5 (라이트너 박스)
  nextReview: string; // ISO date
  bookmarked?: boolean;
}

export interface ItemProgress {
  seen: number;
  mastery: number;   // 0~100
  bookmarked?: boolean;
}

export interface MockResult {
  id: string;
  testId: string;
  takenAt: string;
  durationSec: number;
  byArea: Record<string, { correct: number; total: number }>;
  total: { correct: number; total: number };
}

export interface Settings {
  furiganaOn: boolean;
  dailyGoal: number; // 단어 개수
  autoPlayAudio: boolean;
}
