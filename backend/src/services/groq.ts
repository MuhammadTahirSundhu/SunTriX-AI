import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are the SunTriX AI assistant — a knowledgeable, professional, and helpful representative of SunTriX, a premium AI engineering agency.

About SunTriX:
- We are an AI engineering agency that builds Agentic AI, Computer Vision, AI/ML, and SaaS platforms
- We serve Fortune 500 companies, startups, and enterprises
- Our core services: Agentic AI & Automation, AI & Machine Learning, Computer Vision, AI Product/SaaS Development
- We have a 24-hour proposal guarantee and respond to all project briefs within 24 hours
- We've delivered 50+ projects with measurable business impact

When responding:
- Be professional, concise, and helpful
- If asked about pricing, mention that it depends on scope and suggest submitting a task request at /request-task
- If asked about services, describe our four service areas
- If asked about portfolio or case studies, direct to /work
- If asked to contact us, mention hello@suntrix.com or /contact
- Always encourage users to submit a task brief for a free 24-hour proposal
- Keep responses under 300 words unless more detail is genuinely needed`;

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function sendChat(messages: ChatMessage[]): Promise<string> {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    ],
    temperature: 0.7,
    max_tokens: 1024,
  });

  return completion.choices[0]?.message?.content || "I couldn't process that. Please try again.";
}

export async function generateEmailTemplate(prompt: string): Promise<string> {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { 
        role: "system", 
        content: "You are an expert-level HTML email designer and front-end email engineer specializing in high-conversion, visually compelling, and modern newsletter designs.\n\nYour task is to generate advanced, production-ready, and visually attractive HTML email newsletter templates based on the user’s request.\n\nOUTPUT RULES (STRICT):\n- Output ONLY raw HTML\n- Do NOT use markdown, code blocks, or backticks\n- Do NOT include explanations, comments, or conversational text (e.g., “Here is your template”)\n- Do NOT wrap the output in any formatting\n- The response must be directly renderable as an email\n\nDESIGN REQUIREMENTS:\n- Must be fully responsive and mobile-friendly\n- Use inline CSS only (email-client compatible)\n- Follow modern email design best practices\n- Use table-based layout structure for maximum email client compatibility\n- Include proper spacing, padding, and hierarchy for readability\n- Support light and dark email client rendering variations\n- Ensure strong visual hierarchy (headline → subheadline → body → CTA)\n\nVISUAL & UX STANDARDS:\n- Create highly engaging, newsroom-style or marketing-grade layouts\n- Use modern typographic hierarchy (bold headlines, subtle subtext, structured sections)\n- Include optional elements where relevant:\n  - Hero section or banner header\n  - Breaking news badge or highlight labels\n  - Call-to-action buttons (when applicable)\n  - Section dividers for readability\n  - Card-style content blocks (email-safe implementation)\n- Ensure the design feels like a premium digital newspaper or modern SaaS newsletter\n\nCONTENT INTELLIGENCE:\n- Dynamically adapt layout based on user input (news, product update, announcement, etc.)\n- Maintain a professional yet engaging tone suitable for newsletters, announcements, or news broadcasts\n- Optimize for readability, engagement, and click-through performance\n\nCOMPATIBILITY REQUIREMENTS:\n- Must render correctly across major email clients (Gmail, Outlook, Apple Mail)\n- Avoid unsupported CSS (no flexbox or grid for layout structure)\n- Use fallback-safe fonts and colors\n\nFINAL OUTPUT RULE:\nReturn ONLY the final HTML email template with no additional text or formatting." 
      },
      { 
        role: "user", 
        content: `Create an email newsletter template for SunTriX AI Agency based on this prompt: ${prompt}`
      }
    ],
    temperature: 0.4,
    max_tokens: 2048,
  });

  let html = completion.choices[0]?.message?.content || "";
  // Strip any accidental markdown formatting if the model disobeys instructions
  if (html.startsWith("```html")) html = html.replace("```html", "");
  if (html.startsWith("```")) html = html.replace("```", "");
  if (html.endsWith("```")) html = html.slice(0, -3);
  
  return html.trim();
}

