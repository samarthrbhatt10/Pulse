"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/app/components/ThemeToggle";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [org, setOrg] = useState("");
  const [email, setEmail] = useState("");
  const [roleType, setRoleType] = useState<"ops" | "fan">("ops");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    if (typeof window !== "undefined") {
      localStorage.setItem("pulse_user_role", roleType);
      localStorage.setItem("pulse_user_name", name || "Enterprise Officer");
    }
    if (roleType === "fan") {
      router.push("/fan");
    } else {
      router.push("/control-room");
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Top Bar */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-black text-sm shadow-md group-hover:scale-105 transition-transform">
            P
          </div>
          <span className="font-black tracking-tight text-lg text-foreground">PULSE</span>
        </Link>
        <ThemeToggle />
      </div>

      {/* Background glow */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Signup Card */}
      <div className="w-full max-w-lg bg-card/90 backdrop-blur-2xl border border-border rounded-3xl p-6 sm:p-8 fan-shadow relative z-10 my-12">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/15 text-accent text-[10px] font-black uppercase tracking-widest mb-3 border border-accent/20">
            Silicon Valley Enterprise Onboarding
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            Create Organization Workspace
          </h1>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            Register your sports venue, security team, or World Cup digital twin instance
          </p>
        </div>

        {/* Role Type Selection */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => setRoleType("ops")}
            className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
              roleType === "ops"
                ? "bg-primary/15 border-primary text-foreground shadow-sm"
                : "bg-muted border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="material-symbols-outlined text-primary text-[22px]">admin_panel_settings</span>
              {roleType === "ops" && <span className="w-2 h-2 rounded-full bg-primary" />}
            </div>
            <span className="text-xs font-black uppercase tracking-wider block">Enterprise Ops & CTO</span>
            <span className="text-[10px] text-muted-foreground mt-0.5 leading-tight">Control Room, 3D Twin & AI Alerts</span>
          </button>

          <button
            type="button"
            onClick={() => setRoleType("fan")}
            className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
              roleType === "fan"
                ? "bg-accent/15 border-accent text-foreground shadow-sm"
                : "bg-muted border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="material-symbols-outlined text-accent text-[22px]">stadium</span>
              {roleType === "fan" && <span className="w-2 h-2 rounded-full bg-accent" />}
            </div>
            <span className="text-xs font-black uppercase tracking-wider block">World Cup Fan Access</span>
            <span className="text-[10px] text-muted-foreground mt-0.5 leading-tight">Wayfinding, In-Seat Delivery & AR</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-foreground block mb-1">
              Full Name / Officer Designation
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Dr. Alex Vance, CTO Stadium Operations"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-all font-medium"
            />
          </div>

          <div>
            <label className="text-xs font-black uppercase tracking-wider text-foreground block mb-1">
              Organization / Venue Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. FIFA World Cup 2026 · Estadio Azteca Group"
              value={org}
              onChange={(e) => setOrg(e.target.value)}
              className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-all font-medium"
            />
          </div>

          <div>
            <label className="text-xs font-black uppercase tracking-wider text-foreground block mb-1">
              Work Email Address
            </label>
            <input
              type="email"
              required
              placeholder="alex.vance@pulse-stadium.ai"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-all font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary via-violet-600 to-accent text-white font-black py-3.5 rounded-xl hover:opacity-95 transition-all shadow-lg active:scale-98 flex items-center justify-center gap-2 text-sm tracking-wide mt-3"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">autorenew</span>
                Provisioning Neural Nodes...
              </>
            ) : (
              <>
                <span>Provision Enterprise Workspace</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 pt-5 border-t border-border text-center text-xs text-muted-foreground font-medium">
          Already have an active account?{" "}
          <Link href="/login" className="text-foreground font-extrabold hover:text-primary transition-colors">
            Sign In to Console →
          </Link>
        </div>
      </div>
    </main>
  );
}
