import { describe, it, expect } from "vitest";
import { boundChatContext, ChatMessage } from "../services/groq";

describe("2.7 AI Chat Reliability & Context Bounding Unit Tests", () => {
  it("should truncate message history to maxMessages (10 by default)", () => {
    const messages: ChatMessage[] = Array.from({ length: 20 }).map((_, i) => ({
      role: i % 2 === 0 ? "user" : "assistant",
      content: `Message ${i}`,
    }));

    const bounded = boundChatContext(messages, 10, 10000);
    expect(bounded.length).toBe(10);
    expect(bounded[0].content).toBe("Message 10");
    expect(bounded[9].content).toBe("Message 19");
  });

  it("should truncate message history if total characters exceed maxChars budget", () => {
    const messages: ChatMessage[] = [
      { role: "user", content: "A".repeat(500) },
      { role: "assistant", content: "B".repeat(500) },
      { role: "user", content: "C".repeat(500) },
    ];

    // Total = 1500 chars, maxChars = 1100 -> should drop earliest message until under budget
    const bounded = boundChatContext(messages, 10, 1100);
    expect(bounded.length).toBe(2);
    expect(bounded[0].content).toBe("B".repeat(500));
    expect(bounded[1].content).toBe("C".repeat(500));
  });
});
