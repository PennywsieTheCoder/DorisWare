import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { SiGoogle } from "@icons-pack/react-simple-icons";
import { useAuth } from "../context/Authcontext";
import { AuthShell, Divider } from "./Loginpage";

const inputClass = "mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-stone-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:focus:ring-green-900";
export default function SignupPage() {
  const { signIn, signInWithGoogle } = useAuth(); const navigate = useNavigate(); const location = useLocation(); const [form, setForm] = useState({ name: "", email: "", password: "" }); const destination = location.state?.from || "/profile";
  function submit(event) { event.preventDefault(); signIn({ name: form.name, email: form.email }); navigate(destination); }
  function google() { signInWithGoogle(); navigate(destination); }
  return <AuthShell title="Create your account" description="Save your details and make checkout quicker next time."><form onSubmit={submit} className="space-y-4"><label className="block text-sm font-medium">Full name<input className={inputClass} required autoComplete="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label><label className="block text-sm font-medium">Email address<input className={inputClass} type="email" required autoComplete="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></label><label className="block text-sm font-medium">Password<input className={inputClass} type="password" required minLength="6" autoComplete="new-password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></label><button className="w-full rounded-xl bg-green-600 py-3 font-semibold text-white hover:bg-green-700">Create account</button></form><Divider /><button type="button" onClick={google} className="flex w-full items-center justify-center gap-2 rounded-xl border border-stone-300 py-3 font-semibold hover:bg-stone-50 dark:border-stone-700 dark:hover:bg-stone-800"><SiGoogle size={18} /> Sign up with Google</button><p className="mt-6 text-center text-sm text-stone-600 dark:text-stone-300">Already have an account? <Link to="/login" className="font-semibold text-green-700 dark:text-green-400">Sign in</Link></p></AuthShell>;
}
