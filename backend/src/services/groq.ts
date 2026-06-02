import Groq from "groq-sdk";
import { getSetting } from "../lib/configLoader";

// ─── Lazy client factory ────────────────────────────────────────────────────
// Creates a new Groq instance reading the CURRENT api key each call.
// This means the admin can rotate the key and it takes effect immediately.
function getGroqClient(): Groq {
  const apiKey = getSetting("GROQ_API_KEY");
  if (!apiKey) throw new Error("GROQ_API_KEY is not configured. Set it in Admin → Settings → AI.");
  return new Groq({ apiKey });
}

// ─── Dynamic model + param helpers ────────────────────────────────────────
const getChatModel     = () => getSetting("GROQ_CHAT_MODEL",     "llama-3.3-70b-versatile");
const getExtractModel  = () => getSetting("GROQ_EXTRACT_MODEL",  "llama-3.1-8b-instant");
const getChatTemp      = () => parseFloat(getSetting("GROQ_CHAT_TEMPERATURE",    "0.7"));
const getChatTokens    = () => parseInt(getSetting("GROQ_CHAT_MAX_TOKENS",       "1024"));
const getEmailTemp     = () => parseFloat(getSetting("GROQ_EMAIL_TEMPERATURE",   "0.4"));
const getEmailTokens   = () => parseInt(getSetting("GROQ_EMAIL_MAX_TOKENS",      "2048"));

// ─── Dynamic system prompt ─────────────────────────────────────────────────
// Admin can either supply a full custom prompt via CHATBOT_SYSTEM_PROMPT,
// or let the system auto-build one from brand settings.
function buildSystemPrompt(): string {
  const custom = getSetting("CHATBOT_SYSTEM_PROMPT");
  if (custom && custom.trim().length > 50) return custom.trim();

  const name          = getSetting("BRAND_NAME",             "SunTriX AI Solutions");
  const email         = getSetting("BRAND_EMAIL",            "hello@suntrix.com");
  const chatbotName   = getSetting("CHATBOT_NAME",           "SunTriX AI");
  const maxWords      = getSetting("CHATBOT_MAX_WORDS",       "300");
  const responseTime  = getSetting("BRAND_RESPONSE_TIME",    "24 hours");
  const hasGuarantee  = getSetting("BRAND_PROPOSAL_GUARANTEE", "true") === "true";
  const pricingLink   = getSetting("CHATBOT_PRICING_LINK",   "/request-task");
  const portfolioLink = getSetting("CHATBOT_PORTFOLIO_LINK", "/work");
  const contactLink   = getSetting("CHATBOT_CONTACT_LINK",   "/contact");

  return `You are the ${chatbotName} — a knowledgeable, professional, and helpful representative of ${name}, a premium AI engineering agency.

About ${name}:
- We are an AI engineering agency that builds Agentic AI, Computer Vision, AI/ML, and SaaS platforms
- We serve Fortune 500 companies, startups, and enterprises
- Our core services: Agentic AI & Automation, AI & Machine Learning, Computer Vision, AI Product/SaaS Development
${hasGuarantee ? `- We have a ${responseTime} proposal guarantee and respond to all project briefs within ${responseTime}` : ""}
- We've delivered 50+ projects with measurable business impact

When responding:
- Be professional, concise, and helpful
- If asked about pricing, mention that it depends on scope and suggest submitting a task request at ${pricingLink}
- If asked about services, describe our four service areas
- If asked about portfolio or case studies, direct to ${portfolioLink}
- If asked to contact us, mention ${email} or ${contactLink}
- Always encourage users to submit a task brief for a free ${responseTime} proposal
- Keep responses under ${maxWords} words unless more detail is genuinely needed`;
}

// ─── Public types ──────────────────────────────────────────────────────────
export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

// ─── Chat ──────────────────────────────────────────────────────────────────
export async function sendChat(messages: ChatMessage[]): Promise<string> {
  if (getSetting("AI_ENABLED", "true") === "false") {
    return "AI features are currently disabled. Please contact us directly.";
  }

  const completion = await getGroqClient().chat.completions.create({
    model: getChatModel(),
    messages: [
      { role: "system", content: buildSystemPrompt() },
      ...messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    ],
    temperature: getChatTemp(),
    max_tokens:  getChatTokens(),
  });

  return completion.choices[0]?.message?.content || "I couldn't process that. Please try again.";
}