// ─── Module schemas for AI field extraction ─────────────────────────────────
const MODULE_SCHEMAS: Record<string, { schema: string; example: string }> = {
  portfolio: {
    schema: `title (string), slug (string, URL-safe), category (one of: "Agentic AI"|"AI & ML"|"Computer Vision"|"SaaS Platform"), description (string, detailed), shortDescription (string, 1-2 sentences), metric (string, e.g. "10x"), metricLabel (string, e.g. "Faster Processing"), clientName (string), industry (string), tags (string[], tech stack), highlights (string[], key achievements), liveUrl (string, optional)`,
    example: `{"title":"Inventory Vision AI","slug":"inventory-vision-ai","category":"Computer Vision","description":"Full detailed description...","shortDescription":"AI-powered inventory system.","metric":"98%","metricLabel":"Detection Accuracy","clientName":"RetailCo","industry":"Retail","tags":["Python","AWS","OpenCV"],"highlights":["40% stockout reduction","Real-time alerts"],"liveUrl":""}`,
  },
  department: {
    schema: `name (string), subtitle (string, short tagline), description (string, 2-3 sentences), href (string, URL slug starting with /services/), capabilities (string[], list of specific capabilities)`,
    example: `{"name":"Agentic AI","subtitle":"Autonomous AI systems that act","description":"We build...","href":"/services/agentic-ai","capabilities":["Workflow Automation","Multi-agent orchestration"]}`,
  },
  blog: {
    schema: `title (string), slug (string, URL-safe), excerpt (string, 1-2 sentences), content (string, full markdown article), category (string), tags (string[]), author (string), readTime (number, estimated minutes to read)`,
    example: `{"title":"How AI is Transforming Retail","slug":"ai-transforming-retail","excerpt":"AI is...","content":"# How AI is Transforming Retail\\n\\n...","category":"AI","tags":["AI","Retail"],"author":"SunTriX Team","readTime":5}`,
  },
  team: {
    schema: `name (string), role (string, job title), department (string), bio (string, 2-3 sentences professional bio), linkedin (string, URL or empty), twitter (string, URL or empty), github (string, URL or empty), website (string, URL or empty)`,
    example: `{"name":"Jane Smith","role":"Lead ML Engineer","department":"Engineering","bio":"Jane has 8 years experience...","linkedin":"https://linkedin.com/in/jane","twitter":"","github":"https://github.com/jane","website":""}`,
  },
  pricing: {
    schema: `name (string, plan name), price (number), currency (string, e.g. "USD"), billingPeriod (one of: "monthly"|"yearly"|"one-time"), description (string, 1-2 sentences), features (string[], list of included features), ctaLabel (string, button text), ctaLink (string, URL)`,
    example: `{"name":"Starter","price":499,"currency":"USD","billingPeriod":"monthly","description":"Perfect for small teams.","features":["5 AI agents","Email support","10GB storage"],"ctaLabel":"Get Started","ctaLink":"/contact"}`,
  },
  client: {
    schema: `name (string, company name), logoUrl (string, logo image URL if mentioned or empty string), websiteUrl (string, company website URL if mentioned or empty string)`,
    example: `{"name":"Acme Corp","logoUrl":"","websiteUrl":"https://acme.com"}`,
  },
};

export async function extractFields(
  module: string,
  text: string
): Promise<Record<string, unknown>> {
  const moduleSchema = MODULE_SCHEMAS[module];
  if (!moduleSchema) {
    throw new Error(`Unknown module: ${module}`);
  }

  const systemPrompt = `You are a data extraction AI for SunTriX admin panel.
Your ONLY job is to extract structured data from unstructured text and return valid JSON.

SCHEMA FOR MODULE "${module}":
${moduleSchema.schema}

RULES:
1. Return ONLY a valid JSON object — no markdown, no code blocks, no explanation
2. Map the user's text to the schema fields above as accurately as possible
3. For array fields (tags, highlights, features, capabilities), return a JSON array of strings
4. If a field cannot be determined from the text, use an empty string "" or empty array [] — never null
5. Do NOT invent data that isn't mentioned or implied in the text
6. Keep values concise and professional

EXAMPLE OUTPUT:
${moduleSchema.example}`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Extract fields from this text:\n\n${text}` },
    ],
    temperature: 0.1, // Low temp for deterministic structured output
    max_tokens: 1024,
  });

  let raw = completion.choices[0]?.message?.content?.trim() || "{}";

  // Strip markdown code fences if the model adds them
  raw = raw.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();

  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    // If JSON parsing fails, return empty object so the UI stays functional
    return {};
  }
}
