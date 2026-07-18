"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/app/components/ThemeToggle";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("cto.ops@pulse-stadium.ai");
  const [password, setPassword] = useState("••••••••••••••••");
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"ops" | "security" | "fan">("ops");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    if (typeof window !== "undefined") {
      localStorage.setItem("pulse_auth_token", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...");
      localStorage.setItem("pulse_user_role", selectedRole);
    }
    if (selectedRole === "fan") {
      router.push("/fan");
    } else if (selectedRole === "security") {
      router.push("/control-room/incidents");
    } else {
      router.push("/control-room");
    }
  }

  function quickDemoLogin(role: "ops" | "security" | "fan") {
    setSelectedRole(role);
    setLoading(true);
    setTimeout(() => {
      if (typeof window !== "undefined") {
        localStorage.setItem("pulse_user_role", role);
      }
      if (role === "fan") router.push("/fan");
      else if (role === "security") router.push("/control-room/incidents");
      else router.push("/control-room");
    }, 500);
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

      {/* Login Card */}
      <div className="w-full max-w-md bg-card/90 backdrop-blur-2xl border border-border rounded-3xl p-6 sm:p-8 fan-shadow relative z-10 my-12">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 text-primary text-[10px] font-black uppercase tracking-widest mb-3 border border-primary/20">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
            Silicon Valley Enterprise SSO
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            Enterprise Portal Login
          </h1>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            Sign in with your stadium operations command credentials
          </p>
        </div>

        {/* Quick Demo Access Bar */}
        <div className="bg-muted/80 border border-border rounded-2xl p-3.5 mb-6">
          <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block mb-2 text-center">
            ⚡ Instant Role Login (One-Click Demo Access)
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => quickDemoLogin("ops")}
              className={`py-2 px-2 rounded-xl text-[11px] font-black uppercase tracking-tight transition-all border flex flex-col items-center gap-1 ${
                selectedRole === "ops"
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card text-foreground border-border hover:border-primary/60"
              }`}
            >
              <span className="material-symbols-outlined text-base">monitor_heart</span>
              <span>CTO / COO</span>
            </button>

            <button
              type="button"
              onClick={() => quickDemoLogin("security")}
              className={`py-2 px-2 rounded-xl text-[11px] font-black uppercase tracking-tight transition-all border flex flex-col items-center gap-1 ${
                selectedRole === "security"
                  ? "bg-red-600 text-white border-red-500 shadow-sm"
                  : "bg-card text-foreground border-border hover:border-red-500/60"
              }`}
            >
              <span className="material-symbols-outlined text-base">shield</span>
              <span>Security</span>
            </button>

            <button
              type="button"
              onClick={() => quickDemoLogin("fan")}
              className={`py-2 px-2 rounded-xl text-[11px] font-black uppercase tracking-tight transition-all border flex flex-col items-center gap-1 ${
                selectedRole === "fan"
                  ? "bg-accent text-accent-foreground border-accent shadow-sm"
                  : "bg-card text-foreground border-border hover:border-accent/60"
              }`}
            >
              <span className="material-symbols-outlined text-base">stadium</span>
              <span>Fan Hub</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-foreground block mb-1.5">
              Work Email / Operator ID
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-3 text-muted-foreground text-[18px]">
                mail
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-muted border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-all font-medium"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-foreground">
                Neural Security Key
              </label>
              <Link href="/forgot-password" className="text-xs font-bold text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-3 text-muted-foreground text-[18px]">
                lock
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-muted border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-all font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary via-violet-600 to-accent text-white font-black py-3.5 rounded-xl hover:opacity-95 transition-all shadow-lg active:scale-98 flex items-center justify-center gap-2 text-sm tracking-wide mt-2"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">autorenew</span>
                Authenticating Command Node...
              </>
            ) : (
              <>
                <span>Sign In to {selectedRole.toUpperCase()} Console</span>
                <span className="material-symbols-outlined text-[18px]">login</span>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 pt-5 border-t border-border text-center text-xs text-muted-foreground font-medium">
          Don't have an organization workspace?{" "}
          <Link href="/signup" className="text-foreground font-extrabold hover:text-primary transition-colors">
            Request Enterprise Access →
          </Link>
        </div>
      </div>
    </main>
  );
}
