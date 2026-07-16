"use client";
import { useState } from "react";

interface MenuItem {
  id: string;
  name: string;
  vendor: string;
  price: number;
  waitTime: string;
  category: "all" | "snacks" | "mains" | "drinks" | "desserts";
  aiRecommended?: boolean;
  imageIcon: string;
}

const MENU_ITEMS: MenuItem[] = [
  { id: "nachos", name: "Loaded Nachos", vendor: "Grill 12", price: 9.5, waitTime: "14 min wait", category: "snacks", imageIcon: "🌮" },
  { id: "tacos", name: "Street Tacos (3)", vendor: "Taco Stand", price: 8.0, waitTime: "6 min wait", category: "mains", imageIcon: "🌯" },
  { id: "cerveza", name: "Cerveza (16oz)", vendor: "Cerveza Bar", price: 11.0, waitTime: "22 min wait", category: "drinks", imageIcon: "🍺" },
  { id: "churro", name: "Churro + Dip", vendor: "Ice Cream Co.", price: 6.5, waitTime: "3 min wait", category: "desserts", aiRecommended: true, imageIcon: "🥐" },
  { id: "burger", name: "Double Smash Burger", vendor: "Grill 12", price: 13.0, waitTime: "12 min wait", category: "mains", imageIcon: "🍔" },
  { id: "water", name: "Glacier Water (20oz)", vendor: "Express Cooler", price: 4.5, waitTime: "2 min wait", category: "drinks", imageIcon: "🥤" },
];

export default function FanOrderPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [cart, setCart] = useState<Record<string, number>>({ nachos: 1 });
  const [orderPlaced, setOrderPlaced] = useState(false);

  const categories = [
    { id: "all", label: "All" },
    { id: "snacks", label: "Snacks" },
    { id: "mains", label: "Mains" },
    { id: "drinks", label: "Drinks" },
    { id: "desserts", label: "Desserts" },
  ];

  const filteredItems = activeCategory === "all" ? MENU_ITEMS : MENU_ITEMS.filter((i) => i.category === activeCategory);

  const cartItems = Object.entries(cart)
    .filter(([, qty]) => qty > 0)
    .map(([id, qty]) => {
      const item = MENU_ITEMS.find((i) => i.id === id)!;
      return { ...item, qty };
    });

  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);

  function updateQty(id: string, delta: number) {
    setCart((prev) => {
      const current = prev[id] ?? 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [id]: next };
    });
  }

  function handleCheckout() {
    if (totalAmount <= 0) return;
    setOrderPlaced(true);
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-140px)] max-w-4xl mx-auto gap-5 pb-12">
      {/* Header & AI Pick Banner */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              Express In-Seat Delivery
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              Order directly to Section 118, Seat 14 with AI-optimized queue times
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-2xl px-3.5 py-2 text-xs font-black text-primary">
            <span className="material-symbols-outlined text-[18px]">bolt</span>
            <span>FIFA NFC Wallet Ready</span>
          </div>
        </div>

        {/* AI Recommendation Alert */}
        <div className="bg-gradient-to-r from-primary/20 via-violet-600/15 to-accent/20 border border-primary/40 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-lg bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-wider">
              AI Pick
            </span>
            <span className="text-xs sm:text-sm font-bold text-foreground">
              Churro + Dip — shortest wait right now (3 min)
            </span>
          </div>
          <button
            onClick={() => updateQty("churro", 1)}
            className="px-3 py-1.5 bg-primary text-primary-foreground rounded-xl text-xs font-black uppercase shadow-2xs hover:bg-primary/90 transition-all active:scale-95 flex-shrink-0"
          >
            + Add to Order
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 border-b border-border">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all border ${
              activeCategory === cat.id
                ? "bg-primary text-primary-foreground border-primary shadow-sm scale-102"
                : "bg-card text-muted-foreground border-border hover:text-foreground"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Order Placed Success Banner */}
      {orderPlaced ? (
        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/10 border-2 border-green-500 rounded-3xl p-6 text-center space-y-3 fan-shadow animate-in zoom-in-95 duration-300">
          <div className="w-14 h-14 rounded-full bg-green-500 text-white flex items-center justify-center mx-auto shadow-lg">
            <span className="material-symbols-outlined text-[32px]">check</span>
          </div>
          <h2 className="text-xl font-black text-foreground">Order Placed Successfully!</h2>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium max-w-md mx-auto leading-relaxed">
            <span className="font-bold text-foreground">${totalAmount.toFixed(2)}</span> charged via FIFA NFC Wallet. Your runner is preparing your items and will deliver directly to <span className="font-bold text-primary">Section 118, Seat 14</span> in approximately <span className="font-bold text-accent">14 minutes</span>.
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                setOrderPlaced(false);
                setCart({});
              }}
              className="px-6 py-2.5 bg-card border border-border rounded-2xl text-xs font-extrabold text-foreground hover:bg-muted transition-all"
            >
              Order More Items
            </button>
          </div>
        </div>
      ) : (
        /* Menu Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredItems.map((item) => {
            const count = cart[item.id] ?? 0;
            return (
              <div
                key={item.id}
                className="bg-card border border-border rounded-3xl p-4 sm:p-5 fan-shadow flex flex-col justify-between gap-4 relative overflow-hidden transition-all hover:border-primary/40"
              >
                {item.aiRecommended && (
                  <div className="absolute top-3 right-3 bg-primary/20 text-primary border border-primary/40 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                    ★ AI Recommended
                  </div>
                )}

                <div className="flex items-start gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-muted border border-border flex items-center justify-center text-[28px] flex-shrink-0 shadow-2xs">
                    {item.imageIcon}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-foreground">{item.name}</h3>
                    <p className="text-xs text-muted-foreground font-semibold mt-0.5">
                      {item.vendor} — <span className="text-foreground font-black">${item.price.toFixed(2)}</span>
                    </p>
                    <div className="inline-flex items-center gap-1.5 mt-2 px-2 py-0.5 rounded-md bg-muted text-[11px] font-bold text-accent">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent pulse-teal" />
                      <span>{item.waitTime}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="text-xs font-bold text-muted-foreground">Quantity</span>
                  <div className="flex items-center gap-3 bg-muted rounded-2xl p-1 border border-border">
                    <button
                      onClick={() => updateQty(item.id, -1)}
                      disabled={count === 0}
                      className="w-7 h-7 rounded-xl bg-card border border-border flex items-center justify-center text-foreground font-black disabled:opacity-30 active:scale-90 transition-all"
                    >
                      -
                    </button>
                    <span className="text-sm font-black text-foreground tabular-nums w-4 text-center">{count}</span>
                    <button
                      onClick={() => updateQty(item.id, 1)}
                      className="w-7 h-7 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-black active:scale-90 transition-all shadow-xs"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Checkout Bar */}
      {!orderPlaced && totalAmount > 0 && (
        <div className="fixed bottom-16 md:bottom-6 left-4 right-4 max-w-xl mx-auto z-40">
          <div className="bg-card/95 backdrop-blur-xl border-2 border-primary rounded-3xl p-4 fan-shadow flex items-center justify-between gap-4 shadow-2xl animate-in slide-in-from-bottom-6">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground block">
                Express Delivery to Seat 118-14
              </span>
              <div className="text-lg font-black text-foreground">
                ${totalAmount.toFixed(2)} <span className="text-xs font-semibold text-muted-foreground">({cartItems.reduce((s, i) => s + i.qty, 0)} items)</span>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              className="px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-black text-sm uppercase tracking-wider shadow-lg hover:bg-primary/90 active:scale-95 transition-all flex items-center gap-2"
            >
              <span>Send to Seat</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
