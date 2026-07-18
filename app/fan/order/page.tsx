"use client";
import { useState, useEffect } from "react";
import { ZONES, densityColor } from "@/lib/mockData";
import { usePulseSync } from "@/lib/usePulseSync";

interface MenuItem {
  id: string;
  name: string;
  category: "burgers" | "drinks" | "snacks";
  price: number;
  calories: number;
  tags: string[];
  stock: number;
  prepBay: string;
  imageIcon: string;
  desc: string;
}

const MENU_ITEMS: MenuItem[] = [
  {
    id: "burger-smash",
    name: "Signature Double Smash Burger",
    category: "burgers",
    price: 16.5,
    calories: 820,
    tags: ["Angus Beef", "Chef Signature"],
    stock: 38,
    prepBay: "Concourse B - Kitchen Bay 2",
    imageIcon: "lunch_dining",
    desc: "Two aged Angus beef patties, melted cheddar, caramelized onions, and secret PULSE sauce on a toasted brioche bun.",
  },
  {
    id: "burger-brisket",
    name: "Texas Smoked Brisket Sandwich",
    category: "burgers",
    price: 18.0,
    calories: 890,
    tags: ["Local Smokehouse", "Halal Friendly"],
    stock: 24,
    prepBay: "Concourse B - Kitchen Bay 2",
    imageIcon: "kebab_dining",
    desc: "14-hour hickory smoked brisket, tangy barbecue glaze, crispy jalapeño slaw on an artisanal potato bun.",
  },
  {
    id: "drink-ipa",
    name: "Dallas Craft IPA (16oz Draft Draft)",
    category: "drinks",
    price: 14.0,
    calories: 220,
    tags: ["Local Brew", "Chilled 2°C"],
    stock: 124,
    prepBay: "Concourse A - Bar Bay 1",
    imageIcon: "sports_bar",
    desc: "Crisp, cold-hopped American IPA brewed locally in Dallas with citrus notes and refreshing finish.",
  },
  {
    id: "drink-electro",
    name: "Chilled Electrolyte Hydration Pack",
    category: "drinks",
    price: 6.5,
    calories: 45,
    tags: ["Zero Sugar", "Rapid Hydration"],
    stock: 210,
    prepBay: "Express Beverage Hub",
    imageIcon: "water_drop",
    desc: "Cold-pressed lemon-lime electrolyte recharge water designed for high-energy match-day hydration.",
  },
  {
    id: "snack-nachos",
    name: "Gluten-Free Loaded Brisket Nachos",
    category: "snacks",
    price: 15.0,
    calories: 680,
    tags: ["Gluten-Free", "Shareable"],
    stock: 18,
    prepBay: "Concourse C - Grill Bay 3",
    imageIcon: "fastfood",
    desc: "Crispy corn tortilla chips piled high with warm queso blanco, smoked brisket crumbles, pico de gallo, and guacamole.",
  },
  {
    id: "snack-churros",
    name: "Artisanal Churro Bites & Warm Chocolate",
    category: "snacks",
    price: 9.0,
    calories: 420,
    tags: ["Vegetarian", "Sweet Treat"],
    stock: 45,
    prepBay: "Concourse C - Grill Bay 3",
    imageIcon: "bakery_dining",
    desc: "Freshly fried cinnamon-sugar churro loops served with rich Venezuelan dark chocolate dipping sauce.",
  },
];

type FulfillmentMode = "seat" | "locker";

interface OrderStatus {
  step: number; // 0: Idle, 1: Sent to Kitchen, 2: Preparing, 3: En Route / Ready at Locker, 4: Delivered / Unlocked
  orderId: string;
  mode: FulfillmentMode;
  lockerNumber: string;
  runnerName: string;
  etaMinutes: number;
}

