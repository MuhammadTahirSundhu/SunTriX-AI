import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiRequest, ENDPOINTS } from "@/lib/api";
import ServicePageTemplate from "@/components/ServicePageTemplate";
import * as LucideIcons from "lucide-react";
import { Sparkles } from "lucide-react";

interface Department {
  _id: string;
  name: string;
  subtitle: string;
  description: string;
  image: string;
  href: string;
  capabilities: string[];
  icon: string;
  useCases: { title: string; desc: string }[];
  process: { step: string; title: string; desc: string }[];
  techStack: string[];
  caseStudy?: { title: string; metric: string; desc: string };
}

const DynamicService = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [department, setDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiRequest<Department[]>(ENDPOINTS.DEPARTMENTS_LIST).then(({ data }) => {
      if (data) {
        const found = data.find(
          (d) =>
            d.href === `/services/${slug}` ||
            d.href === `services/${slug}` ||
            d.href.endsWith(`/${slug}`)
        );
        if (found) {
          setDepartment(found);
        } else {
          // If not found, perhaps redirect to services overview or 404
          navigate("/services");
        }
      }
      setLoading(false);
    });
  }, [slug, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-24 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Sparkles className="h-8 w-8 text-primary animate-pulse" />
          <p className="text-muted-foreground font-mono uppercase tracking-widest text-xs">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!department) return null;

  // Dynamically resolve icon from string
  const IconComponent = (LucideIcons as any)[department.icon || "Layers"] || LucideIcons.Layers;

  return (
    <ServicePageTemplate
      icon={IconComponent}
      category="Service"
      title={department.name}
      subtitle={department.subtitle}
      description={department.description}
      image={department.image}
      useCases={department.useCases && department.useCases.length > 0 ? department.useCases : undefined}
      process={department.process && department.process.length > 0 ? department.process : undefined}
      techStack={department.techStack && department.techStack.length > 0 ? department.techStack : undefined}
      caseStudy={
        department.caseStudy && department.caseStudy.title
          ? department.caseStudy
          : undefined
      }
    />
  );
};

export default DynamicService;
