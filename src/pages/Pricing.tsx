import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { apiRequest, ENDPOINTS } from "../lib/api";
import { useSEO } from "../hooks/useSEO";
import Layout from "../components/Layout";
import { Check, Star, Zap, ArrowRight } from "lucide-react";

interface PricingPlan {
  _id: string;
  name: string;
  price: number;
  currency: string;
  billingPeriod: "monthly" | "yearly" | "one-time";
  description: string;
  features: string[];
  isPopular: boolean;
  isVisible: boolean;
  ctaLabel: string;
  ctaLink: string;
}

const Pricing = () => {
  useSEO({
    title: "Pricing — SunTriX AI Solutions",
    description: "Transparent, flexible pricing for AI automation, machine learning, and custom software development services. Choose the plan that fits your business.",
    canonicalUrl: "https://www.suntrix.ai/pricing",
  });

  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  useEffect(() => {
    const fetch_ = async () => {
      setLoading(true);
      const { data } = await apiRequest<{ plans: PricingPlan[] }>(ENDPOINTS.PRICING_LIST);
      if (data?.plans) setPlans(data.plans.filter((p) => p.isVisible));
      setLoading(false);
    };
    fetch_();
  }, []);

  const billingLabel: Record<string, string> = {
    monthly: "/mo",
    yearly: "/yr",
    "one-time": " one-time",
  };

  const displayedPlans = plans.filter(
    (p) => p.billingPeriod === billing || p.billingPeriod === "one-time"
  );

  return (
    <Layout>
      <div className="min-h-screen bg-background pt-32 pb-24 px-6">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-widest mb-4 bg-primary/10 px-3 py-1.5 rounded-full">
              <Zap className="h-3 w-3" /> Simple Pricing
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mb-6">
              Plans that <span className="gradient-text">Scale</span> with You
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
              No hidden fees. No surprise bills. Pick the plan that fits your team and upgrade anytime.
            </p>

            {/* Billing Toggle */}
            {plans.some((p) => p.billingPeriod === "monthly") && plans.some((p) => p.billingPeriod === "yearly") && (
              <div className="inline-flex items-center bg-card border border-border rounded-xl p-1.5">
                <button
                  onClick={() => setBilling("monthly")}
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${billing === "monthly" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBilling("yearly")}
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${billing === "yearly" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Yearly
                  <span className="text-[10px] font-bold bg-emerald-500 text-white px-1.5 py-0.5 rounded-full">-20%</span>
                </button>
              </div>
            )}
          </motion.div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : displayedPlans.length === 0 ? (
            /* Fallback when no DB data */
            <div className="text-center py-24 text-muted-foreground">
              <p className="text-lg font-medium mb-4">Pricing coming soon</p>
              <p className="text-sm mb-8">Get in touch for custom quotes tailored to your needs.</p>
              <Link to="/contact" className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity inline-flex items-center gap-2">
                Contact Us <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className={`grid gap-8 ${displayedPlans.length === 1 ? "max-w-sm mx-auto" : displayedPlans.length === 2 ? "md:grid-cols-2 max-w-3xl mx-auto" : "md:grid-cols-2 lg:grid-cols-3"}`}>
              {displayedPlans.map((plan, i) => (
                <motion.div
                  key={plan._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={`relative flex flex-col rounded-2xl border p-8 ${
                    plan.isPopular
                      ? "border-primary bg-primary/5 shadow-xl shadow-primary/10"
                      : "border-border bg-card"
                  }`}
                >
                  {plan.isPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-primary text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                        <Star className="h-3 w-3 fill-current" /> Most Popular
                      </span>
                    </div>
                  )}

                  <div className="mb-8">
                    <h3 className="text-2xl font-display font-bold text-foreground mb-2">{plan.name}</h3>
                    <p className="text-muted-foreground text-sm mb-6">{plan.description}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-display font-extrabold text-foreground">
                        {plan.currency === "PKR" ? "₨" : plan.currency === "EUR" ? "€" : plan.currency === "GBP" ? "£" : "$"}
                        {plan.price.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground">{billingLabel[plan.billingPeriod]}</span>
                    </div>
                  </div>

                  <ul className="space-y-3 flex-1 mb-8">
                    {plan.features.map((f, fi) => (
                      <li key={fi} className="flex items-start gap-3 text-sm">
                        <div className={`mt-0.5 h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${plan.isPopular ? "bg-primary" : "bg-primary/15"}`}>
                          <Check className={`h-3 w-3 ${plan.isPopular ? "text-white" : "text-primary"}`} />
                        </div>
                        <span className="text-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    to={plan.ctaLink || "/contact"}
                    className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold text-sm transition-all ${
                      plan.isPopular
                        ? "bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20"
                        : "bg-muted border border-border text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary"
                    }`}
                  >
                    {plan.ctaLabel || "Get Started"} <ArrowRight className="h-4 w-4" />
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          {/* Bottom CTA */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-20 text-center">
            <div className="inline-block bg-card border border-border rounded-2xl px-10 py-8">
              <h2 className="text-2xl font-display font-bold text-foreground mb-3">Need a custom plan?</h2>
              <p className="text-muted-foreground mb-6 max-w-md">We build tailored AI solutions for enterprises. Let's talk about your specific requirements.</p>
              <Link to="/contact" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity text-sm">
                Talk to Sales <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Pricing;
