"use client";
import { useState, useRef, useEffect } from "react";

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "hi", label: "हिंदी", flag: "🇮🇳" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
];

const LOCALIZED_GREETINGS: Record<string, string> = {
  en: "Hi! I'm your PULSE Stadium Assistant 🏟️ Powered by Gemini 2.5 AI. I can help you find amenities, navigate turn-by-turn inside the FIFA 2026 stadium, check crowd bottlenecks, or order express in-seat food. Ask me anything — I speak your language!",
  es: "¡Hola! Soy tu Asistente de Estadio PULSE 🏟️ Impulsado por Gemini 2.5 AI. Puedo ayudarte a encontrar servicios, navegar paso a paso por el estadio FIFA 2026, consultar niveles de multitud o pedir comida directo a tu asiento. ¡Pregúntame lo que quieras!",
  fr: "Bonjour ! Je suis votre Assistant Stade PULSE 🏟️ Propulsé par Gemini 2.5 AI. Je peux vous guider vers votre siège, trouver les toilettes ou la restauration, surveiller les foules et commander votre repas directement en tribune FIFA 2026. Posez vos questions !",
  hi: "नमस्ते! मैं आपका PULSE स्टेडियम असिस्टेंट हूँ 🏟️ Gemini 2.5 AI द्वारा संचालित। मैं आपको फीफा 2026 स्टेडियम में नेविगेट करने, सुविधाएं खोजने, भीड़भाड़ जांचने और सीट पर खाना ऑर्डर करने में मदद कर सकता हूँ। कुछ भी पूछें!",
  ar: "مرحباً! أنا مساعد ملعب PULSE الذكي 🏟️ مدعوم بـ Gemini 2.5 AI. يمكنني مساعدتك في العثور على المرافق، والتنقل خطوة بخطوة داخل استاد كأس العالم 2026، ومتابعة الازدحام، أو طلب الطعام مباشرة إلى مقعدك. اسألني أي شيء!",
  pt: "Olá! Sou seu Assistente de Estádio PULSE 🏟️ Desenvolvido por Gemini 2.5 AI. Posso te ajudar a encontrar serviços, navegar dentro do estádio da Copa do Mundo 2026, verificar multidões ou pedir comida no seu assento. Pergunte qualquer coisa!",
};

const LOCALIZED_QUICK_REPLIES: Record<string, string[]> = {
  en: ["Where's the restroom? 🚽", "Is Zone A crowded?", "Find me food nearby 🍔", "How do I reach seat 118-14?"],
  es: ["¿Dónde está el baño? 🚽", "¿Está llena la Zona A?", "Búscame comida cerca 🍔", "¿Cómo llego a mi asiento 118-14?"],
  fr: ["Où sont les toilettes ? 🚽", "La Zone A est-elle bondée ?", "Trouvez-moi à manger 🍔", "Comment aller au siège 118-14 ?"],
  hi: ["शौचालय कहाँ है? 🚽", "क्या ज़ोन A में भीड़ है?", "नज़दीकी खाना खोजें 🍔", "सीट 118-14 तक कैसे पहुंचें?"],
  ar: ["أين دورات المياه؟ 🚽", "هل المنطقة A مزدحمة؟", "ابحث عن طعام قريب 🍔", "كيف أصل إلى المقعد 118-14؟"],
  pt: ["Onde fica o banheiro? 🚽", "A Zona A está lotada?", "Encontrar comida perto 🍔", "Como chego ao assento 118-14?"],
};

interface Message {
  role: "user" | "assistant";
  content: string;
  loading?: boolean;
}

function StreamingBubble({ content, done }: { content: string; done: boolean }) {
  return (
    <span>
      {content}
      {!done && (
        <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 align-middle animate-[blink_0.8s_infinite]" />
      )}
    </span>
  );
}

