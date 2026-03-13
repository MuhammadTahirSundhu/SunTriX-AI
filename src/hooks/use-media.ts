import { useState, useEffect, useCallback } from "react";
import { mediaStore } from "@/lib/cms-store";

// Static asset imports as fallbacks
import heroBanner from "@/assets/hero-banner.png";
import suntrixLogo from "@/assets/suntrix-logo.png";
import ceoPortrait from "@/assets/ceo-portrait.png";
import aboutHero from "@/assets/about-hero.png";
import servicesHero from "@/assets/services-hero.png";
import workflowHero from "@/assets/workflow-hero.png";
import workflowPipeline from "@/assets/workflow-pipeline.png";
import videoDemoThumb from "@/assets/video-demo-thumb.png";
import deptAgents from "@/assets/dept-agents.png";
import deptIntelligence from "@/assets/dept-intelligence.png";
import deptVision from "@/assets/dept-vision.png";
import deptPlatform from "@/assets/dept-platform.png";
import portfolioAgents from "@/assets/portfolio-agents.png";
import portfolioMl from "@/assets/portfolio-ml.png";
import portfolioVision from "@/assets/portfolio-vision.png";
import portfolioSaas from "@/assets/portfolio-saas.png";
import portfolioSupport from "@/assets/portfolio-support.png";
import portfolioSurveillance from "@/assets/portfolio-surveillance.png";

const FALLBACKS: Record<string, string> = {
  "hero-banner": heroBanner,
  "suntrix-logo": suntrixLogo,
  "ceo-portrait": ceoPortrait,
  "about-hero": aboutHero,
  "services-hero": servicesHero,
  "workflow-hero": workflowHero,
  "workflow-pipeline": workflowPipeline,
  "video-demo-thumb": videoDemoThumb,
  "dept-agents": deptAgents,
  "dept-intelligence": deptIntelligence,
  "dept-vision": deptVision,
  "dept-platform": deptPlatform,
  "portfolio-agents": portfolioAgents,
  "portfolio-ml": portfolioMl,
  "portfolio-vision": portfolioVision,
  "portfolio-saas": portfolioSaas,
  "portfolio-support": portfolioSupport,
  "portfolio-surveillance": portfolioSurveillance,
};

export function useMedia(key: string): string {
  const resolve = useCallback(() => {
    const storeUrl = mediaStore.get(key);
    return storeUrl || FALLBACKS[key] || "";
  }, [key]);

  const [url, setUrl] = useState(resolve);

  useEffect(() => {
    setUrl(resolve());
    return mediaStore.subscribe(() => setUrl(resolve()));
  }, [resolve]);

  return url;
}

export function getMediaFallback(key: string): string {
  return FALLBACKS[key] || "";
}