export default function SmartFBOrderPage() {
  const { zones } = usePulseSync();
  const [selectedCategory, setSelectedCategory] = useState<"all" | "burgers" | "drinks" | "snacks">("all");
  const [fulfillmentMode, setFulfillmentMode] = useState<FulfillmentMode>("seat");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [selectedTip, setSelectedTip] = useState<number>(3.0);
  const [activeTab, setActiveTab] = useState<"menu" | "cart" | "tracker">("menu");
  const [orderStatus, setOrderStatus] = useState<OrderStatus | null>(null);
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);

  // Calculate concourse wait time based on seeded ZONES
  const concourseAZone = zones.find((z) => z.id === "A") || ZONES[0];
  const concourseBZone = zones.find((z) => z.id === "B") || ZONES[1];
  const concourseCZone = zones.find((z) => z.id === "C") || ZONES[2];

  const concourseAWait = Math.max(3, Math.round(concourseAZone.percent * 0.18));
  const concourseBWait = Math.max(2, Math.round(concourseBZone.percent * 0.14));

  const cartItems = Object.entries(cart)
    .filter(([_, qty]) => qty > 0)
    .map(([id, qty]) => ({
      item: MENU_ITEMS.find((m) => m.id === id)!,
      qty,
    }));

  const subtotal = cartItems.reduce((acc, curr) => acc + curr.item.price * curr.qty, 0);
  const serviceFee = fulfillmentMode === "seat" ? 3.5 : 0.0;
  const total = subtotal > 0 ? subtotal + serviceFee + selectedTip : 0;
  const totalItemsCount = cartItems.reduce((acc, curr) => acc + curr.qty, 0);

  const handleAddToCart = (id: string) => {
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const handleRemoveFromCart = (id: string) => {
    setCart((prev) => {
      const current = prev[id] || 0;
      if (current <= 1) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: current - 1 };
    });
  };

  const handleCheckout = () => {
    if (subtotal === 0) return;
    const newOrder: OrderStatus = {
      step: 1,
      orderId: `PULSE-${Math.floor(100000 + Math.random() * 900000)}`,
      mode: fulfillmentMode,
      lockerNumber: fulfillmentMode === "locker" ? `BAY-4 · LOCKER #${Math.floor(10 + Math.random() * 89)}` : "SEAT DELIVERY (Sec 104 · Row 12 · Seat 8)",
      runnerName: "Carlos M. (Fast-Track Runner #42)",
      etaMinutes: fulfillmentMode === "seat" ? 7 : 3,
    };
    setOrderStatus(newOrder);
    setActiveTab("tracker");
    setCart({});

    // Simulate order progression
    setTimeout(() => {
      setOrderStatus((prev) => (prev ? { ...prev, step: 2, etaMinutes: fulfillmentMode === "seat" ? 5 : 2 } : null));
    }, 4000);

    setTimeout(() => {
      setOrderStatus((prev) => (prev ? { ...prev, step: 3, etaMinutes: fulfillmentMode === "seat" ? 2 : 0 } : null));
    }, 9000);
  };

  const handleCompleteOrder = () => {
    setOrderStatus((prev) => (prev ? { ...prev, step: 4, etaMinutes: 0 } : null));
    setUnlockModalOpen(false);
  };

  const filteredMenu = selectedCategory === "all" ? MENU_ITEMS : MENU_ITEMS.filter((i) => i.category === selectedCategory);

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto py-2">
      {/* Top Banner: Real-World Bottleneck Solver with Live Concourse Telemetry */}
      <div className="bg-card border border-border rounded-3xl p-5 sm:p-6 fan-shadow relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-primary/10 via-accent/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 text-[10px] font-black uppercase tracking-wider">
                ⚡ ZERO-QUEUE SMART ORDERING
              </span>
              <span className="text-xs font-mono font-bold text-muted-foreground">REAL-TIME FRUIN LOS TELEMETRY</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[32px]">restaurant</span>
              Smart On-Seat & Express Locker F&B
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl mt-1 leading-relaxed">
              Don't miss 20 minutes of live match action waiting in concourse queues. Order directly from your seat for <b>GPS Runner Delivery</b> right to Row 12, or pick up instantly from <b>Concourse B Express Smart Lockers</b> via QR code.
            </p>
          </div>

          {/* Live Concourse Queue Wait Times Bar */}
          <div className="bg-muted/80 border border-border rounded-2xl p-4 flex flex-col gap-2.5 min-w-[280px]">
            <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
              <span>Live Concourse Lines</span>
              <span className="text-primary font-mono">IoT Sensor Mesh</span>
            </div>
            <div className="space-y-2 text-xs font-bold">
              <div className="flex items-center justify-between p-2 rounded-xl bg-card border border-border">
                <span className="flex items-center gap-1.5 text-foreground">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  Concourse A (Standard Queue)
                </span>
                <span className="text-red-500 font-black">{concourseAWait} min wait ⚠️</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Concourse B Smart Locker Bay
                </span>
                <span className="font-black">1 min wait ✅</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mode Switcher & Tab Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-3 rounded-2xl border border-border fan-shadow">
        {/* Fulfillment Mode Toggle */}
        <div className="flex items-center gap-1 bg-muted p-1 rounded-xl flex-1 max-w-md">
          <button
            onClick={() => setFulfillmentMode("seat")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
              fulfillmentMode === "seat"
                ? "bg-primary text-white shadow-sm scale-[1.02]"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">event_seat</span>
            <span>In-Seat Delivery ($3.50)</span>
          </button>
          <button
            onClick={() => setFulfillmentMode("locker")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
              fulfillmentMode === "locker"
                ? "bg-emerald-600 text-white shadow-sm scale-[1.02]"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">lock_clock</span>
            <span>Express Locker ($0 Free)</span>
          </button>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("menu")}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              activeTab === "menu"
                ? "bg-primary/15 text-primary border border-primary/30"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">menu_book</span>
            <span>Menu Items</span>
          </button>
          <button
            onClick={() => setActiveTab("cart")}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 relative ${
              activeTab === "cart"
                ? "bg-primary/15 text-primary border border-primary/30"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">shopping_cart</span>
            <span>Cart</span>
            {totalItemsCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-red-500 text-white font-mono text-[11px] font-black flex items-center justify-center animate-bounce">
                {totalItemsCount}
              </span>
            )}
          </button>
          {orderStatus && (
            <button
              onClick={() => setActiveTab("tracker")}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                activeTab === "tracker"
                  ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/40 animate-pulse"
                  : "bg-card border border-border text-emerald-500 hover:bg-emerald-500/10"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">spatial_tracking</span>
              <span>Live Tracker</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === "menu" && (
        <div className="flex flex-col gap-5">
          {/* Category Filter Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: "all", label: "🔥 All Specialties" },
              { id: "burgers", label: "🍔 Burgers & Smokehouse" },
              { id: "drinks", label: "🍺 Craft Drafts & Hydration" },
              { id: "snacks", label: "🌮 Nachos & Churros" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? "bg-primary text-white shadow-sm"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Menu Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredMenu.map((item) => {
              const qty = cart[item.id] || 0;
              return (
                <div
                  key={item.id}
                  className="bg-card rounded-3xl p-5 border border-border fan-shadow hover:border-primary/50 transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 text-primary">
                        <span className="material-symbols-outlined text-3xl">{item.imageIcon}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-black text-base sm:text-lg text-foreground tracking-tight leading-tight">
                            {item.name}
                          </h3>
                          <span className="text-base font-black text-primary font-mono ml-2">
                            ${item.price.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-semibold mt-1">
                          <span>🔥 {item.calories} kcal</span>
                          <span>·</span>
                          <span className="text-accent font-bold">📍 {item.prepBay}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground font-medium leading-relaxed mb-3">{item.desc}</p>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-[10px] font-bold uppercase tracking-wider border border-border"
                        >
                          {tag}
                        </span>
                      ))}
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${
                          item.stock < 25
                            ? "bg-red-500/10 text-red-500 border-red-500/30 animate-pulse"
                            : "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                        }`}
                      >
                        ⚡ {item.stock} left right now
                      </span>
                    </div>
                  </div>

                  {/* Add to Cart Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-border mt-2">
                    <div className="text-xs font-extrabold text-muted-foreground">
                      {fulfillmentMode === "seat" ? "🏃 Delivered to Sec 104 in ~7m" : "🔒 Locker Pickup in ~3m"}
                    </div>
                    {qty > 0 ? (
                      <div className="flex items-center gap-2 bg-primary/15 border border-primary/30 rounded-xl p-1">
                        <button
                          onClick={() => handleRemoveFromCart(item.id)}
                          className="w-8 h-8 rounded-lg bg-card hover:bg-muted font-black text-foreground flex items-center justify-center shadow-2xs active:scale-95 transition-transform"
                        >
                          -
                        </button>
                        <span className="font-mono font-black text-primary text-sm px-2.5">{qty}</span>
                        <button
                          onClick={() => handleAddToCart(item.id)}
                          className="w-8 h-8 rounded-lg bg-primary text-white font-black flex items-center justify-center shadow-2xs active:scale-95 transition-transform"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAddToCart(item.id)}
                        className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-black uppercase tracking-wider shadow-sm active:scale-95 transition-all flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[16px]">add_shopping_cart</span>
                        <span>Add to Order</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cart Tab */}
      {activeTab === "cart" && (
        <div className="bg-card rounded-3xl p-6 border border-border fan-shadow flex flex-col gap-6">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[28px]">shopping_cart</span>
                Your Match-Day F&B Cart
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {fulfillmentMode === "seat"
                  ? "Assigned Delivery: Section 104 · Row 12 · Seat 8 (North Stand)"
                  : "Assigned Pickup: Concourse B Express Smart Locker Bay #4"}
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-primary/15 text-primary font-mono text-xs font-extrabold uppercase tracking-wider border border-primary/30">
              {fulfillmentMode === "seat" ? "🏃 In-Seat Delivery Mode" : "🔒 Zero-Wait Locker Mode"}
            </span>
          </div>

          {cartItems.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <span className="material-symbols-outlined text-6xl text-muted-foreground opacity-30 animate-bounce">
                remove_shopping_cart
              </span>
              <h3 className="text-lg font-black text-foreground">Your Order Bag is Empty</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Explore our chef specialties and chilled craft beers to order right to your seat or express locker without leaving the action.
              </p>
              <button
                onClick={() => setActiveTab("menu")}
                className="mt-2 px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-wider shadow-sm hover:bg-primary/90 transition-all"
              >
                Browse Stadium Menu
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Item List (7 cols) */}
              <div className="lg:col-span-7 space-y-3">
                {cartItems.map(({ item, qty }) => (
                  <div
                    key={item.id}
                    className="bg-muted/40 rounded-2xl p-4 border border-border flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center text-primary flex-shrink-0">
                        <span className="material-symbols-outlined text-2xl">{item.imageIcon}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-foreground">{item.name}</h4>
                        <span className="text-xs text-muted-foreground font-semibold">
                          ${item.price.toFixed(2)} each · {item.prepBay}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 bg-card border border-border rounded-xl p-1">
                        <button
                          onClick={() => handleRemoveFromCart(item.id)}
                          className="w-7 h-7 rounded-lg bg-muted hover:bg-muted-hover font-black text-foreground flex items-center justify-center transition-all"
                        >
                          -
                        </button>
                        <span className="font-mono font-black text-primary text-sm px-2">{qty}</span>
                        <button
                          onClick={() => handleAddToCart(item.id)}
                          className="w-7 h-7 rounded-lg bg-primary text-white font-black flex items-center justify-center transition-all"
                        >
                          +
                        </button>
                      </div>
                      <span className="font-mono font-black text-sm text-foreground w-16 text-right">
                        ${(item.price * qty).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary & One-Tap Checkout (5 cols) */}
              <div className="lg:col-span-5 bg-card rounded-3xl p-5 border border-border fan-shadow flex flex-col gap-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-muted-foreground border-b border-border pb-2.5">
                  Order Summary & Tip Runner
                </h3>

                {/* Tip Selector */}
                <div>
                  <label className="text-xs font-bold text-foreground block mb-2">Support Your Stadium Runner / Kitchen Crew:</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[2.0, 3.0, 5.0, 8.0].map((tipAmt) => (
                      <button
                        key={tipAmt}
                        onClick={() => setSelectedTip(tipAmt)}
                        className={`py-2 rounded-xl text-xs font-mono font-black transition-all border ${
                          selectedTip === tipAmt
                            ? "bg-primary text-white border-primary shadow-xs scale-105"
                            : "bg-muted border-border text-foreground hover:bg-card"
                        }`}
                      >
                        +${tipAmt.toFixed(2)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Breakdown */}
                <div className="space-y-2 text-xs font-semibold pt-2 border-t border-border">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal ({totalItemsCount} items)</span>
                    <span className="font-mono text-foreground">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>{fulfillmentMode === "seat" ? "🏃 In-Seat Runner Fee" : "🔒 Express Locker Fee"}</span>
                    <span className="font-mono text-foreground">
                      {serviceFee > 0 ? `$${serviceFee.toFixed(2)}` : "FREE ($0.00)"}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Runner / Kitchen Tip</span>
                    <span className="font-mono text-foreground">${selectedTip.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-foreground pt-3 border-t border-border mt-2">
                    <span>Total Match-Day Order</span>
                    <span className="font-mono text-primary text-lg sm:text-xl">${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Apple / Google Pay / Biometric One-Tap Button */}
                <button
                  onClick={handleCheckout}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary via-violet-600 to-accent text-white font-black text-sm uppercase tracking-wider shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-98 transition-all flex items-center justify-center gap-2.5 mt-2"
                >
                  <span className="material-symbols-outlined text-xl">contactless</span>
                  <span>One-Tap Instant Checkout · ${total.toFixed(2)}</span>
                </button>
                <div className="text-center text-[11px] text-muted-foreground font-medium flex items-center justify-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px] text-emerald-500">verified_user</span>
                  <span>Encrypted Biometric Wallet · Instant Receipt to NFC Pass</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Live Order Tracker Tab */}
      {activeTab === "tracker" && orderStatus && (
        <div className="bg-card rounded-3xl p-6 sm:p-8 border border-border fan-shadow flex flex-col gap-6 relative overflow-hidden">
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-border gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 font-mono text-xs font-black uppercase tracking-wider">
                  ✅ ORDER ACTIVE & TRACKING
                </span>
                <span className="font-mono text-xs font-bold text-muted-foreground">ID: {orderStatus.orderId}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-1">
                {orderStatus.mode === "seat" ? "🏃 Runner En Route to Seat 104" : "🔒 Smart Locker Pickup Ready"}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                {orderStatus.lockerNumber} · Handled by {orderStatus.runnerName}
              </p>
            </div>

            <div className="bg-muted px-5 py-3 rounded-2xl border border-border flex flex-col items-center sm:items-end">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Live ETA Target</span>
              <span className="text-2xl sm:text-3xl font-mono font-black text-primary">
                {orderStatus.step === 4 ? "COMPLETE" : `${orderStatus.etaMinutes} MINS`}
              </span>
            </div>
          </div>

          {/* Progress Steps State Machine */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 py-4 relative z-10">
            {[
              { step: 1, title: "Order Confirmed", desc: "Sent to Kitchen Bay 2", icon: "check_circle" },
              { step: 2, title: "Preparing Bundle", desc: "Chef grilling & packing", icon: "skillet" },
              {
                step: 3,
                title: orderStatus.mode === "seat" ? "Runner En Route" : "Loaded in Locker #4B",
                desc: orderStatus.mode === "seat" ? "Navigating Section 104" : "Thermal bay locked",
                icon: orderStatus.mode === "seat" ? "directions_run" : "lock_clock",
              },
              {
                step: 4,
                title: orderStatus.mode === "seat" ? "Delivered to Seat" : "Locker Unlocked",
                desc: "Enjoy the match!",
                icon: "verified",
              },
            ].map((st) => {
              const isPassed = orderStatus.step >= st.step;
              const isCurrent = orderStatus.step === st.step;
              return (
                <div
                  key={st.step}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    isCurrent
                      ? "bg-primary/15 border-primary shadow-sm scale-[1.03]"
                      : isPassed
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                      : "bg-muted/40 border-border/60 text-muted-foreground opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`material-symbols-outlined text-2xl ${isCurrent ? "text-primary animate-bounce" : ""}`}>
                      {st.icon}
                    </span>
                    <span className="font-mono text-xs font-extrabold">0{st.step}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm leading-tight text-foreground">{st.title}</h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{st.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Action Box for Locker/Runner */}
          <div className="bg-muted/60 rounded-3xl p-6 border border-border flex flex-col sm:flex-row items-center justify-between gap-5 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/15 text-primary flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-3xl">qr_code_scanner</span>
              </div>
              <div>
                <h3 className="font-black text-base text-foreground">
                  {orderStatus.mode === "seat"
                    ? "Show Runner Verification PIN upon Arrival"
                    : "Digital Locker Key Ready for Tap"}
                </h3>
                <p className="text-xs text-muted-foreground max-w-md mt-0.5 leading-relaxed">
                  {orderStatus.mode === "seat"
                    ? "When Runner Carlos arrives at Section 104 Row 12, show your digital NFC confirmation PIN #8429 to receive your order."
                    : "When you arrive at Concourse B Bay 4, tap the button below or hold your phone to the locker NFC scanner to instantly unlock compartment #4B."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {orderStatus.step < 4 ? (
                <button
                  onClick={() => setUnlockModalOpen(true)}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-[18px]">key</span>
                  <span>{orderStatus.mode === "seat" ? "View Runner PIN #8429" : "Unlock Locker #4B Now"}</span>
                </button>
              ) : (
                <div className="px-5 py-3 rounded-2xl bg-emerald-500/20 text-emerald-500 border border-emerald-500/40 font-black text-xs uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  <span>Fulfillment Verified ✅</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Unlock / PIN Modal */}
      {unlockModalOpen && orderStatus && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl max-w-md w-full p-6 sm:p-8 fan-shadow text-center relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setUnlockModalOpen(false)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              ✕
            </button>

            <div className="w-16 h-16 rounded-2xl bg-primary/15 text-primary flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-4xl">qr_code_2</span>
            </div>

            <span className="px-3 py-1 rounded-full bg-primary/15 text-primary font-mono text-xs font-black uppercase tracking-wider border border-primary/30">
              {orderStatus.mode === "seat" ? "🏃 RUNNER PIN VERIFICATION" : "🔒 EXPRESS LOCKER #4B UNLOCK"}
            </span>

            <h3 className="text-2xl font-black text-foreground mt-3 mb-1">
              {orderStatus.mode === "seat" ? "PIN CODE #8429" : "TAP OR SCAN AT BAY 4"}
            </h3>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto mb-6">
              {orderStatus.mode === "seat"
                ? "Verify this 4-digit code with Carlos M. when they reach your seat."
                : "Hold your device within 2 inches of the Concourse B Bay 4 locker scanner, or click confirm to unlock remotely via IoT mesh."}
            </p>

            <div className="bg-white p-4 rounded-2xl w-48 h-48 mx-auto mb-6 flex items-center justify-center border-4 border-primary/20 shadow-inner">
              <div className="w-full h-full bg-slate-900 rounded-xl flex flex-col items-center justify-center p-2 text-white font-mono text-center">
                <span className="text-xs opacity-70">PULSE NFC TOKEN</span>
                <span className="text-xl font-black text-emerald-400 my-1">#8429-4B</span>
                <span className="text-[9px] opacity-60">VALID FOR MATCH DAY</span>
              </div>
            </div>

            <button
              onClick={handleCompleteOrder}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">lock_open</span>
              <span>Confirm Unlock & Complete Order</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
