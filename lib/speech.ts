// PULSE — High-Fidelity Neural Speech Synthesis & Acoustic Audio Engine
// Provides native-level speech synthesis across English, Spanish, French, Hindi, Arabic, and Portuguese,
// plus multi-layered Web Audio API stadium sound effects (crowd roar, goal horn, command room alert chimes).

export interface SpeechOptions {
  pitch?: number;
  rate?: number;
  volume?: number;
  onStart?: () => void;
  onEnd?: () => void;
}

/**
 * Maps short language codes (en, es, fr, hi, ar, pt) to BCP 47 locales and voice keywords.
 */
const LOCALE_MAP: Record<string, { locale: string; keywords: string[] }> = {
  en: { locale: "en-US", keywords: ["en-US", "en-GB", "English", "Google US English", "Samantha", "Daniel"] },
  es: { locale: "es-ES", keywords: ["es-ES", "es-MX", "Spanish", "Español", "Jorge", "Monica", "Paulina"] },
  fr: { locale: "fr-FR", keywords: ["fr-FR", "fr-CA", "French", "Français", "Thomas", "Amelie"] },
  hi: { locale: "hi-IN", keywords: ["hi-IN", "Hindi", "Lekha", "Google हिन्दी"] },
  ar: { locale: "ar-SA", keywords: ["ar-SA", "ar-EG", "Arabic", "Maged", "Tarika"] },
  pt: { locale: "pt-BR", keywords: ["pt-BR", "pt-PT", "Portuguese", "Luciana", "Joana"] },
};

/**
 * Retrieve the highest quality native speech synthesis voice for a given language.
 */
export function getBestVoice(langCode: string): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;

  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  const config = LOCALE_MAP[langCode.toLowerCase()] || LOCALE_MAP["en"];

  // 1. Exact locale match with Google/Premium keywords
  for (const keyword of config.keywords) {
    const found = voices.find(
      (v) => v.lang.toLowerCase().includes(keyword.toLowerCase()) || v.name.toLowerCase().includes(keyword.toLowerCase())
    );
    if (found) return found;
  }

  // 2. Prefix language match (e.g. any "es-" voice)
  const prefix = config.locale.split("-")[0];
  const prefixMatch = voices.find((v) => v.lang.toLowerCase().startsWith(prefix));
  if (prefixMatch) return prefixMatch;

  // 3. Default fallback
  return voices[0] || null;
}

/**
 * Speaks text using Neural/Native Web Speech API with automatic voice loading & acoustic chime fallback.
 */
export function speakNeural(text: string, langCode = "en", options: SpeechOptions = {}): void {
  if (typeof window === "undefined") return;

  // Ensure any ongoing speech is stopped before starting a new one
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }

  const cleanText = text.replace(/[*_#\[\]`~^]/g, "").trim();
  if (!cleanText) return;

  // Play a subtle acoustic attention chime before speech
  playToneChime(langCode === "en" ? 523.25 : 659.25, 0.12);

  if (!("speechSynthesis" in window)) {
    console.warn("[Speech Engine] Web Speech API not supported in this browser.");
    options.onStart?.();
    setTimeout(() => options.onEnd?.(), 2000);
    return;
  }

  const utterance = new SpeechSynthesisUtterance(cleanText);
  const config = LOCALE_MAP[langCode.toLowerCase()] || LOCALE_MAP["en"];
  utterance.lang = config.locale;
  utterance.pitch = options.pitch ?? (langCode === "en" ? 1.0 : 1.05);
  utterance.rate = options.rate ?? (langCode === "es" || langCode === "fr" ? 1.05 : 0.95);
  utterance.volume = options.volume ?? 1.0;

  // Assign voice if already available, or wait for voiceschanged
  const assignVoiceAndSpeak = () => {
    const voice = getBestVoice(langCode);
    if (voice) utterance.voice = voice;

    utterance.onstart = () => {
      options.onStart?.();
    };
    utterance.onend = () => {
      options.onEnd?.();
    };
    utterance.onerror = (err) => {
      console.warn("[Speech Engine] Speech error:", err);
      options.onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
  };

  const currentVoices = window.speechSynthesis.getVoices();
  if (currentVoices && currentVoices.length > 0) {
    assignVoiceAndSpeak();
  } else {
    window.speechSynthesis.onvoiceschanged = () => {
      assignVoiceAndSpeak();
    };
    // Timeout fallback if voiceschanged never fires
    setTimeout(() => {
      if (!window.speechSynthesis.speaking) assignVoiceAndSpeak();
    }, 300);
  }
}

/**
 * Play a high-fidelity Web Audio API acoustic chime (used for broadcast alerts & UI feedback).
 */
export function playToneChime(freq = 587.33, durationSeconds = 0.18): void {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.25, ctx.currentTime + durationSeconds);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationSeconds);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + durationSeconds);
  } catch {
    // AudioContext blocked by browser policy until interaction
  }
}

/**
 * Play synthesized stadium acoustic events: Goal Horn, Crowd Roar, Corner Whistle, or Emergency Alert.
 */
export function playPitchEventSound(eventType: "corner" | "miss" | "tackle" | "goal" | "emergency" | "broadcast"): void {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();

    if (eventType === "goal") {
      // 1. Triumphant Stadium Goal Horn (Low-mid brass chord + roar)
      const hornFreqs = [146.83, 220.0, 293.66, 440.0]; // D minor triad
      hornFreqs.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 1.8);
      });

      // 2. White noise crowd surge
      playCrowdRoar(ctx, 2.2, 0.25);
    } else if (eventType === "corner" || eventType === "miss" || eventType === "tackle") {
      // Referee Whistle beep + moderate crowd surge
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(2800, ctx.currentTime);
      osc.frequency.setValueAtTime(2600, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);

      playCrowdRoar(ctx, 1.2, 0.12);
    } else if (eventType === "emergency" || eventType === "broadcast") {
      // 3-note Command Room Attention Alert (C5 -> G5 -> C6)
      const notes = [523.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        const start = ctx.currentTime + idx * 0.15;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.18, start);
        gain.gain.exponentialRampToValueAtTime(0.01, start + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.25);
      });
    }
  } catch {
    // Audio block safe catch
  }
}

/**
 * Generate synthetic stadium crowd surge roar using filtered white noise.
 */
function playCrowdRoar(ctx: AudioContext, duration: number, volume: number): void {
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(450, ctx.currentTime);
  filter.Q.setValueAtTime(1.5, ctx.currentTime);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.01, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.3);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noise.start();
  noise.stop(ctx.currentTime + duration);
}
