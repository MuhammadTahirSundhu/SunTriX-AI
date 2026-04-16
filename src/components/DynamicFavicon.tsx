import { useEffect } from "react";
import { useMedia } from "@/hooks/use-media";

export const DynamicFavicon = () => {
  const logoUrl = useMedia("suntrix-logo");

  useEffect(() => {
    if (!logoUrl) return;

    let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
    
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }

    link.type = 'image/png';
    link.href = logoUrl;
  }, [logoUrl]);

  return null;
};
