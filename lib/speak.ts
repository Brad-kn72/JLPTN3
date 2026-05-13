"use client";

/**
 * 브라우저 SpeechSynthesis로 일본어 발음을 재생.
 * 일본어 음성이 없는 환경에서는 기본 음성으로 폴백.
 */
let cachedJaVoice: SpeechSynthesisVoice | null | undefined;

function getJaVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  if (cachedJaVoice !== undefined) return cachedJaVoice;
  const voices = window.speechSynthesis.getVoices();
  const ja = voices.find((v) => v.lang?.toLowerCase().startsWith("ja"));
  cachedJaVoice = ja ?? null;
  return cachedJaVoice;
}

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  // voices 비동기 로딩 대응
  window.speechSynthesis.onvoiceschanged = () => {
    cachedJaVoice = undefined;
  };
}

export function speakJa(text: string, opts?: { rate?: number; pitch?: number }) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  if (!text) return;
  // 후리가나 표시 제거(보수적으로 그대로 두지만, 예외는 콜러가 처리)
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ja-JP";
  const v = getJaVoice();
  if (v) u.voice = v;
  u.rate = opts?.rate ?? 0.95;
  u.pitch = opts?.pitch ?? 1;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

export function stopSpeak() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
}

export function isTtsAvailable(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}