export default function FanChatPage() {
  const [activeLang, setActiveLang] = useState("en");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: LOCALIZED_GREETINGS.en },
  ]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleLanguageChange(code: string) {
    setActiveLang(code);
    // Update or add localized greeting when switching languages
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: LOCALIZED_GREETINGS[code] || LOCALIZED_GREETINGS.en },
    ]);
  }

  async function sendMessage(text?: string) {
    const query = text ?? input.trim();
    if (!query || streaming) return;
    setInput("");

    const userMsg: Message = { role: "user", content: query };
    setMessages((prev) => [...prev, userMsg, { role: "assistant", content: "", loading: true }]);
    setStreaming(true);

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          context: `Fan inside FIFA 2026 stadium. Target preferred language: ${activeLang.toUpperCase()} (${LANGUAGES.find((l) => l.code === activeLang)?.label ?? "English"}). Please respond fully in this exact language.`,
        }),
      });
      const data = await res.json();
      const reply = data.reply ?? "I'm processing your request. Please try again.";

      setMessages((prev) => prev.slice(0, -1));
      const final: Message = { role: "assistant", content: "" };
      setMessages((prev) => [...prev, final]);

      for (let i = 0; i <= reply.length; i++) {
        await new Promise((r) => setTimeout(r, 12));
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { ...copy[copy.length - 1], content: reply.slice(0, i) };
          return copy;
        });
      }
    } catch {
      const fallbackMsg =
        activeLang === "es"
          ? "¡Estoy aquí para ayudarte! Intenta preguntar: '¿Dónde está el baño?' o '¿Cómo está la ocupación en Zona A?'"
          : activeLang === "fr"
          ? "Je suis là pour vous aider ! Essayez de demander : 'Où sont les toilettes ?' ou 'Quel est le trafic en Zone A ?'"
          : activeLang === "hi"
          ? "मैं आपकी सहायता के लिए तैयार हूँ! पूछें: 'शौचालय कहाँ है?' या 'ज़ोन A में कितनी भीड़ है?'"
          : "I'm here to help! Try asking: 'Where's the nearest restroom?' or 'How crowded is Zone A?'";
      setMessages((prev) => [...prev.slice(0, -1), { role: "assistant", content: fallbackMsg }]);
    } finally {
      setStreaming(false);
    }
  }

  const quickReplies = LOCALIZED_QUICK_REPLIES[activeLang] || LOCALIZED_QUICK_REPLIES.en;

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-160px)] max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-[22px]">translate</span>
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-foreground flex items-center gap-2">
              Gemini AI Multilingual Copilot
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>FIFA 2026 Neural Translation Active</span>
            </div>
          </div>
        </div>

        {/* Language selector */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide py-1">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                activeLang === lang.code
                  ? "bg-primary text-primary-foreground border-primary shadow-sm scale-105"
                  : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 border-border"
              }`}
            >
              <span className="text-sm">{lang.flag}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-4 custom-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-3 items-end`}>
            {msg.role === "assistant" && (
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-primary via-violet-600 to-accent flex items-center justify-center flex-shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-white text-[18px]">auto_awesome</span>
              </div>
            )}
            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3.5 text-sm sm:text-base leading-relaxed ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-none fan-shadow shadow-md font-medium"
                  : "bg-card text-foreground rounded-bl-none fan-shadow border border-border"
              }`}
            >
              {msg.loading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="material-symbols-outlined animate-spin text-[18px] text-primary">autorenew</span>
                  <span className="text-xs font-bold">
                    {activeLang === "es"
                      ? "Traduciendo y analizando telemetría..."
                      : activeLang === "fr"
                      ? "Traduction et analyse des données..."
                      : activeLang === "hi"
                      ? "अनुवाद और विश्लेषण किया जा रहा है..."
                      : "Translating & analyzing telemetry..."}
                  </span>
                </div>
              ) : i === messages.length - 1 && msg.role === "assistant" && streaming ? (
                <StreamingBubble content={msg.content} done={false} />
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Quick replies */}
      <div className="py-2.5 flex gap-2 overflow-x-auto scrollbar-hide flex-shrink-0 border-t border-border">
        {quickReplies.map((qr, idx) => (
          <button
            key={idx}
            onClick={() => sendMessage(qr)}
            disabled={streaming}
            className="flex-shrink-0 text-xs font-extrabold bg-muted/60 hover:bg-primary/10 hover:text-primary text-foreground border border-border px-3.5 py-2 rounded-xl transition-all shadow-2xs active:scale-95 disabled:opacity-40"
          >
            {qr}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <div className="pt-2 flex gap-2.5 items-center flex-shrink-0">
        <div className="relative flex-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder={
              activeLang === "es"
                ? "Escribe tu consulta al Asistente PULSE (ej: ¿Dónde hay baños?)..."
                : activeLang === "fr"
                ? "Posez votre question à l'assistant PULSE (ex: Où sont les toilettes ?)..."
                : activeLang === "hi"
                ? "PULSE असिस्टेंट से अपना प्रश्न पूछें (जैसे: शौचालय कहाँ है?)..."
                : "Ask PULSE assistant (e.g. Where's the nearest food court?)..."
            }
            disabled={streaming}
            className="w-full bg-card border border-border rounded-2xl pl-4 pr-10 py-3.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-all font-medium fan-shadow"
          />
          <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-[20px] pointer-events-none">
            keyboard_voice
          </span>
        </div>
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || streaming}
          className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center transition-all shadow-md active:scale-95 disabled:opacity-40 hover:bg-primary/90 flex-shrink-0"
        >
          <span className="material-symbols-outlined text-[22px]">send</span>
        </button>
      </div>
    </div>
  );
}
