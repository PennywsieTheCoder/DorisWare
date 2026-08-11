import { Link, useLocation, useSearchParams } from "react-router-dom";
import { CheckCircle2, Clock3, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useCart } from "../context/Cartcontext";

export default function OrderConfirmationPage() {
  const { state } = useLocation();
  const [searchParams] = useSearchParams();
  const reference = searchParams.get("reference");
  const { clearCart } = useCart();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(Boolean(reference));

  useEffect(() => {
    if (!reference) return undefined;
    let active = true;

    async function loadOrder() {
      const { data } = await supabase
        .from("orders")
        .select("order_number, payment_status, status, total")
        .eq("payment_reference", reference)
        .maybeSingle();

      if (!active) return;
      setOrder(data);
      setLoading(false);
      if (data?.payment_status === "paid") clearCart();
    }

    loadOrder();
    const interval = window.setInterval(loadOrder, 3000);
    return () => { active = false; window.clearInterval(interval); };
  }, [clearCart, reference]);

  const paymentIsComplete = order?.payment_status === "paid";
  const paymentFailed = order?.payment_status === "failed";
  const orderNumber = order?.order_number ?? state?.orderNumber;

  const appearance = paymentIsComplete
    ? { icon: CheckCircle2, iconClass: "text-green-600", title: "Payment confirmed", message: "Thank you for shopping with DorisWare. Your order is now being prepared." }
    : paymentFailed
      ? { icon: XCircle, iconClass: "text-red-600", title: "Payment was not completed", message: "No payment was received for this order. Return to checkout to try again." }
      : { icon: Clock3, iconClass: "text-amber-500", title: "Confirming your payment", message: "Paystack is confirming the transaction. This usually takes a few seconds." };
  const Icon = appearance.icon;

  return (
    <div className="flex min-h-[65vh] items-center justify-center bg-stone-50 px-4 py-12 dark:bg-stone-950">
      <section className="max-w-lg rounded-3xl bg-white p-8 text-center shadow-sm dark:bg-stone-900 sm:p-12">
        <Icon className={`mx-auto h-16 w-16 ${appearance.iconClass}`} />
        <h1 className="mt-6 font-serif text-3xl font-semibold text-stone-900 dark:text-stone-100">{appearance.title}</h1>
        <p className="mt-3 text-stone-600 dark:text-stone-300">{appearance.message}</p>
        {orderNumber && <p className="mt-3 text-sm text-stone-500 dark:text-stone-400">Order reference: <strong>{orderNumber}</strong>.</p>}
        {loading && <p className="mt-3 text-xs text-stone-400">Checking payment status…</p>}
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/profile" className="rounded-full border border-stone-200 px-5 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-50 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800">View orders</Link>
          <Link to="/shop" className="rounded-full bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700">Continue shopping</Link>
        </div>
      </section>
    </div>
  );
}
