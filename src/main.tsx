import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import { I18nProvider } from "./lib/i18n";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <I18nProvider>
      <App />
    </I18nProvider>
  </ThemeProvider>
);
