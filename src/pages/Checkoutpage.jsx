import { Link, Navigate } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, CheckCircle2, LockKeyhole } from "lucide-react";
import { useCart } from "../context/Cartcontext";
import { useAuth } from "../context/Authcontext";
import { supabase } from "../lib/supabase";

const fieldClass = "mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-stone-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:focus:ring-green-900";
export default function CheckoutPage() {
  const { items } = useCart(); const { user, updateProfile, createOrder, addAddress } = useAuth();
  const [form, setForm] = useState(() => ({ email: user?.email ?? "", firstName: user?.name?.split(" ")[0] ?? "", lastName: user?.name?.split(" ").slice(1).join(" ") ?? "", phone: user?.phone ?? "", address: "", city: "", region: "Greater Accra", country: "Ghana", notes: "", payment: "mobile-money", mobileProvider: "mtn", mobileNumber: user?.phone ?? "", saveAddress: true, newsletter: false, terms: false }));
  const [submitting, setSubmitting] = useState(false); const [submitError, setSubmitError] = useState("");
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0); const shipping = subtotal ? 5 : 0; const total = subtotal + shipping;
  const change = (event) => { const { name, value, type, checked } = event.target; setForm({ ...form, [name]: type === "checkbox" ? checked : value }); };
  if (!items.length) return <Navigate to="/shop" replace />;
  if (!user) return <Navigate to="/login" replace state={{ from: "/checkout" }} />;
  async function submit(event) {
    event.preventDefault();
    setSubmitError(""); setSubmitting(true);
    const fullName = `${form.firstName} ${form.lastName}`.trim();
    const orderNumber = `DW-${Math.floor(100000 + Math.random() * 900000)}`;
    const newAddressObj = {
      label: "Delivery Address",
      recipient: fullName,
      phone: form.phone,
      street: form.address,
      city: form.city,
      region: form.region,
      country: form.country,
      isDefault: false,
    };
    const { data: createdOrder, error } = await createOrder({
      order_number: orderNumber,
      status: "pending_payment",
      payment_method: form.payment === "mobile-money" ? "mobile_money" : "card",
      payment_status: "pending",
      currency: "GHS",
      subtotal,
      shipping_fee: shipping,
      total,
      contact_email: form.email,
      contact_phone: form.phone,
      shipping_address: newAddressObj,
      delivery_notes: form.notes || null,
      items: items.map((it) => ({
        product_id: it.id,
        product_name: it.name,
        product_image_url: it.images?.[0] || null,
        unit_price: it.unitPrice,
        quantity: it.quantity,
      })),
    });
    if (error) {
      setSubmitError("We could not save the order. Please try again."); setSubmitting(false); return;
    }

    const { data: payment, error: paymentError } = await supabase.functions.invoke("initialize-paystack-payment", {
      body: { orderId: createdOrder.id },
    });
    if (paymentError || !payment?.authorizationUrl) {
      setSubmitError("Your order was saved, but we could not start payment. Please try again shortly."); setSubmitting(false); return;
    }
    if (form.saveAddress) await addAddress(newAddressObj);
    await updateProfile({ name: fullName, phone: form.phone });
    window.location.assign(payment.authorizationUrl);
  }
  return <div className="bg-stone-50 px-4 py-10 dark:bg-stone-950 sm:px-6"><div className="mx-auto max-w-6xl"><Link to="/shop" className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-green-700 dark:text-stone-300"><ArrowLeft size={16} /> Continue shopping</Link><div className="mt-5 grid gap-8 lg:grid-cols-[1.35fr_.65fr]"><form onSubmit={submit} className="rounded-3xl bg-white p-6 shadow-sm dark:bg-stone-900 sm:p-8"><div className="flex items-start justify-between gap-4"><div><h1 className="font-serif text-3xl font-semibold text-stone-900 dark:text-stone-100">Checkout</h1><p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Ordering as {user.email}</p></div><LockKeyhole className="text-green-600" /></div><section className="mt-8"><h2 className="font-semibold text-stone-900 dark:text-stone-100">Contact details</h2><label className="mt-4 block text-sm font-medium text-stone-700 dark:text-stone-300">Email address<input className={fieldClass} required name="email" type="email" autoComplete="email" value={form.email} onChange={change} /></label></section><section className="mt-8"><h2 className="font-semibold text-stone-900 dark:text-stone-100">Delivery address</h2><div className="mt-4 grid gap-4 sm:grid-cols-2"><Field label="First name" name="firstName" autoComplete="given-name" form={form} change={change} /><Field label="Last name" name="lastName" autoComplete="family-name" form={form} change={change} /></div><Field label="Phone number" name="phone" type="tel" autoComplete="tel" form={form} change={change} /><Field label="Street address" name="address" autoComplete="street-address" form={form} change={change} /><div className="mt-4 grid gap-4 sm:grid-cols-2"><Field label="City" name="city" autoComplete="address-level2" form={form} change={change} /><label className="mt-4 block text-sm font-medium text-stone-700 dark:text-stone-300">Region<select className={fieldClass} required name="region" value={form.region} onChange={change}><option>Greater Accra</option><option>Ashanti</option><option>Central</option><option>Eastern</option><option>Western</option><option>Other</option></select></label></div><label className="mt-4 block text-sm font-medium text-stone-700 dark:text-stone-300">Country<select className={fieldClass} required name="country" value={form.country} onChange={change}><option>Ghana</option><option>Other</option></select></label><label className="mt-4 block text-sm font-medium text-stone-700 dark:text-stone-300">Delivery notes <span className="font-normal text-stone-400">(optional)</span><textarea className={fieldClass} name="notes" rows="3" placeholder="Landmark, gate instructions, or a preferred delivery time" value={form.notes} onChange={change} /></label></section><section className="mt-8"><h2 className="font-semibold text-stone-900 dark:text-stone-100">Payment method</h2><div className="mt-4 grid gap-3 sm:grid-cols-2">{[["mobile-money", "Mobile Money"], ["card", "Debit or credit card"]].map(([value, label]) => <label key={value} className={`cursor-pointer rounded-2xl border p-4 ${form.payment === value ? "border-green-600 bg-green-50 dark:bg-green-950/30" : "border-stone-200 dark:border-stone-700"}`}><input className="sr-only" type="radio" name="payment" value={value} checked={form.payment === value} onChange={change} /><span className="font-medium text-stone-900 dark:text-stone-100">{label}</span><span className="mt-1 block text-xs text-stone-500 dark:text-stone-400">Secure payment will be completed by our payment provider.</span></label>)}</div></section><div className="mt-7 space-y-3 text-sm text-stone-600 dark:text-stone-300"><label className="flex cursor-pointer items-start gap-3"><input type="checkbox" name="saveAddress" checked={form.saveAddress} onChange={change} className="mt-1 h-4 w-4 accent-green-600" /><span>Save this delivery address to my account.</span></label><label className="flex cursor-pointer items-start gap-3"><input type="checkbox" name="newsletter" checked={form.newsletter} onChange={change} className="mt-1 h-4 w-4 accent-green-600" /><span>Send me kitchen tips and occasional offers.</span></label><label className="flex cursor-pointer items-start gap-3"><input type="checkbox" name="terms" required checked={form.terms} onChange={change} className="mt-1 h-4 w-4 accent-green-600" /><span>I agree to the <Link to="/terms" className="font-semibold text-green-700 underline dark:text-green-400">Terms</Link> and <Link to="/privacy" className="font-semibold text-green-700 underline dark:text-green-400">Privacy Policy</Link>.</span></label></div>{submitError && <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">{submitError}</p>}<button type="submit" disabled={submitting} className="mt-8 w-full rounded-2xl bg-green-600 py-4 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70">{submitting ? "Saving order…" : `Continue to secure payment · ₵${total.toFixed(2)}`}</button></form><OrderSummary items={items} subtotal={subtotal} shipping={shipping} total={total} /></div></div></div>;
}
function Field({ label, name, type = "text", autoComplete, form, change }) { return <label className="mt-4 block text-sm font-medium text-stone-700 dark:text-stone-300">{label}<input className={fieldClass} required name={name} type={type} autoComplete={autoComplete} value={form[name]} onChange={change} /></label>; }
function OrderSummary({ items, subtotal, shipping, total }) { return <aside className="h-fit rounded-3xl bg-white p-6 shadow-sm dark:bg-stone-900 sm:p-7"><h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">Order summary</h2><div className="mt-5 space-y-4">{items.map(item => <div key={item.id} className="flex justify-between gap-3 text-sm"><span className="text-stone-600 dark:text-stone-300">{item.name} <span className="text-stone-400">× {item.quantity}</span></span><span className="font-medium text-stone-900 dark:text-stone-100">₵{(item.unitPrice * item.quantity).toFixed(2)}</span></div>)}</div><div className="mt-6 space-y-3 border-t border-stone-200 pt-5 text-sm dark:border-stone-700"><div className="flex justify-between text-stone-600 dark:text-stone-300"><span>Subtotal</span><span>₵{subtotal.toFixed(2)}</span></div><div className="flex justify-between text-stone-600 dark:text-stone-300"><span>Delivery</span><span>₵{shipping.toFixed(2)}</span></div><div className="flex justify-between pt-2 text-base font-semibold text-stone-900 dark:text-stone-100"><span>Total</span><span>₵{total.toFixed(2)}</span></div></div><p className="mt-6 flex gap-2 text-xs text-stone-500 dark:text-stone-400"><CheckCircle2 size={15} className="shrink-0 text-green-600" /> Your payment details are never stored in DorisWare.</p></aside>; }
