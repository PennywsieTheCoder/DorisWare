import { Link, useLocation } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

export default function OrderConfirmationPage() {
  const { state } = useLocation();
  const orderNumber = state?.orderNumber ?? "DW-DEMO";
  return <div className="flex min-h-[65vh] items-center justify-center bg-stone-50 px-4 py-12 dark:bg-stone-950"><section className="max-w-lg rounded-3xl bg-white p-8 text-center shadow-sm dark:bg-stone-900 sm:p-12"><CheckCircle2 className="mx-auto h-16 w-16 text-green-600" /><h1 className="mt-6 font-serif text-3xl font-semibold text-stone-900 dark:text-stone-100">Order received</h1><p className="mt-3 text-stone-600 dark:text-stone-300">Thanks for shopping with DorisWare. Your order reference is <strong>{orderNumber}</strong>.</p><p className="mt-3 text-sm text-stone-500 dark:text-stone-400">This is a frontend confirmation. Payment and fulfilment will be completed by the backend integration.</p><Link to="/shop" className="mt-8 inline-block rounded-full bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700">Continue shopping</Link></section></div>;
}
