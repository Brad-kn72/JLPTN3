# JLPT N3 — 한국인을 위한 일본어능력시험 학습 사이트 🌸

> JLPT N3 합격을 응원합니다. 어휘·문법·한자·독해·청해·모의고사를 한 곳에서.

## 특징

- **모듈 6종**: 어휘 단어장(플래시카드 + SRS) · 문법 검색/미니퀴즈 · 한자(한국 한자음) · 독해 · 청해(브라우저 TTS) · 모의고사
- **라이트너 박스 SRS**: 안다 / 헷갈림 / 모름 결과에 따라 다음 복습 간격 자동 조정
- **localStorage 기반**: 별도 로그인 불필요. 진도·즐겨찾기·모의고사 결과가 브라우저에 저장됨
- **사쿠라 핑크 테마 + 다크모드**
- **모바일 반응형** + Pretendard / Noto Sans JP
- **최신 개정판(2010~) JLPT N3 출제 기준** 어휘/문법 카테고리

## 기술 스택

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + shadcn 스타일 UI (Radix Primitives)
- next-themes (다크/라이트)
- 정적 빌드 가능 (`next build`)

## 시작하기

```bash
npm install
npm run dev
# http://localhost:3000
```

## 폴더 구조

```
app/                # Next.js 라우트
  vocabulary/       # 어휘
  grammar/          # 문법
  kanji/            # 한자
  reading/          # 독해
  listening/        # 청해
  mock-test/        # 모의고사
  progress/         # 학습 진도
  settings/         # 설정
components/
  ui/               # 버튼/카드/탭/배지 등
  flashcard/        # 플래시카드 (3D 플립)
  quiz/             # 4지선다 컴포넌트
  layout/           # 헤더/푸터/테마 토글/꽃잎
data/               # N3 콘텐츠 JSON
lib/                # 타입, 스토리지, SRS, 데이터 로더
```

## 콘텐츠 확장

`data/*.json` 파일을 직접 수정/추가하면 빌드 시 즉시 반영됩니다.
- `vocabulary.json` — 단어 + 단어장(deck)
- `grammar.json` — 문형
- `kanji.json` — 한자 (`koreanReading` 필드에 한국 한자음)
- `reading.json` / `listening.json` — 지문 + 문제
- `mock-test.json` — 모의고사 세션

공개 데이터셋 (예: jlpt-vocab-api, jlpt-kanji-list)을 가져와 위 스키마로 변환하면
콘텐츠를 빠르게 확장할 수 있습니다.

## 로컬 데이터 키

- `jlpt-n3:v1` — 진도, 즐겨찾기, 모의고사 결과, 설정
- 설정 > 데이터 관리에서 초기화 가능

## 라이선스

학습 보조 목적의 개인 프로젝트. 데이터는 자유롭게 수정하여 사용하세요.

---

🌸 합격을 진심으로 응원합니다 — がんばってください!
