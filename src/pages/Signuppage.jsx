import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { User, Mail, LockKeyhole, Eye, EyeOff, ArrowRight } from "lucide-react";
import { SiGoogle } from "@icons-pack/react-simple-icons";
import { useAuth } from "../context/Authcontext";
import { AuthShell, Divider, inputClass } from "./Loginpage";

export default function SignupPage() {
  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const destination = location.state?.from || "/profile";

  function submit(e) {
    e.preventDefault();
    setLoading(true);
    signIn({ name: form.name, email: form.email });
    navigate(destination);
  }

  function handleGoogle() {
    setGoogleLoading(true);
    signInWithGoogle();
    navigate(destination);
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
        disabled={googleLoading}
        id="google-signup-btn"
        className="flex w-full items-center justify-center gap-3 rounded-2xl border border-stone-200 bg-white py-3.5 text-sm font-semibold text-stone-700 shadow-sm transition-all duration-200 hover:bg-stone-50 hover:border-stone-300 hover:shadow active:scale-[0.98] disabled:opacity-60 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800/80"
      >
        <SiGoogle size={18} />
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

        {/* Submit */}
        <button
          type="submit"
          id="signup-submit-btn"
          disabled={loading}
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
