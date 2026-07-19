"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, updateDoc, runTransaction } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/firestore/schema";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [ticketId, setTicketId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const cleanTicketId = ticketId.trim().toUpperCase();

    try {
      const ticketRef = doc(db, COLLECTIONS.TICKETS, cleanTicketId);

      // Step 1: Check and claim ticket within an atomic transaction
      const claimedTicketData = await runTransaction(db, async (transaction) => {
        const tSnap = await transaction.get(ticketRef);
        if (!tSnap.exists()) {
          throw new Error("Ticket not found or already used.");
        }
        const tData = tSnap.data();
        if (!tData.valid || tData.used) {
          throw new Error("Ticket not found or already used.");
        }
        // Temporarily lock ticket
        transaction.update(ticketRef, {
          used: true,
          usedByUid: "CLAIMING_PENDING",
        });
        return tData;
      });

      // Step 2: Create Firebase Auth account
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const user = userCredential.user;

        // Step 3: Write user document to Firestore and finalize ticket ownership
        await setDoc(doc(db, COLLECTIONS.USERS, user.uid), {
          uid: user.uid,
          email: user.email,
          name: name || "Tournament Fan",
          role: "fan",
          matchName: claimedTicketData.matchName || "GLOBAL TOURNAMENT 2026 · SEMIFINAL",
          seat: claimedTicketData.seat || "Section 108, Row 12, Seat 14",
          createdAt: new Date().toISOString(),
        });

        await updateDoc(ticketRef, {
          usedByUid: user.uid,
        });

        // Set local session markers
        if (typeof window !== "undefined") {
          localStorage.setItem("pulse_user_role", "fan");
          localStorage.setItem("pulse_user_name", name || "Tournament Fan");
          document.cookie = "pulse_user_role=fan; path=/; max-age=86400";
        }

        router.push("/fan");
      } catch (authErr: any) {
        // Rollback ticket lock if Auth creation failed
        await updateDoc(ticketRef, {
          used: false,
          usedByUid: null,
        }).catch(() => {});
        throw authErr;
      }
    } catch (err: any) {
      console.error("[Signup Error]", err);
      let displayErr = err.message || "Failed to create account.";
      if (displayErr.includes("auth/email-already-in-use")) {
        displayErr = "This email address is already registered.";
      }
      setErrorMsg(displayErr);
      setLoading(false);
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
            Ticket-Gated Fan Registration
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            Register for Tournament Pass
          </h1>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            Valid match ticket reference required to unlock digital twin wayfinding & ordering
          </p>
        </div>

        {/* Staff Notice Banner (Replaces self-signup tabs) */}
        <div className="p-4 rounded-2xl bg-muted/90 border border-border mb-6 text-left">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">admin_panel_settings</span>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-foreground">
                Control Room Staff Access
              </h4>
              <p className="text-[11px] text-muted-foreground font-medium mt-1 leading-relaxed">
                Control Room and Security accounts are provisioned privately by system administrators out-of-band. Contact your organization&apos;s PULSE administrator or IT command center for credentials.
              </p>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-500/15 border border-red-500/40 text-red-500 text-xs font-bold flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-sm">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-foreground block mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Jordan Taylor"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-all font-medium"
            />
          </div>

          <div>
            <label className="text-xs font-black uppercase tracking-wider text-foreground block mb-1">
              Ticket ID / Booking Reference
            </label>
            <input
              type="text"
              required
              placeholder="e.g. WC26-DAL-00142"
              value={ticketId}
              onChange={(e) => setTicketId(e.target.value)}
              className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm uppercase text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-all font-mono font-bold"
            />
          </div>

          <div>
            <label className="text-xs font-black uppercase tracking-wider text-foreground block mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="jordan.taylor@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-all font-medium"
            />
          </div>

          <div>
            <label className="text-xs font-black uppercase tracking-wider text-foreground block mb-1">
              Create Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
                Verifying Ticket & Registering...
              </>
            ) : (
              <>
                <span>Activate Fan Pass</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 pt-5 border-t border-border text-center text-xs text-muted-foreground font-medium flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Already have an active account?{" "}
            <Link href="/login" className="text-foreground font-extrabold hover:text-primary transition-colors">
              Sign In to Console →
            </Link>
          </span>
          <span className="text-muted-foreground/80 text-[11px]">
            Staff Access:{" "}
            <a href="mailto:admin@pulse-stadium.ai" className="hover:underline">
              Contact Administrator
            </a>
          </span>
        </div>
      </div>
    </main>
  );
}
