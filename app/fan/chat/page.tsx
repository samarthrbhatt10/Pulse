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
  en: "Hi! I'm your PULSE Stadium Assistant 🏟️ Powered by Gemini 2.5 AI. I can help you order Smart On-Seat F&B to Section 104 or Express Lockers, check real-time Fruin LOS concourse wait times, navigate turn-by-turn inside Dallas Stadium, or report safety concerns. Ask me anything — I speak your language!",
  es: "¡Hola! Soy tu Asistente de Estadio PULSE 🏟️ Impulsado por Gemini 2.5 AI. Puedo ayudarte a pedir comida a tu asiento o taquilla exprés, consultar tiempos de espera con telemetría Fruin LOS, navegar dentro del estadio o reportar incidencias. ¡Pregúntame lo que quieras!",
  fr: "Bonjour ! Je suis votre Assistant Stade PULSE 🏟️ Propulsé par Gemini 2.5 AI. Je peux vous guider pour commander de la nourriture à votre siège ou en casier express, surveiller les temps d'attente sur les concourses, ou signaler un incident. Posez vos questions !",
  hi: "नमस्ते! मैं आपका PULSE स्टेडियम असिस्टेंट हूँ 🏟️ Gemini 2.5 AI द्वारा संचालित। मैं आपको सीट पर खाना ऑर्डर करने, फ्रूइन LOS भीड़भाड़ जांचने और स्टेडियम में नेविगेट करने में मदद कर सकता हूँ। कुछ भी पूछें!",
  ar: "مرحباً! أنا مساعد ملعب PULSE الذكي 🏟️ مدعوم بـ Gemini 2.5 AI. يمكنني مساعدتك في طلب الطعام مباشرة إلى مقعدك أو الخزائن الذكية، ومتابعة الازدحام بدقة Fruin LOS، أو التنقل داخل الاستاد. اسألني أي شيء!",
  pt: "Olá! Sou seu Assistente de Estádio PULSE 🏟️ Desenvolvido por Gemini 2.5 AI. Posso te ajudar a pedir comida no seu assento ou armário expresso, verificar filas nos corredores com dados Fruin LOS ou navegar pelo estádio. Pergunte qualquer coisa!",
};

const LOCALIZED_QUICK_REPLIES: Record<string, string[]> = {
  en: ["Order F&B to my seat 🍔", "Check concourse wait times 📊", "Find nearest restroom 🚽", "How do I reach Locker Bay #4?"],
  es: ["Pedir comida al asiento 🍔", "Tiempos de espera en concourse 📊", "¿Dónde está el baño? 🚽", "¿Cómo llego a Taquilla #4?"],
  fr: ["Commander repas au siège 🍔", "Temps d'attente concourse 📊", "Où sont les toilettes ? 🚽", "Comment aller au Casier #4 ?"],
  hi: ["सीट पर खाना ऑर्डर करें 🍔", "कॉन्कोर्स में भीड़ की स्थिति 📊", "शौचालय कहाँ है? 🚽", "लॉकर बे #4 कैसे पहुंचें?"],
  ar: ["طلب طعام إلى مقعدي 🍔", "أوقات الانتظار في الممرات 📊", "أين دورات المياه؟ 🚽", "كيف أصل إلى الخزائن رقم 4؟"],
  pt: ["Pedir comida no assento 🍔", "Tempo de espera no corredor 📊", "Onde fica o banheiro? 🚽", "Como chego ao Armário #4?"],
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
          role: "fan",
          history: messages.slice(-10).map((m) => ({
            role: m.role === "user" ? "user" : "assistant",
            content: m.content,
          })),
          context: `Fan inside live event stadium. Target preferred language: ${activeLang.toUpperCase()} (${LANGUAGES.find((l) => l.code === activeLang)?.label ?? "English"}). Please respond fully in this exact language.`,
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
              <span>Live Neural Translation Active</span>
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
