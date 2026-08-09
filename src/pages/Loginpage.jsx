import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { LockKeyhole } from "lucide-react";
import { SiGoogle } from "@icons-pack/react-simple-icons";
import { useAuth } from "../context/Authcontext";

const inputClass = "mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-stone-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:focus:ring-green-900";
export default function LoginPage() {
  const { signIn, signInWithGoogle } = useAuth(); const navigate = useNavigate(); const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const destination = location.state?.from || "/profile";
  function submit(event) { event.preventDefault(); signIn({ email: form.email }); navigate(destination, { replace: true }); }
  function google() { signInWithGoogle(); navigate(destination, { replace: true }); }
  return <AuthShell title="Welcome back" description="Sign in to view orders, addresses, and account settings."><form onSubmit={submit} className="space-y-4"><label className="block text-sm font-medium">Email address<input className={inputClass} type="email" required autoComplete="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></label><label className="block text-sm font-medium">Password<input className={inputClass} type="password" required minLength="6" autoComplete="current-password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></label><button className="w-full rounded-xl bg-green-600 py-3 font-semibold text-white hover:bg-green-700">Sign in</button></form><Divider /><button type="button" onClick={google} className="flex w-full items-center justify-center gap-2 rounded-xl border border-stone-300 py-3 font-semibold hover:bg-stone-50 dark:border-stone-700 dark:hover:bg-stone-800"><SiGoogle size={18} /> Continue with Google</button><p className="mt-6 text-center text-sm text-stone-600 dark:text-stone-300">New to DorisWare? <Link to="/signup" state={{ from: destination }} className="font-semibold text-green-700 dark:text-green-400">Create an account</Link></p></AuthShell>;
}
export function AuthShell({ title, description, children }) { return <div className="flex min-h-[70vh] items-center justify-center bg-stone-50 px-4 py-12 dark:bg-stone-950"><section className="w-full max-w-md rounded-3xl bg-white p-7 shadow-sm dark:bg-stone-900 sm:p-9"><div className="mb-7 flex h-11 w-11 items-center justify-center rounded-2xl bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"><LockKeyhole size={21} /></div><h1 className="font-serif text-3xl font-semibold text-stone-900 dark:text-stone-100">{title}</h1><p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-300">{description}</p><div className="mt-7">{children}</div></section></div>; }
export function Divider() { return <div className="my-6 flex items-center gap-3 text-xs text-stone-400"><span className="h-px flex-1 bg-stone-200 dark:bg-stone-700" />OR<span className="h-px flex-1 bg-stone-200 dark:bg-stone-700" /></div>; }
