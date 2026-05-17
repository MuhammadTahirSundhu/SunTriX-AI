import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest, ENDPOINTS } from "../lib/api";
import { useSEO } from "../hooks/useSEO";
import Layout from "../components/Layout";
import {
  Check,
  Star,
  Zap,
  ArrowRight,
  MessageSquare,
  Shield,
  Clock,
  Users,
} from "lucide-react";

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

const trustBadges = [
  { icon: Shield, label: "100% Satisfaction Guarantee" },
  { icon: Clock, label: "24h Response Time" },
  { icon: Users, label: "Dedicated Project Manager" },
];

const Pricing = () => {
  useSEO({
    title: "Pricing — SunTriX AI Solutions",
    description:
      "Transparent, flexible pricing for AI automation, machine learning, and custom software development services. Get a custom quote tailored to your project.",
    canonicalUrl: "https://www.suntrix.ai/pricing",
  });

  const navigate = useNavigate();
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  const handleGetQuote = (plan: PricingPlan) => {
    if (plan.price === 0) {
      navigate("/contact");
      return;
    }
    // Standard flow: direct to Request Task with plan pre-selected
    navigate(`/request-task?plan=${encodeURIComponent(plan.name)}&budget=${plan.price}`);
  };

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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-14"
          >
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-widest mb-4 bg-primary/10 px-3 py-1.5 rounded-full">
              <Zap className="h-3 w-3" /> Transparent Pricing
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mb-6">
              Plans that <span className="gradient-text">Scale</span> with You
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
              Every project starts with a conversation. Select the plan that fits your needs —
              we'll scope the work, send a proposal, and only then process payment.
            </p>

            {/* How it works banner */}
            <div className="inline-flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground bg-card border border-border rounded-xl px-5 py-3 mb-8">
              <span className="text-primary font-semibold">How it works:</span>
              <span>1. Select a plan</span>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
              <span>2. Submit your brief</span>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
              <span>3. We send a proposal</span>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
              <span>4. Pay only after approval</span>
            </div>

            {/* Billing Toggle */}
            {plans.some((p) => p.billingPeriod === "monthly") &&
              plans.some((p) => p.billingPeriod === "yearly") && (
                <div className="inline-flex items-center bg-card border border-border rounded-xl p-1.5">
                  <button
                    onClick={() => setBilling("monthly")}
                    className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                      billing === "monthly"
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBilling("yearly")}
                    className={`px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                      billing === "yearly"
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Yearly
                    <span className="text-[10px] font-bold bg-emerald-500 text-white px-1.5 py-0.5 rounded-full">
                      -20%
                    </span>
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
              <p className="text-lg font-medium mb-4">Custom Pricing Available</p>
              <p className="text-sm mb-8">
                We build tailored AI solutions. Get in touch for a custom quote.
              </p>
              <Link
                to="/request-task"
                className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity inline-flex items-center gap-2"
              >
                Request a Quote <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div
              className={`grid gap-8 ${
                displayedPlans.length === 1
                  ? "max-w-sm mx-auto"
                  : displayedPlans.length === 2
                  ? "md:grid-cols-2 max-w-3xl mx-auto"
                  : "md:grid-cols-2 lg:grid-cols-3"
              }`}
            >
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
                    <h3 className="text-2xl font-display font-bold text-foreground mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-6">{plan.description}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs text-muted-foreground mr-1">Starting from</span>
                      <span className="text-4xl font-display font-extrabold text-foreground">
                        {plan.currency === "PKR"
                          ? "₨"
                          : plan.currency === "EUR"
                          ? "€"
                          : plan.currency === "GBP"
                          ? "£"
                          : "$"}
                        {plan.price.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground">{billingLabel[plan.billingPeriod]}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Final price set after project scoping
                    </p>
                  </div>

                  <ul className="space-y-3 flex-1 mb-8">
                    {plan.features.map((f, fi) => (
                      <li key={fi} className="flex items-start gap-3 text-sm">
                        <div
                          className={`mt-0.5 h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${
                            plan.isPopular ? "bg-primary" : "bg-primary/15"
                          }`}
                        >
                          <Check
                            className={`h-3 w-3 ${plan.isPopular ? "text-white" : "text-primary"}`}
                          />
                        </div>
                        <span className="text-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleGetQuote(plan)}
                    className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold text-sm transition-all ${
                      plan.isPopular
                        ? "bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20"
                        : "bg-muted border border-border text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary"
                    }`}
                  >
                    {plan.price === 0
                      ? "Contact Us"
                      : plan.ctaLabel || "Get a Free Quote"}
                    <MessageSquare className="h-4 w-4" />
                  </button>
                  <p className="text-center text-[10px] text-muted-foreground mt-2">
                    No payment required to get a quote
                  </p>
                </motion.div>
              ))}
            </div>
          )}

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mt-16 flex flex-wrap items-center justify-center gap-6"
          >
            {trustBadges.map((b) => (
              <div key={b.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                <b.icon className="h-4 w-4 text-primary" />
                <span>{b.label}</span>
              </div>
            ))}
          </motion.div>

          {/* Process Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-20 bg-card border border-border rounded-2xl p-8 md:p-12"
          >
            <h2 className="text-2xl font-display font-bold text-foreground text-center mb-10">
              Our Payment Process
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  step: "01",
                  title: "Submit Brief",
                  desc: "Fill out your project requirements. Takes 3 minutes.",
                },
                {
                  step: "02",
                  title: "We Review",
                  desc: "Our team reviews your brief and prepares a detailed proposal within 24 hours.",
                },
                {
                  step: "03",
                  title: "Receive Proposal",
                  desc: "You receive a scoped proposal with a clear price, timeline, and deliverables.",
                },
                {
                  step: "04",
                  title: "Pay & Start",
                  desc: "Once you approve the proposal, pay securely via Stripe. Work begins immediately.",
                },
              ].map((s) => (
                <div key={s.step} className="text-center">
                  <div className="text-3xl font-mono font-extrabold gradient-text mb-3">{s.step}</div>
                  <h3 className="font-bold text-foreground mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-16 text-center"
          >
            <div className="inline-block bg-card border border-border rounded-2xl px-10 py-8">
              <h2 className="text-2xl font-display font-bold text-foreground mb-3">
                Need a custom enterprise plan?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md">
                We build tailored AI solutions for enterprises and agencies.
                Let's talk about your specific requirements.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity text-sm"
              >
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
