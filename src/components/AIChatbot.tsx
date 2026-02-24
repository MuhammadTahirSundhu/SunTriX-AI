import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Trash2, Bot, User } from "lucide-react";
import { chatStore, type ChatMessage } from "@/lib/store";

const PRESET_RESPONSES: Record<string, string> = {
  hello: "Hello! 👋 I'm the SunTriX AI assistant. I can help you with questions about our services — Agentic AI, Computer Vision, AI/ML, and SaaS Platform development. How can I help?",
  services: "We offer 4 core services:\n\n🤖 **Agentic AI & Automation** — Autonomous agents & workflow automation\n🧠 **AI & Machine Learning** — Custom models & predictive analytics\n👁️ **Computer Vision** — Object detection & real-time video analytics\n🏗️ **AI Product / SaaS** — End-to-end platform development\n\nWould you like to learn more about any of these?",
  pricing: "Our pricing depends on the scope and complexity of your project. We offer:\n\n• **Sprint Retainers** — Starting at $5K/month\n• **Fixed-Price Projects** — Custom quoted\n• **Dedicated Teams** — Monthly engagement\n\nRequest a custom task for a free 24-hour proposal!",
  contact: "You can reach us at:\n\n📧 hello@suntrix.com\n📞 Schedule a call on our Contact page\n\nOr simply submit a Request a Task form and we'll respond within 24 hours!",
};

function getAIResponse(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) return PRESET_RESPONSES.hello;
  if (lower.includes("service") || lower.includes("offer") || lower.includes("what do you")) return PRESET_RESPONSES.services;
  if (lower.includes("price") || lower.includes("cost") || lower.includes("budget")) return PRESET_RESPONSES.pricing;
  if (lower.includes("contact") || lower.includes("reach") || lower.includes("email")) return PRESET_RESPONSES.contact;
  if (lower.includes("agentic") || lower.includes("agent")) return "Our **Agentic AI** team builds autonomous agents that reason, plan, and execute tasks. From multi-agent orchestration to LangChain-powered workflows — we handle the full lifecycle. Visit /services/agentic-ai for details!";
  if (lower.includes("vision") || lower.includes("detect") || lower.includes("image")) return "Our **Computer Vision** team specializes in object detection (YOLO), image classification, real-time video analytics, and OCR. We deploy edge-optimized models for production. Check /services/computer-vision!";
  if (lower.includes("saas") || lower.includes("platform") || lower.includes("product")) return "We build **production-grade SaaS platforms** with embedded AI capabilities — multi-tenant architecture, API-first design, Stripe billing, and Kubernetes orchestration. See /services/saas-platform!";
  if (lower.includes("ml") || lower.includes("machine learning") || lower.includes("model")) return "Our **AI/ML** team delivers custom models, NLP systems, recommendation engines, and full MLOps pipelines. We use PyTorch, TensorFlow, and scikit-learn. Visit /services/ai-ml!";
  return "Thanks for your message! I can help with questions about our AI services, pricing, process, and technology stack. For a personalized response, try asking about our **services**, **pricing**, or **how we work**. 🚀";
}

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(chatStore.getHistory());
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = chatStore.addMessage("user", input.trim());
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate API delay — replace with apiRequest(ENDPOINTS.CHAT_SEND, { method: "POST", body: { message: input } })
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 1200));

    const response = getAIResponse(input.trim());
    const aiMsg = chatStore.addMessage("assistant", response);
    setMessages((prev) => [...prev, aiMsg]);
    setIsTyping(false);
  };

  const clearChat = () => {
    chatStore.clear();
    setMessages([]);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full gradient-bg flex items-center justify-center shadow-lg glow-orange ${isOpen ? "hidden" : ""}`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{ boxShadow: ["0 0 20px hsl(24 100% 50% / 0.3)", "0 0 40px hsl(24 100% 50% / 0.5)", "0 0 20px hsl(24 100% 50% / 0.3)"] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <MessageCircle className="h-6 w-6 text-primary-foreground" />
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-h-[600px] rounded-2xl border border-border bg-card shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="gradient-bg px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary-foreground" />
                <div>
                  <p className="text-sm font-bold text-primary-foreground">SunTriX AI</p>
                  <p className="text-xs text-primary-foreground/70">Ask about our services</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={clearChat} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                  <Trash2 className="h-4 w-4 text-primary-foreground/70" />
                </button>
                <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                  <X className="h-4 w-4 text-primary-foreground" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[420px]">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <Bot className="h-12 w-12 text-primary/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Hi! I'm the SunTriX AI assistant.</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Ask me anything about our services.</p>
                  <div className="flex flex-wrap gap-2 justify-center mt-4">
                    {["What services do you offer?", "Tell me about pricing", "How can I contact you?"].map((q) => (
                      <button
                        key={q}
                        onClick={() => { setInput(q); }}
                        className="text-xs rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-primary hover:bg-primary/10 transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-primary/20" : "gradient-bg"}`}>
                    {msg.role === "user" ? <User className="h-3.5 w-3.5 text-primary" /> : <Bot className="h-3.5 w-3.5 text-primary-foreground" />}
                  </div>
                  <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${msg.role === "user" ? "bg-primary/10 text-foreground" : "bg-muted text-foreground"}`}>
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-2">
                  <div className="h-7 w-7 rounded-full gradient-bg flex items-center justify-center shrink-0">
                    <Bot className="h-3.5 w-3.5 text-primary-foreground" />
                  </div>
                  <div className="bg-muted rounded-xl px-4 py-3">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-border p-3">
              <form
                onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                className="flex gap-2"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about our AI services..."
                  className="flex-1 rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="gradient-bg rounded-lg p-2 text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatbot;
