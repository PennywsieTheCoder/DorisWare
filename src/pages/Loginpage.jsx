import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  LockKeyhole,
  Eye,
  EyeOff,
  Mail,
  ArrowRight,
  Sparkles,
  ChefHat,
  Star,
} from "lucide-react";
import { useAuth } from "../context/Authcontext";
import TurnstileWidget from "../components/TurnstileWidget";
import { supabase } from "../lib/supabase";

/* ─── Shared input style ──────────────────────────────────────────────────── */
export const inputClass =
  "w-full rounded-2xl border border-stone-200 bg-white/70 px-4 py-3.5 text-stone-900 outline-none backdrop-blur-sm transition-all duration-200 placeholder:text-stone-400 focus:border-green-500 focus:bg-white focus:ring-3 focus:ring-green-100 dark:border-stone-700/60 dark:bg-stone-900/60 dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:border-green-500 dark:focus:bg-stone-900 dark:focus:ring-green-950/50";

/* ─── Floating decorative orb ────────────────────────────────────────────── */
function Orb({ className }) {
  return (
    <div
      className={`pointer-events-none absolute rounded-full blur-3xl opacity-20 dark:opacity-10 ${className}`}
    />
  );
}

/* ─── Animated cookware icon strip ──────────────────────────────────────── */
function FloatingIcon({ emoji, style }) {
  return (
    <span
      className="absolute select-none text-2xl sm:text-3xl animate-float"
      style={style}
    >
      {emoji}
    </span>
  );
}

