import { useLocation } from "react-router-dom";

export default function PageLoader() {
  const location = useLocation();

  return (
    <div key={`${location.pathname}${location.search}`} className="pointer-events-none fixed inset-x-0 top-0 z-[100]" role="status" aria-label="Loading page">
      <div className="h-1 origin-left animate-[pageLoad_.42s_ease-out_forwards] bg-gradient-to-r from-green-500 via-emerald-400 to-amber-400" />
    </div>
  );
}
