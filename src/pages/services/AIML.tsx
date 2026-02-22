import { Brain } from "lucide-react";
import ServicePageTemplate from "@/components/ServicePageTemplate";

const AIML = () => (
  <ServicePageTemplate
    icon={Brain}
    title="AI & Machine Learning"
    subtitle="Custom models, predictive analytics, and full MLOps lifecycle management."
    description="From data strategy to production deployment, we build ML solutions that deliver measurable business impact. Our team specializes in NLP, predictive analytics, recommendation systems, and end-to-end MLOps pipelines."
    useCases={[
      { title: "Predictive Analytics", desc: "Forecast trends, demand, and outcomes with custom models." },
      { title: "NLP & LLMs", desc: "Natural language processing, text analysis, and large language model fine-tuning." },
      { title: "Recommendation Systems", desc: "Personalized recommendations that drive engagement and revenue." },
      { title: "MLOps & Model Lifecycle", desc: "End-to-end pipelines for training, validation, deployment, and monitoring." },
      { title: "Custom Model Training", desc: "Bespoke models trained on your data for maximum accuracy." },
      { title: "Data Engineering", desc: "Feature engineering, data pipelines, and data quality management." },
    ]}
    process={[
      { step: "01", title: "Data Audit", desc: "Assess data quality, availability, and readiness." },
      { step: "02", title: "Model Design", desc: "Select algorithms and architecture for the problem." },
      { step: "03", title: "Train & Validate", desc: "Iterative training with rigorous validation." },
      { step: "04", title: "Deploy & Monitor", desc: "Production deployment with continuous monitoring." },
    ]}
    techStack={["TensorFlow", "PyTorch", "Scikit-learn", "HuggingFace", "MLflow", "Weights & Biases", "Python", "AWS SageMaker"]}
    caseStudy={{
      title: "Predictive Maintenance for Manufacturing",
      metric: "97.3% Prediction Accuracy",
      desc: "Developed a predictive maintenance ML model that reduced unplanned downtime by 60% and saved $2M annually in maintenance costs.",
    }}
  />
);

export default AIML;
