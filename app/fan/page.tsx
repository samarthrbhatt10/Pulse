"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { ZONES, densityColor } from "@/lib/mockData";
import { usePulseSync } from "@/lib/usePulseSync";
import { speakNeural, playPitchEventSound, playToneChime } from "@/lib/speech";

export default function FanHomePage() {
  const { zones } = usePulseSync();
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [audioStreamActive, setAudioStreamActive] = useState(false);
  const [activeAudioLang, setActiveAudioLang] = useState("EN");
  const [varClipOpen, setVarClipOpen] = useState(false);
  const [commentaryIdx, setCommentaryIdx] = useState(0);
  const [commentaryTicker, setCommentaryTicker] = useState("74:12 — Goal Confirmed! Brazil leads Argentina 2-1 after brilliant VAR review.");

  const criticalZones = zones.filter((z) => z.percent >= 85);
  const concourseAZone = zones.find((z) => z.id === "A") || ZONES[0];
  const concourseBZone = zones.find((z) => z.id === "B") || ZONES[1];
  const concourseCZone = zones.find((z) => z.id === "C") || ZONES[2];

  const getMatchCommentaryText = (lang: string, idx = 0) => {
    const scripts: Record<string, string[]> = {
      EN: [
        "74th minute! Brazil moving the ball swiftly through midfield. Bruno Guimarães passes wide to Vinicius Junior on the left flank, cutting inside the penalty box!",
        "Argentina pressing hard now! De Paul intercepts near the box, feeds Julian Alvarez... shot blocked by Marquinhos! Corner kick for Argentina!",
        "78th minute! End-to-end action here at Dallas Stadium! 54,302 fans roaring inside the bowl. Brazil holds on to their thrilling 2 to 1 lead!",
        "82nd minute! Rodrygo breaking away on the counter attack! He cuts inside past Romero, fires a right-footed strike... saved brilliantly by Martinez!",
        "86th minute! High intensity entering the final stretch. Concourse B express concessions reporting smooth 2-minute pickup times for fans in Section 104!"
      ],
      ES: [
        "¡Minuto 74 en el Estadio de Dallas! Brasil mueve el balón con rapidez por el medio campo. ¡Pase abierto para Vinicius Junior por la banda izquierda!",
        "¡Presión intensa de Argentina! De Paul recupera, pase para Julián Álvarez... ¡disparo bloqueado por Marquinhos! ¡Tiro de esquina para Argentina!",
        "¡Minuto 78! ¡Qué partidazo estamos viviendo! Más de cincuenta y cuatro mil almas vibrando en Dallas. Brasil sigue ganando dos por uno.",
        "¡Minuto 82! ¡Rodrygo al contragolpe! Recorta dentro del área, dispara de derecha... ¡atajada espectacular del Dibu Martínez!",
        "¡Minuto 86! Entramos en la recta final del partido. ¡Recuerden que la recogida exprés de alimentos en el Concurso B toma solo 2 minutos para el Sector 104!"
      ],
      PT: [
        "74 minutos no Estádio de Dallas! O Brasil avança com rapidez pelo meio-campo. Bola no pé do Vini Jr na ponta esquerda, parte para cima da marcação!",
        "A Argentina pressiona no ataque! De Paul rouba a bola, toca para o Julián Álvarez... Corte milagroso da zaga brasileira! Escanteio para a Argentina.",
        "78 minutos de emoção pura na Copa do Mundo! Mais de cinquenta e quatro mil torcedores fazendo a festa em Dallas. O Brasil lidera por dois a um!",
        "82 minutos! Olha o contra-ataque do Brasil com Rodrygo! Cortou o zagueiro, bateu pro gol... Defesaça do goleiro argentino!",
        "86 minutos! Reta final eletrizante aqui no Dallas Stadium! E o serviço de entrega no assento segue operando em tempo recorde no Setor 104!"
      ],
      FR: [
        "74e minute au Stade de Dallas ! Le Brésil fait circuler le ballon rapidement au milieu de terrain. Passe sur l'aile gauche pour Vinicius Junior !",
        "L'Argentine met une pression intense ! De Paul intercepte près de la surface, passe à Julian Alvarez... tir contré par Marquinhos ! Corner pour l'Argentine !",
        "78e minute ! Quel match palpitant ici à Dallas ! Plus de 54 000 supporters en folie. Le Brésil conserve son avance deux à un !",
        "82e minute ! Contre-attaque éclair de Rodrygo ! Il repique dans l'axe, frappe du pied droit... arrêt superbe de Martinez !",
        "86e minute ! Haute intensité pour cette fin de match. Le service de restauration express du Hall B fonctionne parfaitement avec deux minutes d'attente !"
      ],
      HI: [
        "डैलस स्टेडियम में 74वां मिनट! ब्राज़ील मिडफ़ील्ड में तेज़ी से गेंद आगे बढ़ा रहा है। लेफ्ट विंग पर विनिशियस जूनियर के पास शानदार पास!",
        "अर्जेंटीना का ज़बरदस्त दबाव! डी पॉल ने गेंद छीनी, जूलियन अल्वारेज़ को पास दिया... मार्किनहोस का शानदार ब्लॉक! अर्जेंटीना को कॉर्नर किक!",
        "78वां मिनट! डैलस में 54 हज़ार से ज़्यादा फैंस का जोश चरम पर! ब्राज़ील दो एक की बढ़त बनाए हुए है!",
        "82वां मिनट! रोड्रिगो का तेज़ काउंटर अटैक! बॉक्स के अंदर आकर शॉट लगाया... मार्टिनेज़ का बेहतरीन बचाव!",
        "86वां मिनट! मैच के आखिरी पलों में रोमांच शिखर पर। कॉनकोर्स बी में एक्सप्रेस फूड डिलीवरी मात्र 2 मिनट में उपलब्ध है!"
      ],
      AR: [
        "الدقيقة الرابعة والسبعون في استاد دالاس! البرازيل تنقل الكرة بسرعة عبر خط الوسط. تمريرة رائعة إلى فينيسيوس جونيور على الجناح الأيسر!",
        "ضغط قوي من الأرجنتين الآن! دي بول يقطع الكرة، يمرر إلى جوليان ألفاريز... تسديدة يتصدى لها ماركينيوس! ركلة ركنية للأرجنتين!",
        "الدقيقة الثامنة والسبعون! أجواء حماسية لا توصف مع أكثر من أربعة وخمسين ألف مشجع في دالاس! البرازيل تتقدم بهدفين مقابل هدف!",
        "الدقيقة الثانية والثمانون! هجمة مرتدة سريعة للبرازيل بقيادة رودريغو! تسديدة قوية يتصدى لها الحارس مارتينيز ببراعة!",
        "الدقيقة السادسة والثمانون! إثارة متواصلة في اللحظات الأخيرة. خدمة الطعام السريعة في البهو ب تعمل بسلاسة تامة مع دقيقتين فقط للاستلام!"
      ],
    };
    const list = scripts[lang.toUpperCase()] || scripts["EN"];
    return list[idx % list.length];
  };

  const triggerAudioCommentary = (lang: string, targetIdx?: number, isAuto = false) => {
    const idx = targetIdx !== undefined ? targetIdx : commentaryIdx;
    const text = getMatchCommentaryText(lang, idx);
    setCommentaryTicker(`🎧 [LIVE ${lang.toUpperCase()} STREAM] ${text}`);
    if (!isAuto) {
      playPitchEventSound(idx % 2 === 0 ? "goal" : "corner");
    }
    speakNeural(text, lang.toLowerCase());
  };

  const handleToggleAudio = () => {
    const nextState = !audioStreamActive;
    setAudioStreamActive(nextState);
    if (nextState) {
      triggerAudioCommentary(activeAudioLang, commentaryIdx, false);
    } else {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setCommentaryTicker("74:12 — Goal Confirmed! Brazil leads Argentina 2-1 after brilliant VAR review.");
    }
  };

  const handleLangChange = (lang: string) => {
    setActiveAudioLang(lang);
    if (audioStreamActive) {
      triggerAudioCommentary(lang, commentaryIdx, false);
    }
  };

  useEffect(() => {
    if (!audioStreamActive) return;
    const interval = setInterval(() => {
      setCommentaryIdx((prev) => {
        const nextIdx = (prev + 1) % 5;
        triggerAudioCommentary(activeAudioLang, nextIdx, true);
        return nextIdx;
      });
    }, 15000);
    return () => clearInterval(interval);
  }, [audioStreamActive, activeAudioLang]);

  return (
    <div className="flex flex-col gap-6">
      {/* Mobile-only Header */}
      <div className="md:hidden flex items-center justify-between pt-2 pb-1">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-primary pulse-teal" />
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Live Event Portal</span>
        </div>
        <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-3 py-1">
          <span className="material-symbols-outlined text-primary text-[14px]">nfc</span>
          <span className="text-[11px] font-bold text-primary">NFC Active</span>
        </div>
      </div>

      {/* Hero Section: Digital Ticket Wallet Credentials & Live Match Scoreboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Digital Wallet Ticket Card (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-5 sm:p-6 text-white fan-shadow relative overflow-hidden border border-slate-700/80 flex flex-col justify-between">
          <div className="absolute right-0 top-0 w-64 h-64 bg-primary/15 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-mono text-[10px] font-black uppercase tracking-wider">
                  ★ GLOBAL TOURNAMENT 2026 PASS
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-300">DALLAS STADIUM</span>
            </div>

            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Assigned Seat</span>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-0.5">
                  Sec 104 · Row 12 · Seat 8
                </h2>
                <p className="text-xs text-emerald-400 font-semibold mt-1 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">turnstile</span>
                  <span>Assigned Entry: Gate 3 Express NFC Turnstile</span>
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex flex-col items-center justify-center p-1 font-mono text-center flex-shrink-0">
                <span className="text-[9px] text-slate-300 font-bold">GATE</span>
                <span className="text-lg font-black text-white leading-none">03</span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Holder: Samarth R. Bhatt</span>
            </div>
            <button
              onClick={() => setTicketModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md transition-all flex items-center gap-1.5 active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px]">qr_code_2</span>
              <span>View Pass</span>
            </button>
          </div>
        </div>

        {/* Live Match Scoreboard & Audio Commentary Feed (7 cols) */}
        <div className="lg:col-span-7 bg-gradient-to-r from-primary via-violet-600 to-accent/90 rounded-3xl p-5 sm:p-7 text-white fan-shadow relative overflow-hidden shadow-xl flex flex-col justify-between">
          <div className="absolute right-0 top-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-white/90">🔴 LIVE — Dallas Stadium Event</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setVarClipOpen(!varClipOpen)}
                className="px-3 py-1 rounded-full bg-black/40 hover:bg-black/60 border border-white/20 text-xs font-mono font-bold text-emerald-300 flex items-center gap-1.5 transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">live_tv</span>
                <span>VAR Review: Goal Confirmed (74')</span>
              </button>
              <span className="text-xs font-mono font-bold bg-black/30 backdrop-blur-md px-3 py-1 rounded-full">
                74:12 ⚽
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between relative z-10 py-2 sm:py-4 max-w-2xl mx-auto w-full">
            <div className="text-center flex-1">
              <div className="text-3xl sm:text-5xl font-black tracking-tight">🇧🇷 BRA</div>
              <div className="text-xs sm:text-sm font-semibold opacity-80 mt-1">Brazil National Team</div>
            </div>
            <div className="text-4xl sm:text-6xl font-black tabular-nums px-4 sm:px-8 tracking-tighter drop-shadow-md">
              2 — 1
            </div>
            <div className="text-center flex-1">
              <div className="text-3xl sm:text-5xl font-black tracking-tight">🇦🇷 ARG</div>
              <div className="text-xs sm:text-sm font-semibold opacity-80 mt-1">Argentina National Team</div>
            </div>
          </div>

          {/* Low-Latency In-Seat Audio & Telemetry Footer */}
          <div className="pt-4 mt-3 border-t border-white/20 flex flex-col gap-3 relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleToggleAudio}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                    audioStreamActive
                      ? "bg-white text-slate-950 shadow-md scale-105"
                      : "bg-black/30 hover:bg-black/50 text-white border border-white/20"
                  }`}
                >
                  <span className={`material-symbols-outlined text-[18px] ${audioStreamActive ? "text-primary animate-pulse" : ""}`}>
                    {audioStreamActive ? "headset_mic" : "headset"}
                  </span>
                  <span>{audioStreamActive ? `🎧 Live Audio Feed ON (${activeAudioLang})` : "🎧 Listen to In-Seat Audio Commentary"}</span>
                </button>

                {audioStreamActive && (
                  <div className="flex flex-wrap items-center gap-1 bg-black/50 backdrop-blur-md rounded-xl p-1 border border-white/20">
                    {["EN", "ES", "PT", "FR", "HI", "AR"].map((lang) => (
                      <button
                        key={lang}
                        onClick={() => handleLangChange(lang)}
                        className={`px-2 py-0.5 rounded text-[10px] font-black transition-all ${
                          activeAudioLang === lang ? "bg-primary text-white shadow-2xs scale-105" : "text-white/70 hover:text-white"
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                    <button
                      onClick={() => triggerAudioCommentary(activeAudioLang, (commentaryIdx + 1) % 5, false)}
                      className="ml-1 px-2.5 py-0.5 rounded text-[10px] font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1 transition-transform active:scale-95"
                      title="Play next live match broadcast update"
                    >
                      <span className="material-symbols-outlined text-[14px]">volume_up</span>
                      <span>Play Update</span>
                    </button>
                  </div>
                )}
              </div>

              <span className="text-[11px] font-mono font-medium text-white/80 hidden sm:inline">
                ⚡ 5G Ultra-Low Latency Mesh · 4.2ms Sync
              </span>
            </div>

            {/* Live Audio Commentary Text Ticker */}
            {audioStreamActive && (
              <div className="bg-black/40 border border-white/20 rounded-2xl p-3 flex items-center gap-3 animate-in fade-in duration-200">
                <div className="flex items-end gap-1 h-5 px-1.5 py-1 bg-primary/20 rounded border border-primary/30 flex-shrink-0">
                  <span className="w-1 bg-primary rounded-full animate-[bounce_0.8s_infinite_0.1s] h-3" />
                  <span className="w-1 bg-primary rounded-full animate-[bounce_0.8s_infinite_0.3s] h-4" />
                  <span className="w-1 bg-primary rounded-full animate-[bounce_0.8s_infinite_0.2s] h-2.5" />
                  <span className="w-1 bg-primary rounded-full animate-[bounce_0.8s_infinite_0.4s] h-3.5" />
                </div>
                <div className="text-xs font-medium text-white/95 leading-relaxed tracking-wide flex-1 font-mono">
                  {commentaryTicker}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* VAR Multi-Angle Instant Clip Box (Toggled) */}
      {varClipOpen && (
        <div className="bg-card rounded-3xl p-5 border border-border fan-shadow animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-500 text-xl">slow_motion_video</span>
              <h3 className="font-black text-sm text-foreground">Official VAR Goal Check Replay Feed (Minute 74')</h3>
            </div>
            <button onClick={() => setVarClipOpen(false)} className="text-xs font-bold text-muted-foreground hover:text-foreground">
              Close Replay ✕
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-900 rounded-2xl p-3 border border-slate-700/80 text-white flex flex-col justify-between aspect-video relative overflow-hidden group">
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 text-[10px] font-mono font-bold text-emerald-400">
                CAM 1: GOAL LINE
              </div>
              <div className="my-auto text-center font-mono opacity-60 text-[11px]">Ball fully crossed goal plane (14.2cm clear)</div>
              <div className="text-[10px] text-slate-400 font-bold flex justify-between">
                <span>Ref: J. Martinez</span>
                <span className="text-emerald-400">DECISION: GOAL ✅</span>
              </div>
            </div>
            <div className="bg-slate-900 rounded-2xl p-3 border border-slate-700/80 text-white flex flex-col justify-between aspect-video relative overflow-hidden">
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 text-[10px] font-mono font-bold text-cyan-400">
                CAM 2: OFFSIDE LINE
              </div>
              <div className="my-auto text-center font-mono opacity-60 text-[11px]">No offside infraction detected during buildup</div>
              <div className="text-[10px] text-slate-400 font-bold flex justify-between">
                <span>VAR Check ID #892</span>
                <span className="text-emerald-400">VERIFIED ✅</span>
              </div>
            </div>
            <div className="bg-slate-900 rounded-2xl p-3 border border-slate-700/80 text-white flex flex-col justify-between aspect-video relative overflow-hidden">
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 text-[10px] font-mono font-bold text-amber-400">
                CAM 3: TACTICAL OVERHEAD
              </div>
              <div className="my-auto text-center font-mono opacity-60 text-[11px]">3D volumetric player tracking active</div>
              <div className="text-[10px] text-slate-400 font-bold flex justify-between">
                <span>Optical Tracking Matrix</span>
                <span className="text-emerald-400">SYNCED ✅</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Desktop/Tablet Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Quick Actions & Live Announcements (7 cols on desktop) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Quick Access Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">bolt</span>
                Smart Match-Day Actions
              </h2>
              <span className="text-[11px] font-bold text-primary flex items-center gap-1">
                <span>All actions synced with seat coordinates</span>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {[
                { href: "/fan/order", icon: "restaurant", label: "Smart F&B Order", desc: "In-Seat & Lockers", color: "var(--primary)", badge: "ZERO QUEUE" },
                { href: "/fan/map", icon: "map", label: "Indoor Map (3D)", desc: "Turn-by-turn routes", color: "#10b981", badge: "FRUIN LOS" },
                { href: "/fan/chat", icon: "chat_bubble", label: "Gemini AI Concierge", desc: "Ask anything 24/7", color: "#3b82f6" },
                { href: "/fan/safety", icon: "emergency", label: "Safety & SOS Hub", desc: "Instant assistance", color: "#ef4444" },
              ].map((action) => (
                <Link key={action.href} href={action.href} className="group">
                  <div className="h-full bg-card hover:bg-card-hover rounded-3xl p-4 text-center fan-shadow border border-border hover:border-primary/50 transition-all duration-200 flex flex-col items-center justify-between group-active:scale-95 relative overflow-hidden">
                    {action.badge && (
                      <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-primary/15 text-primary text-[9px] font-black font-mono">
                        {action.badge}
                      </span>
                    )}
                    <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-3xl" style={{ color: action.color }}>
                        {action.icon}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-black text-foreground block leading-tight">{action.label}</span>
                      <span className="text-[10px] font-semibold text-muted-foreground block mt-1 leading-tight">{action.desc}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Active Announcements & PA Dispatch */}
          <div>
            <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">campaign</span>
              Live PA Audio Feed & Operational Dispatch
            </h2>
            <div className="space-y-3">
              {[
                {
                  msg: "Concourse A (North Bowl) is experiencing heavy footfall (94.5% capacity). To avoid concourse lines, order your half-time F&B right to your seat or use Express Locker Bay 4.",
                  time: "1m ago",
                  urgent: true,
                  icon: "warning",
                  actionHref: "/fan/order",
                  actionText: "Order Express F&B Now 🍔",
                },
                {
                  msg: "Free chilled drinking water stations and cooling mist zones are active at Concourse B and Concourse D.",
                  time: "6m ago",
                  urgent: false,
                  icon: "water_drop",
                },
                {
                  msg: "Post-match express shuttles and Dallas Metro Gold Line trains will begin staging at Exit Gate 2 immediately following the final whistle.",
                  time: "14m ago",
                  urgent: false,
                  icon: "directions_bus",
                  actionHref: "/fan/map",
                  actionText: "View Exit Map 🗺️",
                },
              ].map((ann, i) => (
                <div
                  key={i}
                  className={`bg-card rounded-2xl p-4 fan-shadow border transition-all hover:bg-card-hover ${
                    ann.urgent ? "border-red-500/40 bg-red-500/5" : "border-border"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        ann.urgent ? "bg-red-500/15 text-red-500" : "bg-primary/15 text-primary"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[22px]">{ann.icon}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[11px] font-black uppercase tracking-wider ${ann.urgent ? "text-red-500" : "text-primary"}`}>
                          {ann.urgent ? "Priority Advisory · Concourse Alert" : "Operations Dispatch"}
                        </span>
                        <span className="text-[11px] text-muted-foreground font-semibold">{ann.time}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-foreground font-medium leading-relaxed">{ann.msg}</p>
                      {ann.actionHref && (
                        <Link
                          href={ann.actionHref}
                          className="inline-flex items-center gap-1.5 mt-2.5 px-3 py-1.5 rounded-xl bg-primary/15 hover:bg-primary/25 text-primary text-xs font-black uppercase tracking-wider transition-all"
                        >
                          <span>{ann.actionText}</span>
                          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Concourse Wait Times & Crowd Heatmap (5 cols on desktop) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-card rounded-3xl p-5 sm:p-6 fan-shadow border border-border">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
              <div>
                <h3 className="text-sm sm:text-base font-black text-foreground flex items-center gap-2">
                  <span className="material-symbols-outlined text-accent text-[22px]">groups</span>
                  Real-Time Concourse Wait Times
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">Live Fruin LOS Telemetry · Section 104 Perimeter</p>
              </div>
              <span className="text-xs text-red-500 font-black bg-red-500/15 border border-red-500/30 px-3 py-1 rounded-full animate-pulse">
                85.5% LOAD
              </span>
            </div>

            {/* Concourse & Restroom Bottleneck Advisory Bars */}
            <div className="space-y-3 mb-5">
              <div className="p-3.5 rounded-2xl bg-muted/60 border border-border/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-red-500 text-xl">wc</span>
                  <div>
                    <div className="text-xs font-bold text-foreground">Concourse A North Restrooms</div>
                    <div className="text-[11px] text-muted-foreground font-medium">Nearest to Sec 104 · LOS E Critical</div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-red-500/15 text-red-500 font-black text-xs font-mono">
                  14 min wait ⚠️
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-emerald-500 text-xl">wc</span>
                  <div>
                    <div className="text-xs font-bold text-foreground">Concourse B South Restrooms</div>
                    <div className="text-[11px] text-muted-foreground font-medium">220m walk via Express Tunnel · LOS A</div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-500 font-black text-xs font-mono">
                  3 min wait ✅
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-xl">restaurant</span>
                  <div>
                    <div className="text-xs font-bold text-foreground">Concourse B F&B Locker Bay #4</div>
                    <div className="text-[11px] text-muted-foreground font-medium">Pre-order via app & skip all lines</div>
                  </div>
                </div>
                <Link
                  href="/fan/order"
                  className="px-3 py-1.5 rounded-xl bg-primary text-white font-black text-xs uppercase tracking-wider shadow-sm hover:bg-primary/90 transition-all"
                >
                  Order ($0 Line)
                </Link>
              </div>
            </div>

            {/* Zone Density Bars */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              {zones.slice(0, 4).map((zone) => (
                <div key={zone.id} className="bg-muted/50 rounded-2xl p-3 border border-border/60 text-center flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-bold mb-1.5">
                      <span className="text-muted-foreground">Zone {zone.id}</span>
                      <span style={{ color: densityColor(zone.density) }}>{zone.percent}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          background: densityColor(zone.density),
                          width: `${zone.percent}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="mt-2 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
                    {zone.name.split(" ")[0]}
                  </div>
                </div>
              ))}
            </div>

            {criticalZones.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-3.5 flex items-start gap-3">
                <span className="material-symbols-outlined text-red-500 text-[20px] flex-shrink-0 mt-0.5">warning</span>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Concourse Bottleneck Advisory</h4>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    Zones {criticalZones.map((z) => z.id).join(", ")} are currently in Fruin LOS D–E territory (&gt;84% capacity). We strongly recommend pre-ordering F&B to your seat or locker.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Digital Wallet Ticket Modal */}
      {ticketModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl max-w-sm w-full p-6 fan-shadow text-center relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setTicketModalOpen(false)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              ✕
            </button>

            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded bg-primary/20 text-primary font-mono text-[10px] font-black uppercase tracking-wider">
                OFFICIAL NFC DIGITAL PASS
              </span>
            </div>

            <h3 className="text-xl font-black text-foreground">DALLAS STADIUM</h3>
            <p className="text-xs text-muted-foreground font-semibold">GLOBAL TOURNAMENT 2026 · SEMIFINAL</p>

            <div className="my-5 p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white border border-slate-700 space-y-3">
              <div className="grid grid-cols-3 gap-2 text-center border-b border-white/10 pb-3 font-mono">
                <div>
                  <span className="text-[9px] text-slate-400 block uppercase">Section</span>
                  <span className="text-lg font-black text-white">104</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block uppercase">Row</span>
                  <span className="text-lg font-black text-white">12</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block uppercase">Seat</span>
                  <span className="text-lg font-black text-white">08</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Gate: <b>03 Express</b></span>
                <span className="text-emerald-400 font-bold">VIP Access Tier</span>
              </div>
            </div>

            {/* Simulated Barcode / NFC Tap */}
            <div className="bg-white p-4 rounded-2xl mx-auto max-w-[220px] shadow-inner mb-4 flex flex-col items-center">
              <div className="w-full h-24 bg-slate-900 rounded-xl flex flex-col items-center justify-center p-2 text-white font-mono">
                <span className="material-symbols-outlined text-4xl text-emerald-400 animate-pulse">contactless</span>
                <span className="text-[10px] text-emerald-300 font-bold mt-1">HOLD NEAR TURNSTILE 03</span>
              </div>
              <span className="font-mono text-[11px] text-slate-600 font-bold mt-2">#8492-4910-DALLAS</span>
            </div>

            <p className="text-[11px] text-muted-foreground font-medium mb-4">
              Steward QR check verified. Your seat coordinate mesh is active for GPS F&B ordering and emergency SOS dispatch.
            </p>

            <button
              onClick={() => setTicketModalOpen(false)}
              className="w-full py-3 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-xs uppercase tracking-wider shadow-md transition-all"
            >
              Done · Return to Portal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
