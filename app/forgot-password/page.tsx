"use client";
import { useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/app/components/ThemeToggle";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"input" | "sent" | "reset">("input");
  const [loading, setLoading] = useState(false);

  async function handleResetRequest(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setStep("sent");
    setLoading(false);
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

      {/* Card */}
      <div className="w-full max-w-md bg-card/90 backdrop-blur-2xl border border-border rounded-3xl p-6 sm:p-8 fan-shadow relative z-10 my-12 text-center">
        {step === "input" && (
          <>
            <div className="w-12 h-12 bg-primary/15 border border-primary/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
              <span className="material-symbols-outlined text-[26px]">lock_reset</span>
            </div>
            <h1 className="text-2xl font-black text-foreground tracking-tight mb-1">
              Neural Key Recovery
            </h1>
            <p className="text-xs text-muted-foreground font-semibold mb-6">
              Enter your officer email to receive a secure biometric / OTP access link
            </p>

            <form onSubmit={handleResetRequest} className="space-y-4 text-left">
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-foreground block mb-1">
                  Registered Email / FIFA ID
                </label>
                <input
                  type="email"
                  required
                  placeholder="admin@pulse.stadium"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-all font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary via-violet-600 to-accent text-white font-black py-3.5 rounded-xl hover:opacity-95 transition-all shadow-lg active:scale-98 flex items-center justify-center gap-2 text-sm tracking-wide"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">autorenew</span>
                    Verifying Clearance...
                  </>
                ) : (
                  <>
                    <span>Send Recovery Token</span>
                    <span className="material-symbols-outlined text-[18px]">send</span>
                  </>
                )}
              </button>
            </form>
          </>
        )}

        {step === "sent" && (
          <div className="space-y-4 py-4">
            <div className="w-16 h-16 bg-green-500/15 border border-green-500/30 rounded-3xl flex items-center justify-center mx-auto text-green-500">
              <span className="material-symbols-outlined text-[32px]">mark_email_read</span>
            </div>
            <h2 className="text-xl font-black text-foreground">Recovery Link Dispatched</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We sent a secure single-use access link and Level 5 OTP to <span className="font-bold text-foreground">{email || "your officer email"}</span>.
            </p>
            <div className="pt-2">
              <Link
                href="/login"
                className="inline-block bg-muted hover:bg-muted/80 text-foreground font-extrabold text-xs px-6 py-3 rounded-xl border border-border transition-all"
              >
                Return to Enterprise Login →
              </Link>
            </div>
          </div>
        )}

        <div className="mt-6 pt-5 border-t border-border text-center text-xs text-muted-foreground font-medium">
          Remembered your password?{" "}
          <Link href="/login" className="text-foreground font-extrabold hover:text-primary transition-colors">
            Back to Sign In →
          </Link>
        </div>
      </div>
    </main>
  );
}
