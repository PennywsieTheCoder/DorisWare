import {
  ShieldCheck,
  Truck,
  Package,
  CreditCard,
} from "lucide-react";

export default function WhyChooseUs() {
  const features = [
    {
      icon: ShieldCheck,
      title: "Quality Guaranteed",
      description:
        "Carefully selected kitchenware built to last.",
    },
    {
      icon: Truck,
      title: "Fast Delivery",
      description:
        "Quick and reliable shipping on every order.",
    },
    {
      icon: Package,
      title: "Premium Products",
      description:
        "Trusted brands and durable materials.",
    },
    {
      icon: CreditCard,
      title: "Secure Payments",
      description:
        "Safe and encrypted checkout experience.",
    },
  ];

  return (
    <section className="bg-stone-50 py-14 dark:bg-stone-900 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-8 text-center">
          <p className="font-mono text-xs uppercase tracking-[3px] text-amber-600">
            Why Choose DorisWare
          </p>

          <h2 className="mt-2 font-serif text-3xl font-semibold text-stone-800 dark:text-stone-100 md:text-4xl">
            Designed For Everyday Cooking
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:bg-stone-800 dark:shadow-black/20"
            >
              <feature.icon
                size={36}
                className="text-amber-500"
              />

              <h3 className="mt-4 text-lg font-semibold text-stone-900 dark:text-stone-100">
                {feature.title}
              </h3>

              <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
