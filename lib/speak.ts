"use client";

/**
 * 브라우저 SpeechSynthesis로 일본어 발음 재생.
 *
 * 알려진 이슈 해결:
 *  - getVoices()가 첫 호출에서 빈 배열 반환 (Chrome) → voiceschanged 이벤트 + 폴링
 *  - cancel() 직후 speak()가 무시되는 레이스 (Chrome/iOS) → 짧은 setTimeout 후 재시도
 *  - iOS Safari에서 첫 호출 직후만 동작 → 사용자 제스처 안에서 호출되어야 함 (버튼 클릭으로 처리됨)
 *  - 첫 onvoiceschanged 콜백을 받지 못하는 경우 → 100ms 폴링으로 보강
 */

let cachedJaVoice: SpeechSynthesisVoice | null = null;
let voicesAttempted = false;

function pickJaVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;
  // 우선순위: ja-JP > ja > Japanese 포함
  const exact = voices.find((v) => v.lang?.toLowerCase() === "ja-jp");
  if (exact) return exact;
  const startsJa = voices.find((v) => v.lang?.toLowerCase().startsWith("ja"));
  if (startsJa) return startsJa;
  const named = voices.find((v) => /japan/i.test(v.name));
  return named ?? null;
}

function ensureVoiceLoaded(): Promise<SpeechSynthesisVoice | null> {
  if (typeof window === "undefined" || !("speechSynthesis" in window))
    return Promise.resolve(null);
  if (cachedJaVoice) return Promise.resolve(cachedJaVoice);

  // 즉시 한 번 시도
  cachedJaVoice = pickJaVoice();
  if (cachedJaVoice) return Promise.resolve(cachedJaVoice);

  // 폴링 + 이벤트 보강 (최대 1.5초 대기)
  return new Promise((resolve) => {
    let tries = 0;
    const max = 15;
    const check = () => {
      cachedJaVoice = pickJaVoice();
      if (cachedJaVoice || tries++ >= max) {
        resolve(cachedJaVoice);
      } else {
        setTimeout(check, 100);
      }
    };
    try {
      window.speechSynthesis.addEventListener?.("voiceschanged", () => {
        if (!cachedJaVoice) {
          cachedJaVoice = pickJaVoice();
          if (cachedJaVoice) resolve(cachedJaVoice);
        }
      }, { once: false });
    } catch {}
    check();
  });
}

// 페이지 로드 직후 미리 한 번 시도 (예열)
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  if (!voicesAttempted) {
    voicesAttempted = true;
    // 비동기로 한 번 트리거 (getVoices() 호출만으로도 voiceschanged 발화)
    setTimeout(() => {
      cachedJaVoice = pickJaVoice();
    }, 0);
    try {
      window.speechSynthesis.addEventListener?.("voiceschanged", () => {
        cachedJaVoice = pickJaVoice();
      });
    } catch {}
  }
}

function actuallySpeak(text: string, opts: { rate: number; pitch: number }) {
  const synth = window.speechSynthesis;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ja-JP";
  if (cachedJaVoice) u.voice = cachedJaVoice;
  u.rate = opts.rate;
  u.pitch = opts.pitch;
  u.volume = 1;
  u.onerror = (e) => {
    // 일부 브라우저는 'canceled'를 에러로 던짐 — 무시
    if ((e as any).error && (e as any).error !== "canceled" && (e as any).error !== "interrupted") {
      // eslint-disable-next-line no-console
      console.warn("[TTS] error:", (e as any).error);
    }
  };
  try {
    synth.speak(u);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[TTS] speak() threw:", err);
  }
}

export function speakJa(text: string, opts?: { rate?: number; pitch?: number }) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  if (!text) return;

  const synth = window.speechSynthesis;
  const rate = opts?.rate ?? 0.95;
  const pitch = opts?.pitch ?? 1;

  // 이전 발화가 있으면 끊고, 짧은 지연 후 시작 (Chrome cancel 레이스 회피)
  const wasBusy = synth.speaking || synth.pending;
  if (wasBusy) {
    try { synth.cancel(); } catch {}
  }

  const launch = () => {
    // voice가 준비됐다면 그대로, 아니면 즉시 발화 + 백그라운드로 voice 후속 적용
    if (cachedJaVoice) {
      actuallySpeak(text, { rate, pitch });
    } else {
      // voice 로드 시도, 200ms 안에 안 오면 default로 발화
      let fired = false;
      const fire = () => {
        if (fired) return;
        fired = true;
        actuallySpeak(text, { rate, pitch });
      };
      ensureVoiceLoaded().then(() => fire());
      setTimeout(fire, 200);
    }
  };

  if (wasBusy) setTimeout(launch, 80);
  else launch();
}

export function stopSpeak() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try { window.speechSynthesis.cancel(); } catch {}
}

export function isTtsAvailable(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}
