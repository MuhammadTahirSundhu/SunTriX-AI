import { Eye } from "lucide-react";
import ServicePageTemplate from "@/components/ServicePageTemplate";

const ComputerVision = () => (
  <ServicePageTemplate
    icon={Eye}
    category="Computer Vision"
    title="Computer Vision"
    subtitle="Object detection, image classification, and real-time video analytics."
    description="We build computer vision systems that see, understand, and act. From quality inspection on manufacturing lines to real-time video surveillance, our solutions leverage state-of-the-art models optimized for production workloads."
    useCases={[
      { title: "Object Detection", desc: "Identify and locate objects in images and video streams with high precision." },
      { title: "Image Classification", desc: "Categorize images with custom-trained models for your domain." },
      { title: "Video Analytics", desc: "Real-time analysis of video feeds for security, retail, and industrial use." },
      { title: "OCR & Document AI", desc: "Extract text and structure from documents, receipts, and forms." },
      { title: "Anomaly Detection", desc: "Detect defects, irregularities, and outliers in visual data." },
      { title: "Real-time Inference", desc: "Edge-optimized models for low-latency, high-throughput processing." },
    ]}
    process={[
      { step: "01", title: "Data Collection", desc: "Gather and annotate training data for your use case." },
      { step: "02", title: "Model Selection", desc: "Choose the right architecture (YOLO, ResNet, etc.)." },
      { step: "03", title: "Training & Tuning", desc: "Fine-tune models on your data for maximum accuracy." },
      { step: "04", title: "Edge Deployment", desc: "Deploy optimized models for real-time inference." },
    ]}
    techStack={["OpenCV", "YOLO", "PyTorch", "TensorFlow Lite", "ONNX", "Triton Inference", "NVIDIA CUDA", "Python"]}
    caseStudy={{
      title: "Quality Inspection for Electronics Manufacturing",
      metric: "94% Accuracy Improvement",
      desc: "Built an automated quality inspection system that detects micro-defects on PCBs with 99.2% accuracy, replacing manual inspection and reducing costs by 70%.",
    }}
  />
);

export default ComputerVision;
