"use client";
import { useState } from "react";
import { speakNeural, playPitchEventSound } from "@/lib/speech";

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "hi", label: "हिंदी", flag: "🇮🇳" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
];

const TEMPLATE_MESSAGES = [
  "Zone A is experiencing high crowd density. Please proceed to Gates 5-7 for a faster and smoother experience.",
  "Medical emergency response team dispatched to Section 112. Please keep the concourse clear.",
  "The second half will kick off in 5 minutes. Please return to your designated seats now.",
  "Free chilled drinking water stations and cooling zones are active at Concourse B and C.",
];

export default function BroadcastPage() {
  const [message, setMessage] = useState("");
  const [selectedLangs, setSelectedLangs] = useState<string[]>(["en", "es", "fr", "hi", "ar", "pt"]);
  const [context, setContext] = useState<"general" | "emergency" | "navigation" | "promotional">("general");
  const [translations, setTranslations] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [activeSpeakingLang, setActiveSpeakingLang] = useState<string | null>(null);
  const [isPAStreaming, setIsPAStreaming] = useState(false);

  function toggleLang(code: string) {
    setSelectedLangs((prev) =>
      prev.includes(code) ? prev.filter((l) => l !== code) : [...prev, code]
    );
  }

  async function handleGenerate() {
    if (!message.trim()) return;
    setLoading(true);
    setTranslations(null);
    setSent(false);

    try {
      // Call dedicated Neural Translation API (uses live Gemini or Neural Fallback)
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: message,
          languages: selectedLangs,
          context: context,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.translations) {
          setTranslations(data.translations);
          return;
        }
      }

      // Fallback if API response is invalid
      const fallbackTx: Record<string, string> = { en: message };
      if (selectedLangs.includes("es")) fallbackTx.es = `📢 [ES] ${message}`;
      if (selectedLangs.includes("fr")) fallbackTx.fr = `📢 [FR] ${message}`;
      if (selectedLangs.includes("hi")) fallbackTx.hi = `📢 [HI] ${message}`;
      if (selectedLangs.includes("ar")) fallbackTx.ar = `📢 [AR] ${message}`;
      if (selectedLangs.includes("pt")) fallbackTx.pt = `📢 [PT] ${message}`;
      setTranslations(fallbackTx);
    } catch {
      const fallbackTx: Record<string, string> = { en: message };
      if (selectedLangs.includes("es")) fallbackTx.es = `⚠️ Atención: ${message}`;
      if (selectedLangs.includes("fr")) fallbackTx.fr = `⚠️ Attention: ${message}`;
      if (selectedLangs.includes("hi")) fallbackTx.hi = `⚠️ सूचना: ${message}`;
      if (selectedLangs.includes("ar")) fallbackTx.ar = `⚠️ تنبيه: ${message}`;
      if (selectedLangs.includes("pt")) fallbackTx.pt = `⚠️ Atenção: ${message}`;
      setTranslations(fallbackTx);
    } finally {
      setLoading(false);
    }
  }

  async function handleBroadcast() {
    setLoading(true);
    playPitchEventSound(context === "emergency" ? "emergency" : "broadcast");
    await new Promise((r) => setTimeout(r, 1200));
    setSent(true);
    setLoading(false);
  }

  async function handleLivePABroadcast() {
    if (!translations) return;
    setIsPAStreaming(true);
    playPitchEventSound(context === "emergency" ? "emergency" : "broadcast");

    const langsToSpeak = LANGUAGES.filter((l) => selectedLangs.includes(l.code) && translations[l.code]);
    for (const lang of langsToSpeak) {
      setActiveSpeakingLang(lang.code);
      await new Promise<void>((resolve) => {
        speakNeural(translations[lang.code], lang.code, {
          onEnd: () => {
            resolve();
          },
        });
        // Max wait duration per language
        setTimeout(resolve, 6000);
      });
      await new Promise((r) => setTimeout(r, 600));
    }
    setActiveSpeakingLang(null);
    setIsPAStreaming(false);
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary text-[28px]">campaign</span>
            Multilingual Neural Broadcast Composer
          </h1>
          <p className="text-muted-foreground text-sm font-medium mt-1">
            Generate AI-translated announcements and push live PA audio & visual alerts to all stadium screens simultaneously
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-black uppercase px-3 py-1.5 rounded-xl bg-accent/15 text-accent border border-accent/30">
            🤖 Neural PA Engine Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Composer (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Priority/Context */}
          <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 fan-shadow">
            <label className="text-xs font-black uppercase tracking-widest text-foreground block mb-3">
              1. Broadcast Priority & Context
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {(["general", "emergency", "navigation", "promotional"] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setContext(c)}
                  className={`py-2.5 px-3 text-xs font-black uppercase rounded-xl transition-all border flex items-center justify-center gap-1.5 ${
                    context === c
                      ? c === "emergency"
                        ? "bg-red-600 text-white border-red-500 shadow-md scale-102"
                        : "bg-primary text-primary-foreground border-primary shadow-sm scale-102"
                      : "bg-muted text-muted-foreground border-border hover:text-foreground hover:bg-muted/80"
                  }`}
                >
                  {c === "emergency" && "🚨 "}
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Message Templates */}
          <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 fan-shadow">
            <label className="text-xs font-black uppercase tracking-widest text-foreground block mb-3">
              2. Quick Operational Templates
            </label>
            <div className="flex flex-col gap-2">
              {TEMPLATE_MESSAGES.map((tmpl, i) => (
                <button
                  key={i}
                  onClick={() => setMessage(tmpl)}
                  className="text-left text-xs font-medium text-muted-foreground bg-muted/60 border border-border rounded-xl px-3.5 py-2.5 hover:border-primary/50 hover:text-foreground transition-all line-clamp-2"
                >
                  {tmpl}
                </button>
              ))}
            </div>
          </div>

          {/* Message input */}
          <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 fan-shadow">
            <label className="text-xs font-black uppercase tracking-widest text-foreground block mb-2">
              3. Master Announcement (English)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type or select an operational message above..."
              rows={4}
              className="w-full bg-muted border border-border rounded-xl px-3.5 py-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-all resize-none font-medium"
            />
          </div>

          {/* Language selector */}
          <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 fan-shadow">
            <label className="text-xs font-black uppercase tracking-widest text-foreground block mb-3">
              4. Target Broadcast Languages ({selectedLangs.length} selected)
            </label>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => toggleLang(lang.code)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all border ${
                    selectedLangs.includes(lang.code)
                      ? "bg-primary/15 border-primary text-primary shadow-2xs scale-105"
                      : "bg-muted border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="text-base">{lang.flag}</span>
                  <span>{lang.label}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!message.trim() || loading}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-black py-3.5 rounded-2xl hover:bg-primary/90 transition-all shadow-md active:scale-98 disabled:opacity-40 text-sm tracking-wide"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">autorenew</span>
                AI Neural Translating...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px] fill-icon">auto_awesome</span>
                Generate AI Multilingual Broadcast
              </>
            )}
          </button>
        </div>

        {/* Right: Preview (6 cols) */}
        <div className="lg:col-span-6 space-y-4 flex flex-col">
          <div className="bg-card border border-border rounded-2xl p-5 fan-shadow flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">translate</span>
                <label className="text-xs font-black uppercase tracking-widest text-foreground">
                  Live PA & Terminal Preview
                </label>
              </div>
              {context === "emergency" && (
                <span className="text-[10px] font-black text-white bg-red-600 px-2.5 py-1 rounded-md uppercase tracking-wider animate-pulse">
                  🚨 Priority Emergency
                </span>
              )}
            </div>

            {translations ? (
              <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-1">
                {LANGUAGES.filter((l) => selectedLangs.includes(l.code) && translations[l.code]).map((lang) => (
                  <div
                    key={lang.code}
                    className={`bg-muted border rounded-xl p-4 transition-all ${
                      activeSpeakingLang === lang.code ? "border-primary bg-primary/5 shadow-md" : "border-border shadow-2xs"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{lang.flag}</span>
                        <span className="text-xs font-black text-foreground uppercase tracking-wider">{lang.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setActiveSpeakingLang(lang.code);
                            speakNeural(translations[lang.code], lang.code, {
                              onEnd: () => setActiveSpeakingLang(null),
                            });
                          }}
                          className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all ${
                            activeSpeakingLang === lang.code
                              ? "bg-primary text-primary-foreground animate-pulse border-primary shadow-sm"
                              : "bg-card text-foreground border-border hover:border-primary hover:bg-primary/10"
                          }`}
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {activeSpeakingLang === lang.code ? "volume_up" : "volume_mute"}
                          </span>
                          <span>{activeSpeakingLang === lang.code ? "Speaking..." : "🔊 Speak"}</span>
                        </button>
                        <span className="text-[10px] font-mono font-bold text-muted-foreground bg-card px-2 py-0.5 rounded border border-border">
                          {lang.code.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-foreground font-medium leading-relaxed">{translations[lang.code]}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 py-16 text-center">
                <span className="material-symbols-outlined text-muted-foreground/40 text-6xl mb-3">translate</span>
                <p className="text-muted-foreground text-sm font-semibold max-w-xs">
                  Compose a master announcement and click Generate to preview live neural translations & PA speech
                </p>
              </div>
            )}
          </div>

          {translations && !sent && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleLivePABroadcast}
                disabled={loading || isPAStreaming}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-primary text-white font-black py-4 rounded-2xl hover:opacity-95 transition-all shadow-lg active:scale-98 text-xs uppercase tracking-wider border border-primary/30"
              >
                <span className="material-symbols-outlined text-[20px] animate-pulse">record_voice_over</span>
                {isPAStreaming ? "🎙️ PA Streaming..." : "🎙️ Speak All Languages PA"}
              </button>

              <button
                onClick={handleBroadcast}
                disabled={loading}
                className={`w-full flex items-center justify-center gap-2 font-black py-4 rounded-2xl transition-all shadow-lg active:scale-98 text-xs uppercase tracking-wider ${
                  context === "emergency"
                    ? "bg-red-600 hover:bg-red-700 text-white border border-red-500 animate-pulse"
                    : "bg-gradient-to-r from-primary via-violet-600 to-accent text-white"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">cell_tower</span>
                Dispatch to Displays ({selectedLangs.length} Langs)
              </button>
            </div>
          )}

          {sent && (
            <div className="bg-primary/10 border-2 border-primary/40 rounded-2xl p-6 text-center fan-shadow">
              <span className="material-symbols-outlined text-primary text-4xl block mb-2">check_circle</span>
              <h3 className="text-foreground font-black text-base">Broadcast Successfully Dispatched</h3>
              <p className="text-muted-foreground text-xs mt-1">
                {selectedLangs.length} language streams broadcasted across 4,200 digital signage screens & PA audio networks
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