// ─── Email template generation ─────────────────────────────────────────────
export async function generateEmailTemplate(prompt: string): Promise<string> {
  if (getSetting("AI_ENABLED", "true") === "false") {
    throw new Error("AI features are currently disabled.");
  }

  const completion = await getGroqClient().chat.completions.create({
    model: getChatModel(),
    messages: [
      {
        role: "system",
        content:
          "You are an expert-level HTML email designer and front-end email engineer specializing in high-conversion, visually compelling, and modern newsletter designs.\n\nYour task is to generate advanced, production-ready, and visually attractive HTML email newsletter templates based on the user's request.\n\nOUTPUT RULES (STRICT):\n- Output ONLY raw HTML\n- Do NOT use markdown, code blocks, or backticks\n- Do NOT include explanations, comments, or conversational text (e.g., \"Here is your template\")\n- Do NOT wrap the output in any formatting\n- The response must be directly renderable as an email\n\nDESIGN REQUIREMENTS:\n- Must be fully responsive and mobile-friendly\n- Use inline CSS only (email-client compatible)\n- Follow modern email design best practices\n- Use table-based layout structure for maximum email client compatibility\n- Include proper spacing, padding, and hierarchy for readability\n- Support light and dark email client rendering variations\n- Ensure strong visual hierarchy (headline → subheadline → body → CTA)\n\nVISUAL & UX STANDARDS:\n- Create highly engaging, newsroom-style or marketing-grade layouts\n- Use modern typographic hierarchy (bold headlines, subtle subtext, structured sections)\n- Include optional elements where relevant:\n  - Hero section or banner header\n  - Breaking news badge or highlight labels\n  - Call-to-action buttons (when applicable)\n  - Section dividers for readability\n  - Card-style content blocks (email-safe implementation)\n- Ensure the design feels like a premium digital newspaper or modern SaaS newsletter\n\nCOMPATIBILITY REQUIREMENTS:\n- Must render correctly across major email clients (Gmail, Outlook, Apple Mail)\n- Avoid unsupported CSS (no flexbox or grid for layout structure)\n- Use fallback-safe fonts and colors\n\nFINAL OUTPUT RULE:\nReturn ONLY the final HTML email template with no additional text or formatting.",
      },
      {
        role: "user",
        content: `Create an email newsletter template for ${getSetting("BRAND_NAME", "SunTriX AI Agency")} based on this prompt: ${prompt}`,
      },
    ],
    temperature: getEmailTemp(),
    max_tokens:  getEmailTokens(),
  });

  let html = completion.choices[0]?.message?.content || "";
  if (html.startsWith("```html")) html = html.replace("```html", "");
  if (html.startsWith("```"))     html = html.replace("```", "");
  if (html.endsWith("```"))       html = html.slice(0, -3);

  return html.trim();
}

