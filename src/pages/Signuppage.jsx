import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { User, Mail, LockKeyhole, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useAuth } from "../context/Authcontext";
import { AuthShell, Divider, GoogleMark, inputClass } from "./Loginpage";
import TurnstileWidget from "../components/TurnstileWidget";

export default function SignupPage() {
  const { signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaReset, setCaptchaReset] = useState(0);
  const destination = location.state?.from || "/";

  async function submit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!captchaToken) { setError("Complete the security check before creating your account."); return; }
    setLoading(true);
    try {
      const { data, error: signUpError } = await signUp({ ...form, captchaToken });
      if (signUpError) throw signUpError;
      if (!data.session) {
        setMessage("Account created. Check your email to confirm your address, then sign in.");
        return;
      }
      navigate(destination, { replace: true });
    } catch (signUpError) {
      setError(signUpError.message || "We could not create the account. Please try again.");
    } finally {
      setCaptchaReset((value) => value + 1);
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError("");
    if (!captchaToken) { setError("Complete the security check before continuing with Google."); return; }
    setGoogleLoading(true);
    try {
      const { error: googleError } = await signInWithGoogle(captchaToken);
      if (googleError) throw googleError;
    } catch (googleError) {
      setError(googleError.message || "Google sign-up could not start. Please try again.");
    } finally {
      setCaptchaReset((value) => value + 1);
      setGoogleLoading(false);
    }
  }

  return (
    <AuthShell
      title="Create your account ✨"
      description="Save your details and make checkout quicker next time."
      bottomLink={
        <>
          Already have an account?{" "}
          <Link
            to="/login"
            state={{ from: destination }}
            className="font-semibold text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors"
          >
            Sign in →
          </Link>
        </>
      }
    >
      {/* Google button */}
      <button
        type="button"
        onClick={handleGoogle}
        disabled={googleLoading || !captchaToken}
        id="google-signup-btn"
        className="flex h-11 w-full items-center justify-center gap-3 rounded-md border border-[#747775] bg-white px-3 text-sm font-medium text-[#1f1f1f] shadow-sm transition hover:bg-[#f8fafd] hover:shadow focus:outline-none focus-visible:ring-4 focus-visible:ring-[#0b57d0]/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-stone-600 dark:bg-white dark:text-[#1f1f1f]"
      >
        <GoogleMark />
        {googleLoading ? "Signing up…" : "Sign up with Google"}
      </button>

      <Divider />

      <form onSubmit={submit} id="signup-form" className="space-y-4" noValidate>
        {/* Name */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300">
            Full name
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              id="name-input"
              className={`${inputClass} pl-10`}
              required
              autoComplete="name"
              placeholder="Doris Owusu"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300">
            Email address
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
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
          <label className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300">
            Password
          </label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              id="password-input"
              className={`${inputClass} pl-10 pr-11`}
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          <p className="mt-1.5 text-xs text-stone-400">Must be at least 6 characters</p>
        </div>

        {/* Terms */}
        <label className="flex cursor-pointer items-start gap-2.5 select-none">
          <input
            type="checkbox"
            required
            id="terms-checkbox"
            className="mt-0.5 h-4 w-4 rounded border-stone-300 accent-green-600 dark:border-stone-600"
          />
          <span className="text-xs leading-relaxed text-stone-500 dark:text-stone-400">
            I agree to DorisWare's{" "}
            <Link to="/terms" className="text-green-600 underline-offset-2 hover:underline dark:text-green-400">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-green-600 underline-offset-2 hover:underline dark:text-green-400">
              Privacy Policy
            </Link>
          </span>
        </label>

        <TurnstileWidget onTokenChange={setCaptchaToken} resetSignal={captchaReset} />

        {error && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
            {error}
          </p>
        )}

        {message && (
          <p role="status" className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-950/40 dark:text-green-300">
            {message}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          id="signup-submit-btn"
          disabled={loading || !captchaToken}
          className="group relative mt-2 flex w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-green-500/20 transition-all duration-200 hover:from-green-500 hover:to-emerald-500 hover:shadow-green-500/30 active:scale-[0.98] disabled:opacity-70"
        >
          <span className="flex items-center gap-2">
            {loading ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating account…
              </>
            ) : (
              <>
                Create account
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </>
            )}
          </span>
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
        </button>
      </form>

      <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-stone-400 dark:text-stone-500">
        <LockKeyhole className="h-3 w-3" />
        Your data is encrypted and never shared
      </p>
    </AuthShell>
  );
}