/* ─── Brand panel (left side) ────────────────────────────────────────────── */
function BrandPanel() {
  const floaters = [
    { emoji: "🍳", style: { top: "12%", left: "10%", animationDelay: "0s", animationDuration: "6s" } },
    { emoji: "🥘", style: { top: "28%", right: "8%", animationDelay: "1.2s", animationDuration: "7s" } },
    { emoji: "🫕", style: { top: "55%", left: "6%", animationDelay: "2.4s", animationDuration: "5.5s" } },
    { emoji: "🍲", style: { top: "72%", right: "12%", animationDelay: "0.8s", animationDuration: "8s" } },
    { emoji: "☕", style: { top: "85%", left: "20%", animationDelay: "3s", animationDuration: "6.5s" } },
    { emoji: "🧁", style: { top: "42%", left: "50%", animationDelay: "1.8s", animationDuration: "7.5s" } },
  ];

  const reviews = [
    { name: "Sarah M.", text: "The best cookware I've ever owned!", stars: 5 },
    { name: "James T.", text: "DorisWare changed how I cook.", stars: 5 },
  ];

  return (
    <div className="relative hidden lg:flex lg:w-[52%] xl:w-[55%] flex-col justify-between overflow-hidden bg-gradient-to-br from-stone-900 via-stone-800 to-stone-950 p-12 xl:p-16">
      {/* Background texture */}
      <Orb className="h-[500px] w-[500px] bg-green-500 -top-40 -left-40" />
      <Orb className="h-[400px] w-[400px] bg-amber-500 bottom-0 right-0 translate-x-1/3 translate-y-1/3" />
      <Orb className="h-[300px] w-[300px] bg-emerald-400 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

      {/* Floating food icons */}
      {floaters.map((f, i) => (
        <FloatingIcon key={i} emoji={f.emoji} style={f.style} />
      ))}

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Top: Brand logo */}
      <div className="relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-500/20 backdrop-blur-sm border border-green-400/30">
            <ChefHat className="h-6 w-6 text-green-400" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">
            DorisWare
          </span>
        </div>
      </div>

      {/* Middle: Hero copy */}
      <div className="relative z-10 flex flex-col gap-6">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-green-400/30 bg-green-500/10 px-4 py-1.5 backdrop-blur-sm">
          <Sparkles className="h-3.5 w-3.5 text-green-400" />
          <span className="text-xs font-medium text-green-300 tracking-wide uppercase">
            Premium Cookware
          </span>
        </div>

        <h2 className="font-serif text-4xl xl:text-5xl font-bold leading-[1.1] text-white">
          Cook with{" "}
          <span className="bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
            confidence.
          </span>
          <br />
          Live with joy.
        </h2>

        <p className="max-w-sm text-base leading-relaxed text-stone-300">
          Your account unlocks personalised recommendations, order tracking,
          saved addresses, and our exclusive loyalty rewards.
        </p>

        {/* Review cards */}
        <div className="flex flex-col gap-3 pt-2">
          {reviews.map((r) => (
            <div
              key={r.name}
              className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-500/20 text-xs font-bold text-green-300">
                {r.name[0]}
              </div>
              <div>
                <div className="flex items-center gap-1 mb-0.5">
                  {Array.from({ length: r.stars }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-3 w-3 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="text-sm text-stone-300 leading-snug">
                  "{r.text}"
                </p>
                <p className="mt-0.5 text-xs font-medium text-stone-500">
                  — {r.name}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom: trust badges */}
      <div className="relative z-10 flex items-center gap-6">
        {[
          { label: "Products", value: "200+" },
          { label: "Happy cooks", value: "12K+" },
          { label: "Rating", value: "4.9★" },
        ].map((b) => (
          <div key={b.label} className="text-center">
            <p className="text-xl font-bold text-white">{b.value}</p>
            <p className="text-xs text-stone-400">{b.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Divider ────────────────────────────────────────────────────────────── */
export function Divider() {
  return (
    <div className="my-5 flex items-center gap-3 text-xs text-stone-400">
      <span className="h-px flex-1 bg-stone-200 dark:bg-stone-700" />
      <span className="font-medium tracking-widest uppercase">or</span>
      <span className="h-px flex-1 bg-stone-200 dark:bg-stone-700" />
    </div>
  );
}

export function GoogleMark() {
  return <svg aria-hidden="true" viewBox="0 0 18 18" className="h-[18px] w-[18px] shrink-0"><path fill="#4285F4" d="M17.64 9.205c0-.638-.057-1.251-.164-1.841H9v3.482h4.844a4.14 4.14 0 0 1-1.8 2.716v2.258h2.91c1.704-1.568 2.686-3.876 2.686-6.615Z" /><path fill="#34A853" d="M9 18c2.43 0 4.466-.806 5.954-2.18l-2.91-2.258c-.806.54-1.837.858-3.044.858-2.343 0-4.326-1.582-5.034-3.708H.956v2.332A9 9 0 0 0 9 18Z" /><path fill="#FBBC05" d="M3.966 10.712A5.412 5.412 0 0 1 3.684 9c0-.593.102-1.17.282-1.712V4.956H.956A9 9 0 0 0 0 9c0 1.452.348 2.827.956 4.044l3.01-2.332Z" /><path fill="#EA4335" d="M9 3.58c1.322 0 2.51.454 3.444 1.345l2.584-2.584C13.462.88 11.426 0 9 0A9 9 0 0 0 .956 4.956l3.01 2.332C4.674 5.162 6.657 3.58 9 3.58Z" /></svg>;
}

/* ─── AuthShell (shared by Login & Signup) ───────────────────────────────── */
export function AuthShell({ title, description, children, bottomLink }) {
  return (
    <div className="relative flex min-h-screen overflow-x-hidden bg-stone-50 dark:bg-stone-950">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-12px) rotate(3deg); }
          66% { transform: translateY(-6px) rotate(-2deg); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
      `}</style>

      {/* Left decorative panel */}
      <BrandPanel />

      {/* Right: the form */}
      <div className="relative flex flex-1 items-start justify-center px-4 py-8 sm:items-center sm:px-5 sm:py-10 lg:px-10 xl:px-16">
        <div className="relative z-10 w-full max-w-md rounded-[1.75rem] border border-stone-200/80 bg-white/95 px-5 py-6 shadow-[0_18px_48px_-24px_rgba(20,83,45,.5)] backdrop-blur sm:px-7 sm:py-8 dark:border-0 dark:bg-transparent dark:shadow-none lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
          {/* Heading */}
          <div className="mb-7">
            <h1 className="font-serif text-3xl font-bold text-stone-900 dark:text-white">
              {title}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-stone-500 dark:text-stone-400">
              {description}
            </p>
          </div>

          {/* Form content */}
          {children}

          {/* Bottom link slot */}
          {bottomLink && (
            <div className="mt-7 text-center text-sm text-stone-500 dark:text-stone-400">
              {bottomLink}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Login Page ─────────────────────────────────────────────────────────── */
export default function LoginPage() {
  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaReset, setCaptchaReset] = useState(0);
  const [mfaFactor, setMfaFactor] = useState(null);
  const [mfaCode, setMfaCode] = useState("");
  const destination = location.state?.from || "/";
  const successMessage = location.state?.message;

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!captchaToken) { setError("Complete the security check before signing in."); return; }
    setLoading(true);
    try {
      const { error: signInError } = await signIn({ ...form, remember, captchaToken });
      if (signInError) throw signInError;
      const { data: factorData } = await supabase.auth.mfa.listFactors();
      const verifiedFactor = factorData?.totp?.find((factor) => factor.status === "verified");
      if (verifiedFactor) { setMfaFactor(verifiedFactor); return; }
      navigate(destination, { replace: true });
    } catch (signInError) {
      setError(signInError.message || "Incorrect email or password. Please try again.");
    } finally {
      setCaptchaReset((value) => value + 1);
      setLoading(false);
    }
  }

  async function verifyMfaLogin(event) {
    event.preventDefault(); setError(""); setLoading(true);
    const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({ factorId: mfaFactor.id, code: mfaCode });
    if (verifyError) setError("That authenticator code was not accepted."); else navigate(destination, { replace: true });
    setLoading(false);
  }

  async function handleGoogle() {
    setError("");
    if (!captchaToken) { setError("Complete the security check before continuing with Google."); return; }
    setGoogleLoading(true);
    try {
      const { error: googleError } = await signInWithGoogle(captchaToken);
      if (googleError) throw googleError;
    } catch (googleError) {
      setError(googleError.message || "Google sign-in could not start. Please try again.");
    } finally {
      setCaptchaReset((value) => value + 1);
      setGoogleLoading(false);
    }
  }

  return (
    <AuthShell
      title="Welcome back 👋"
      description="Sign in to view your orders, addresses, and account settings."
      bottomLink={
        <>
          New to DorisWare?{" "}
          <Link
            to="/signup"
            state={{ from: destination }}
            className="font-semibold text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors"
          >
            Create an account →
          </Link>
        </>
      }
    >
      {mfaFactor ? <form onSubmit={verifyMfaLogin} className="space-y-4"><div className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100"><p className="font-semibold">Enter your authenticator code</p><p className="mt-1 text-xs">Open your authenticator app and enter the current six-digit code.</p></div><input autoFocus value={mfaCode} onChange={(event) => setMfaCode(event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" placeholder="000000" className={`${inputClass} text-center text-xl tracking-[.35em]`} /><button type="submit" disabled={loading || mfaCode.length !== 6} className="w-full rounded-2xl bg-emerald-700 py-3.5 text-sm font-semibold text-white disabled:opacity-60">{loading ? "Verifying…" : "Verify and continue"}</button>{error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">{error}</p>}</form> : <>
      {/* Google button */}
      <button
        type="button"
        onClick={handleGoogle}
        disabled={googleLoading || !captchaToken}
        id="google-signin-btn"
        className="flex h-11 w-full items-center justify-center gap-3 rounded-md border border-[#747775] bg-white px-3 text-sm font-medium text-[#1f1f1f] shadow-sm transition hover:bg-[#f8fafd] hover:shadow focus:outline-none focus-visible:ring-4 focus-visible:ring-[#0b57d0]/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-stone-600 dark:bg-white dark:text-[#1f1f1f]"
      >
        <GoogleMark />
        {googleLoading ? "Signing in…" : "Continue with Google"}
      </button>

      <Divider />

      {/* Email/password form */}
      <form onSubmit={submit} className="space-y-4" id="login-form" noValidate>
        {/* Email */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300">
            Email address
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-stone-400" />
            <input
              id="email-input"
              className={`${inputClass} pl-10`}
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
              Password
            </label>
            <Link
              to="/?reset-password=request"
              className="text-xs font-medium text-green-600 hover:text-green-700 dark:text-green-400 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-stone-400" />
            <input
              id="password-input"
              className={`${inputClass} pl-10 pr-11`}
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              autoComplete="current-password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
            </button>
          </div>
        </div>

        <TurnstileWidget onTokenChange={setCaptchaToken} resetSignal={captchaReset} />

        {/* Error message */}
        {error && (
          <p
            role="alert"
            className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400"
          >
            {error}
          </p>
        )}

        {successMessage && (
          <p role="status" className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-950/40 dark:text-green-300">
            {successMessage}
          </p>
        )}

        {/* Remember me */}
        <label className="flex cursor-pointer items-center gap-2.5 select-none">
          <input
            type="checkbox"
            id="remember-me"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
            className="h-4 w-4 rounded border-stone-300 text-green-600 accent-green-600 dark:border-stone-600"
          />
          <span className="text-sm text-stone-600 dark:text-stone-400">
            Remember me for 30 days
          </span>
        </label>

        {/* Submit */}
        <button
          type="submit"
          id="signin-submit-btn"
          disabled={loading || !captchaToken}
          className="group relative mt-2 flex w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-green-500/20 transition-all duration-200 hover:from-green-500 hover:to-emerald-500 hover:shadow-green-500/30 active:scale-[0.98] disabled:opacity-70"
        >
          <span className="flex items-center gap-2">
            {loading ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Signing in…
              </>
            ) : (
              <>
                Sign in
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </>
            )}
          </span>
          {/* Shimmer effect */}
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
        </button>
      </form>

      {/* Trust note */}
      <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-stone-400 dark:text-stone-500">
        <LockKeyhole className="h-3 w-3" />
        Your data is encrypted and never shared
      </p>
      </>}
    </AuthShell>
  );
}