// ─── Module schemas for AI field extraction ────────────────────────────────
const MODULE_SCHEMAS: Record<string, { schema: string; example: string; maxTokens: number }> = {
  portfolio: {
    schema: `title (string), slug (string, URL-safe), category (one of: "Agentic AI"|"AI & ML"|"Computer Vision"|"SaaS Platform"), description (string, detailed), shortDescription (string, 1-2 sentences), metric (string, e.g. "10x"), metricLabel (string, e.g. "Faster Processing"), clientName (string), industry (string), tags (string[], tech stack), highlights (string[], key achievements), liveUrl (string, optional)`,
    example: `{"title":"Inventory Vision AI","slug":"inventory-vision-ai","category":"Computer Vision","description":"Full detailed description...","shortDescription":"AI-powered inventory system.","metric":"98%","metricLabel":"Detection Accuracy","clientName":"RetailCo","industry":"Retail","tags":["Python","AWS","OpenCV"],"highlights":["40% stockout reduction","Real-time alerts"],"liveUrl":""}`,
    maxTokens: 1024,
  },
  department: {
    schema: `name (string), subtitle (string, short tagline), description (string, 2 sentences), href (string, /services/slug), capabilities (string[], 5-6 items), icon (string, Lucide icon name e.g. "Bot","Brain","Eye","Cloud"), techStack (string[], 5-7 items)`,
    example: `{"name":"Agentic AI","subtitle":"Autonomous agents that work 24/7","description":"We build AI systems that orchestrate workflows autonomously. Our agents integrate with your tools to eliminate manual bottlenecks.","href":"/services/agentic-ai","capabilities":["Multi-agent orchestration","RAG knowledge retrieval","Tool & API integration","Workflow automation","Human-in-the-loop support"],"icon":"Bot","techStack":["LangChain","OpenAI GPT-4o","FastAPI","Redis","PostgreSQL"]}`,
    maxTokens: 600,
  },
  blog: {
    schema: `title (string), slug (string, URL-safe), excerpt (string, 1-2 sentences), content (string, HTML formatted article suitable for a rich text editor), category (string), tags (string[]), author (string), readTime (number, estimated minutes to read)`,
    example: `{"title":"How AI is Transforming Retail","slug":"ai-transforming-retail","excerpt":"AI is...","content":"<h1>How AI is Transforming Retail</h1><p>...</p>","category":"AI","tags":["AI","Retail"],"author":"SunTriX Team","readTime":5}`,
    maxTokens: 4096,
  },
  team: {
    schema: `name (string), role (string, job title), department (string), bio (string, 2-3 sentences professional bio), linkedin (string, URL or empty), twitter (string, URL or empty), github (string, URL or empty), website (string, URL or empty)`,
    example: `{"name":"Jane Smith","role":"Lead ML Engineer","department":"Engineering","bio":"Jane has 8 years experience in production ML systems.","linkedin":"https://linkedin.com/in/jane","twitter":"","github":"https://github.com/jane","website":""}`,
    maxTokens: 512,
  },
  pricing: {
    schema: `name (string, plan name), price (number), currency (string, e.g. "USD"), billingPeriod (one of: "monthly"|"yearly"|"one-time"), description (string, 1-2 sentences), features (string[], list of included features), ctaLabel (string, button text), ctaLink (string, URL)`,
    example: `{"name":"Starter","price":499,"currency":"USD","billingPeriod":"monthly","description":"Perfect for small teams.","features":["5 AI agents","Email support","10GB storage"],"ctaLabel":"Get Started","ctaLink":"/contact"}`,
    maxTokens: 512,
  },
  client: {
    schema: `name (string, company name), logoUrl (string, logo image URL if mentioned or empty string), websiteUrl (string, company website URL if mentioned or empty string)`,
    example: `{"name":"Acme Corp","logoUrl":"","websiteUrl":"https://acme.com"}`,
    maxTokens: 200,
  },
};

// ─── Helper: single structured JSON call ──────────────────────────────────
async function jsonCall(
  systemPrompt: string,
  userMessage: string,
  maxTokens: number,
  temperature = 0.1
): Promise<Record<string, unknown>> {
  const completion = await getGroqClient().chat.completions.create({
    model: getExtractModel(),
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user",   content: userMessage },
    ],
    temperature,
    max_tokens: maxTokens,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content?.trim() || "{}";
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return {};
  }
}

