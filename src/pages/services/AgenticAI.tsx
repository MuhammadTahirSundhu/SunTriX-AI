import { Bot } from "lucide-react";
import ServicePageTemplate from "@/components/ServicePageTemplate";

const AgenticAI = () => (
  <ServicePageTemplate
    icon={Bot}
    title="Agentic AI & Automation"
    subtitle="Deploy autonomous agents that reason, plan, and execute complex tasks."
    description="Our Agentic AI solutions go beyond simple automation. We build intelligent agents that understand context, make decisions, and orchestrate multi-step workflows — from customer support to enterprise-grade data pipelines."
    useCases={[
      { title: "Customer Support Agents", desc: "AI agents that handle queries, escalate intelligently, and learn from interactions." },
      { title: "Workflow Automation", desc: "End-to-end process automation with decision-making capabilities." },
      { title: "Intelligent Pipelines", desc: "Data processing pipelines that adapt to changing inputs and requirements." },
      { title: "Document Processing", desc: "Extract, classify, and route documents with high accuracy." },
      { title: "API Orchestration", desc: "Coordinate multiple APIs and services through intelligent agents." },
      { title: "Multi-Agent Systems", desc: "Complex systems where multiple agents collaborate to solve problems." },
    ]}
    process={[
      { step: "01", title: "Define Goal", desc: "Understand the objective and success criteria for the agent." },
      { step: "02", title: "Design Agent", desc: "Architecture the agent's reasoning, tools, and memory." },
      { step: "03", title: "Train & Integrate", desc: "Build, test, and connect to your existing systems." },
      { step: "04", title: "Monitor", desc: "Continuous monitoring, optimization, and improvement." },
    ]}
    techStack={["LangChain", "AutoGen", "OpenAI", "Python", "FastAPI", "MongoDB", "Redis", "Docker", "Kubernetes"]}
    caseStudy={{
      title: "Enterprise Document Processing Pipeline",
      metric: "10x Faster Processing",
      desc: "Built an autonomous document processing system for a Fortune 500 company that reduced manual review time by 90% and improved accuracy to 98.5%.",
    }}
  />
);

export default AgenticAI;
