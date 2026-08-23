import TaskRequest, { TaskRequestStatus, ITaskRequest } from "../models/TaskRequest";
import { createError } from "../middleware/errorHandler";

export type ActorRole = "admin" | "system" | "client";

// Define allowed state transitions map: currentStatus -> array of allowed target statuses
const ALLOWED_TRANSITIONS: Record<TaskRequestStatus, TaskRequestStatus[]> = {
  new: ["in_review", "cancelled"],
  in_review: ["proposal_sent", "cancelled"],
  proposal_sent: ["in_review", "contract_sent", "cancelled"],
  contract_sent: ["contract_signed", "cancelled"],
  contract_signed: ["in_progress", "cancelled"],
  in_progress: ["completed", "cancelled"],
  completed: [], // Terminal
  cancelled: [], // Terminal
};

// Define actor permission rules for transitions
const ACTOR_ALLOWED_TRANSITIONS: Record<ActorRole, Record<TaskRequestStatus, TaskRequestStatus[]>> = {
  admin: ALLOWED_TRANSITIONS, // Admin can execute any valid transition
  system: {
    new: ["in_review"],
    in_review: ["proposal_sent"],
    proposal_sent: ["contract_sent"],
    contract_sent: ["contract_signed"],
    contract_signed: ["in_progress"],
    in_progress: ["completed"],
    completed: [],
    cancelled: [],
  },
  client: {
    new: [],
    in_review: [],
    proposal_sent: ["in_review", "contract_sent"],
    contract_sent: ["contract_signed"],
    contract_signed: [],
    in_progress: [],
    completed: [],
    cancelled: [],
  },
};

export class TaskStatusMachine {
  /**
   * Validate if a transition from currentStatus to newStatus is valid for actorRole.
   */
  static isValidTransition(
    currentStatus: TaskRequestStatus,
    newStatus: TaskRequestStatus,
    actorRole: ActorRole = "system"
  ): boolean {
    if (currentStatus === newStatus) return true;

    const validNextStates = ALLOWED_TRANSITIONS[currentStatus] || [];
    if (!validNextStates.includes(newStatus)) {
      return false;
    }

    const actorAllowed = ACTOR_ALLOWED_TRANSITIONS[actorRole]?.[currentStatus] || [];
    return actorAllowed.includes(newStatus);
  }

  /**
   * Execute single authoritative status transition on a TaskRequest document.
   */
  static async transition(
    taskId: string | ITaskRequest["_id"],
    newStatus: TaskRequestStatus,
    actorRole: ActorRole = "system",
    note: string = ""
  ): Promise<ITaskRequest> {
    const task = await TaskRequest.findById(taskId);
    if (!task) {
      throw createError("Task request not found", 404);
    }

    const currentStatus = task.status as TaskRequestStatus;
    if (currentStatus === newStatus) {
      return task;
    }

    if (!this.isValidTransition(currentStatus, newStatus, actorRole)) {
      throw createError(
        `Invalid status transition from '${currentStatus}' to '${newStatus}' by ${actorRole}.`,
        400
      );
    }

    task.status = newStatus;
    task.statusHistory.push({
      status: newStatus,
      note: note || `Status transitioned to ${newStatus} by ${actorRole}`,
      updatedAt: new Date(),
    });

    await task.save();
    return task;
  }
}