// ─── AI field extraction (all modules) ────────────────────────────────────
export async function extractFields(
  module: string,
  text: string
): Promise<Record<string, unknown>> {
  if (getSetting("AI_ENABLED", "true") === "false") {
    throw new Error("AI features are currently disabled.");
  }

  const moduleSchema = MODULE_SCHEMAS[module];
  if (!moduleSchema) throw new Error(`Unknown module: ${module}`);

  // ── Department: two focused calls ────────────────────────────────────────
  if (module === "department") {
    const basicFields = await jsonCall(
      `You are a JSON extraction assistant. Extract department info from the user's text and return a JSON object with these fields:
name, subtitle (short tagline), description (2 sentences), href (/services/url-slug), capabilities (array of 5-6 short strings), icon (Lucide icon name e.g. Bot/Brain/Eye/Cloud/Layers/Cpu), techStack (array of 5-7 tech names).
Use "" or [] for missing fields. Return ONLY valid JSON.
EXAMPLE: ${moduleSchema.example}`,
      text,
      600,
      0.1
    );

    const deptName = (basicFields.name as string) || "this department";
    const deptDesc = (basicFields.description as string) || text;
    const creativeFields = await jsonCall(
      `You are a creative AI content writer for a premium AI agency called ${getSetting("BRAND_NAME", "SunTriX")}.
Generate a JSON object with exactly these fields for the "${deptName}" department:

useCases: array of exactly 4 objects, each with "title" (3-5 words) and "desc" (1 sentence, ~15 words)
process: array of exactly 4 objects with "step" ("01"/"02"/"03"/"04"), "title" (3-4 words), "desc" (1 sentence, ~12 words)
caseStudy: object with "title" (6-8 words), "metric" (3-5 words, e.g. "68% faster resolution"), "desc" (2 sentences describing a measurable business result)

Base everything on this department description: "${deptDesc}"
Invent realistic, professional, specific content. Return ONLY valid JSON.`,
      `Generate use cases, process steps, and case study for the ${deptName} department.`,
      900,
      0.4
    );

    return { ...basicFields, ...creativeFields };
  }

  // ── Blog: no JSON mode — HTML content inside JSON breaks it ───────────────
  if (module === "blog") {
    const completion = await getGroqClient().chat.completions.create({
      model: getExtractModel(),
      messages: [
        {
          role: "system",
          content: `You are a data extraction AI. Extract blog post fields from the user's text and return valid JSON.
SCHEMA: ${moduleSchema.schema}
- Return ONLY a valid JSON object — no markdown wrappers, no code fences
- For the content field: generate a COMPLETE full-length HTML article. Do NOT truncate.
- Escape all special characters inside string values.
EXAMPLE: ${moduleSchema.example}`,
        },
        { role: "user", content: `Extract fields from:\n\n${text}` },
      ],
      temperature: 0.2,
      max_tokens: moduleSchema.maxTokens,
    });

    let raw = completion.choices[0]?.message?.content?.trim() || "{}";
    raw = raw.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return {};
    }
  }

  // ── All other modules: single JSON-mode call ───────────────────────────────
  return jsonCall(
    `You are a JSON extraction assistant. Extract fields from the user's text.
SCHEMA: ${moduleSchema.schema}
Use "" or [] for missing fields. Never use null. Keep values concise.
EXAMPLE: ${moduleSchema.example}`,
    `Extract fields from:\n\n${text}`,
    moduleSchema.maxTokens,
    0.1
  );
}

// ─── Proposal Draft (admin clicks "Generate with AI") ─────────────────────
export async function draftProposalWithAI(data: {
  projectTitle: string;
  description:  string;
  service:      string;
  budget:       string;
  techStack:    string;
  timeline:     string;
  selectedPlan: string;
  brandName:    string;
}): Promise<{
  title:        string;
  executiveSummary:          string;
  scopeOfWork:               string;
  deliverables:              string;
  timeline:                  string;
  milestones:   { title: string; description: string; amount: number; dueWeek: number }[];
  pricingBreakdown:          string;
  revisionsPolicy:           string;
  clientResponsibilities:    string;
  supportAndWarranty:        string;
  paymentTerms:              string;
  nextSteps:                 string;
}> {
  if (getSetting("AI_ENABLED", "true") === "false") {
    throw new Error("AI features are currently disabled.");
  }

  const planNote = data.selectedPlan ? `Client selected plan: "${data.selectedPlan}". Budget hint: ${data.budget}.` : `Client budget: ${data.budget || "not specified"}.`;

  const result = await jsonCall(
    `You are an elite, highly persuasive business proposal writer for ${data.brandName}, a premium AI engineering agency. Your goal is to write a highly attractive, "Upwork ideal proposal style" document that converts leads into clients.
Generate a structured project proposal as a JSON object with these exact fields:
- title: string (concise proposal title)
- executiveSummary: string (Client's problem, proposed solution, and expected outcome. ~150 words)
- scopeOfWork: string (What is included, what is excluded, and technical requirements. Use bullet points or paragraphs)
- deliverables: string (A bulleted list of exact deliverables like "Responsive Website", "Admin Dashboard", "Source Code")
- timeline: string (A breakdown of phases and duration, e.g. "Discovery: 2 Days, Development: 10 Days")
- milestones: array of objects, each with:
    - title: string (milestone name)
    - description: string (what will be delivered, showing value)
    - amount: number (USD dollar amount, NOT cents — e.g. 1500 for $1,500)
    - dueWeek: number (which week this is due)
  (Intelligently analyze the project complexity to create 2-5 milestones matching the budget.)
- pricingBreakdown: string (A summary breakdown of costs by item, e.g. "Frontend: $800, Backend: $700")
- revisionsPolicy: string (Detail the revision policy, e.g., "2 rounds of revisions included. Additional revisions billed hourly.")
- clientResponsibilities: string (What the client must do, e.g., "Provide assets on time, approve milestones promptly.")
- supportAndWarranty: string (Detail support post-launch, e.g., "30 days bug-fix warranty.")
- paymentTerms: string (Detail the payment structure, e.g., "50% upfront, 50% upon final delivery.")
- nextSteps: string (Detail the next steps, e.g., "Accept proposal, schedule kickoff meeting.")

Return ONLY valid JSON. No markdown wrappers. No extra text.`,
    `Project: ${data.projectTitle}\nService: ${data.service}\n${planNote}\nTimeline preference: ${data.timeline || "flexible"}\nTech stack: ${data.techStack || "not specified"}\nDescription: ${data.description}`,
    2048,
    0.4
  );

  const ensureString = (val: any) => Array.isArray(val) ? val.map(item => `• ${item}`).join("\n") : (val as string || "");

  return {
    title:                     (result.title as string) || `${data.projectTitle} — Proposal`,
    executiveSummary:          ensureString(result.executiveSummary),
    scopeOfWork:               ensureString(result.scopeOfWork),
    deliverables:              ensureString(result.deliverables),
    timeline:                  ensureString(result.timeline),
    milestones:                (result.milestones as any[]) || [],
    pricingBreakdown:          ensureString(result.pricingBreakdown),
    revisionsPolicy:           ensureString(result.revisionsPolicy),
    clientResponsibilities:    ensureString(result.clientResponsibilities),
    supportAndWarranty:        ensureString(result.supportAndWarranty),
    paymentTerms:              ensureString(result.paymentTerms),
    nextSteps:                 ensureString(result.nextSteps),
  };
}

