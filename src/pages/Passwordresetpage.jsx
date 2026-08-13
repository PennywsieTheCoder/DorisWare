import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { KeyRound, LockKeyhole, Mail } from "lucide-react";
import { supabase } from "../lib/supabase";
import TurnstileWidget from "../components/TurnstileWidget";
import { AuthShell, inputClass } from "./Loginpage";

export default function PasswordResetPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isUpdate = searchParams.get("reset-password") === "update" || searchParams.get("mode") === "update";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaReset, setCaptchaReset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function requestReset(event) {
    event.preventDefault();
    setError(""); setMessage("");
    if (!captchaToken) { setError("Complete the security check before requesting a reset."); return; }
    setLoading(true);
    const redirectTo = `${window.location.origin}${import.meta.env.BASE_URL}?reset-password=update`;
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo, captchaToken });
    setCaptchaReset((value) => value + 1);
    setLoading(false);
    if (resetError) { setError(resetError.message || "We could not send the reset email. Please try again."); return; }
    setMessage("If that email has an account, a password-reset link is on its way.");
  }

  async function updatePassword(event) {
    event.preventDefault();
    setError(""); setMessage("");
    if (password.length < 6) { setError("Use at least 6 characters for your new password."); return; }
    if (password !== confirmPassword) { setError("The passwords do not match."); return; }
    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) { setError(updateError.message || "We could not update your password. Request a new link and try again."); return; }
    navigate("/login", { replace: true, state: { message: "Password updated. Sign in with your new password." } });
  }

  return <AuthShell
    title={isUpdate ? "Choose a new password" : "Reset your password"}
    description={isUpdate ? "Enter a new password for your DorisWare account." : "Enter your email and we’ll send a secure password-reset link."}
    bottomLink={<Link to="/login" className="font-semibold text-green-600 hover:text-green-700 dark:text-green-400">← Back to sign in</Link>}
  >
    <form onSubmit={isUpdate ? updatePassword : requestReset} className="space-y-4">
      {isUpdate ? <>
        <Field label="New password" value={password} onChange={setPassword} placeholder="At least 6 characters" />
        <Field label="Confirm new password" value={confirmPassword} onChange={setConfirmPassword} placeholder="Repeat your new password" />
      </> : <>
        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">Email address
          <div className="relative mt-1.5"><Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" /><input className={`${inputClass} pl-10`} type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></div>
        </label>
        <TurnstileWidget onTokenChange={setCaptchaToken} resetSignal={captchaReset} />
      </>}
      {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">{error}</p>}
      {message && <p role="status" className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-950/40 dark:text-green-300">{message}</p>}
      <button type="submit" disabled={loading || (!isUpdate && !captchaToken)} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-green-500/20 disabled:opacity-70">
        {isUpdate ? <LockKeyhole size={17} /> : <KeyRound size={17} />}{loading ? "Please wait…" : isUpdate ? "Update password" : "Send reset link"}
      </button>
    </form>
  </AuthShell>;
}

function Field({ label, value, onChange, placeholder }) {
  return <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">{label}<div className="relative mt-1.5"><LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" /><input className={`${inputClass} pl-10`} type="password" required minLength={6} autoComplete="new-password" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} /></div></label>;
}
