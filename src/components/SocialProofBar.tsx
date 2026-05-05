import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { apiRequest, ENDPOINTS } from "@/lib/api";

interface Client {
  _id: string;
  name: string;
  logoUrl: string;
  websiteUrl: string;
}

const SocialProofBar = () => {
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const { data } = await apiRequest<{ clients: Client[] }>(ENDPOINTS.CLIENTS_LIST);
        if (data?.clients && data.clients.length > 0) {
          setClients(data.clients);
        } else {
          // Fallback if no clients are returned from API
          setClients([
            { _id: "1", name: "Google", logoUrl: "", websiteUrl: "" },
            { _id: "2", name: "Microsoft", logoUrl: "", websiteUrl: "" },
            { _id: "3", name: "AWS", logoUrl: "", websiteUrl: "" },
            { _id: "4", name: "Meta", logoUrl: "", websiteUrl: "" },
            { _id: "5", name: "Tesla", logoUrl: "", websiteUrl: "" },
          ]);
        }
      } catch (err) {
        console.error("Failed to fetch clients", err);
      }
    };
    fetchClients();
  }, []);

  return (
    <section className="border-y border-border/50 bg-card/30 backdrop-blur-sm py-10 overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.p
          className="text-center text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/60 mb-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Trusted by Leading Companies
        </motion.p>
      </div>
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />
        <div className="flex animate-marquee gap-24 whitespace-nowrap">
          {[...clients, ...clients, ...clients, ...clients].map((client, i) => {
            const content = client.logoUrl ? (
              <img src={client.logoUrl} alt={client.name} className="h-8 max-w-[120px] object-contain opacity-50 hover:opacity-100 transition-opacity duration-300" />
            ) : (
              <span className="text-xl font-display font-bold text-muted-foreground/15 hover:text-primary/30 transition-colors duration-500 cursor-default select-none">
                {client.name}
              </span>
            );

            return client.websiteUrl ? (
              <a href={client.websiteUrl} target="_blank" rel="noopener noreferrer" key={i}>
                {content}
              </a>
            ) : (
              <div key={i}>{content}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SocialProofBar;