// ─── Contract Generation (triggered when client accepts proposal) ──────────
export async function generateContractWithAI(data: {
  brandName:    string;
  clientName:   string;
  clientEmail:  string;
  projectTitle: string;
  scopeItems:   string[];
  timeline:     string;
  milestones:   { title: string; amount: string; dueWeek: number }[];
  totalAmount:  string;
  terms:        string;
  techStack:    string;
}): Promise<string> {
  if (getSetting("AI_ENABLED", "true") === "false") {
    throw new Error("AI features are currently disabled.");
  }

  const today = new Date().toLocaleDateString("en-US", { dateStyle: "long" });
  const milestoneText = data.milestones
    .map((m, i) => `  Milestone ${i + 1}: ${m.title} — ${m.amount} (Due: Week ${m.dueWeek || "TBD"})`)
    .join("\n");

  const completion = await getGroqClient().chat.completions.create({
    model: getChatModel(),
    messages: [
      {
        role: "system",
        content: `You are a legal document writer specializing in software development service agreements. 
Write a professional, clear, and comprehensive service contract. 
The contract must be written in plain readable text (no markdown, no HTML).
Use clear section headings in ALL CAPS followed by a colon.
Be thorough but avoid unnecessary legal jargon. 
The contract should be enforceable and protect both parties.`,
      },
      {
        role: "user",
        content: `Generate a complete Service Agreement contract with these details:

SERVICE PROVIDER: ${data.brandName}
CLIENT: ${data.clientName} (${data.clientEmail})
PROJECT: ${data.projectTitle}
DATE: ${today}
TOTAL AMOUNT: ${data.totalAmount}
TIMELINE: ${data.timeline}
TECH STACK: ${data.techStack || "as agreed"}

SCOPE OF WORK:
${data.scopeItems.map((s, i) => `${i + 1}. ${s}`).join("\n")}

PAYMENT MILESTONES:
${milestoneText}

ADDITIONAL TERMS:
${data.terms || "Standard service terms apply."}

Include these sections: Agreement Overview, Scope of Work, Timeline, Payment Terms & Milestones, Revision Policy (2 rounds of revisions included), Intellectual Property (client owns final deliverables upon full payment), Confidentiality, Warranties & Liability Limitation, Termination, Governing Law (Pakistan / international arbitration), Signatures.

End with a signature block for both parties. For the client, include a line: "Client Digital Signature: _____________________ Date: _____________"`,
      },
    ],
    temperature: 0.3,
    max_tokens: parseInt(getSetting("GROQ_EMAIL_MAX_TOKENS", "4096")),
  });

  return completion.choices[0]?.message?.content || "Contract generation failed. Please contact us directly.";
}

