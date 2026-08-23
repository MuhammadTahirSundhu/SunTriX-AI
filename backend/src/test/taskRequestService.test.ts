import { describe, it, expect, vi } from "vitest";
import { TaskRequestService } from "../modules/task-requests/task-request.service";
import { TaskRequestRepository } from "../modules/task-requests/task-request.repository";

describe("Phase 3.1 TaskRequestService Unit Tests", () => {
  it("should format client tracking DTO without exposing internal notes", async () => {
    const mockRepo = {
      findByTrackingToken: vi.fn().mockResolvedValue({
        name: "Acme Client",
        projectTitle: "AI Portal",
        service: "Web Dev",
        status: "in_progress",
        createdAt: new Date(),
        updatedAt: new Date(),
        statusHistory: [
          { status: "new", note: "Internal admin note SECRET", updatedAt: new Date() },
          { status: "in_progress", note: "Internal payment note SECRET", updatedAt: new Date() },
        ],
      }),
    } as unknown as TaskRequestRepository;

    const service = new TaskRequestService(mockRepo);
    const dto = await service.getClientTrackingInfo("token_123");

    expect(dto.name).toBe("Acme Client");
    expect(dto.projectTitle).toBe("AI Portal");
    expect(dto.status).toBe("in_progress");
    expect(dto.statusTimeline.length).toBe(2);
    // Verify internal notes are excluded
    expect((dto.statusTimeline[0] as any).note).toBeUndefined();
  });
});
