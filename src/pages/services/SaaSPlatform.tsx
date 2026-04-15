import { Layers } from "lucide-react";
import ServicePageTemplate from "@/components/ServicePageTemplate";

const SaaSPlatform = () => (
  <ServicePageTemplate
    icon={Layers}
    category="SaaS Platform"
    title="AI Product / SaaS Platform"
    subtitle="End-to-end platform development — from concept to scale."
    description="We design and build production-grade SaaS platforms with embedded AI capabilities. Multi-tenant architecture, API-first design, scalable infrastructure, and continuous monitoring — all engineered for growth."
    useCases={[
      { title: "Multi-tenant Architecture", desc: "Secure, isolated environments for each customer with shared infrastructure." },
      { title: "API-first Design", desc: "RESTful and GraphQL APIs designed for extensibility and third-party integration." },
      { title: "AI Feature Integration", desc: "Embed ML models, NLP, and intelligent automation into your platform." },
      { title: "Monitoring & Observability", desc: "Prometheus, Grafana, and custom dashboards for real-time insights." },
      { title: "Scalable Infrastructure", desc: "Kubernetes-orchestrated microservices that scale with your user base." },
      { title: "Payment & Billing", desc: "Stripe integration, subscription management, and usage-based billing." },
    ]}
    process={[
      { step: "01", title: "Discovery", desc: "Understand your market, users, and requirements." },
      { step: "02", title: "Architecture", desc: "Design the platform architecture and tech stack." },
      { step: "03", title: "Build & Launch", desc: "Agile development with continuous delivery." },
      { step: "04", title: "Scale & Maintain", desc: "24/7 monitoring, SLA tiers, and sprint retainers." },
    ]}
    techStack={["Next.js", "Node.js", "React", "TypeScript", "PostgreSQL", "MongoDB", "Docker", "Kubernetes", "AWS", "Stripe", "Redis"]}
    caseStudy={{
      title: "AI-Powered Analytics SaaS Platform",
      metric: "$2M Revenue Generated",
      desc: "Built a full-stack analytics platform from zero to 5,000 users in 6 months, with embedded ML models for predictive insights and automated reporting.",
    }}
  />
);

export default SaaSPlatform;
