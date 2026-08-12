import { WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

export default function ConnectionStatus() {
  const [online, setOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const markOnline = () => setOnline(true);
    const markOffline = () => setOnline(false);
    window.addEventListener("online", markOnline);
    window.addEventListener("offline", markOffline);
    return () => {
      window.removeEventListener("online", markOnline);
      window.removeEventListener("offline", markOffline);
    };
  }, []);

  if (online) return null;
  return <div role="alert" className="fixed inset-x-0 bottom-0 z-[110] flex items-center justify-center gap-2 bg-stone-900 px-4 py-3 text-center text-sm font-medium text-white shadow-lg dark:bg-amber-500 dark:text-stone-950"><WifiOff size={17} /> You&apos;re offline. Check your connection and try again.</div>;
}
