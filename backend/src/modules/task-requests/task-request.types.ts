import { ITaskRequest, TaskRequestStatus } from "../../models/TaskRequest";

export { TaskRequestStatus, ITaskRequest };

export interface CreateTaskRequestDTO {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  role?: string;
  projectTitle?: string;
  service: string;
  budget?: string;
  timeline?: string;
  description: string;
  priority?: string;
  techStack?: string;
  existingCode?: string;
  codeDetails?: string;
  integrations?: string;
  notes?: string;
  selectedPlan?: string;
  planBudget?: number;
}

export interface ClientTaskTrackingResponseDTO {
  name: string;
  projectTitle: string;
  service: string;
  status: TaskRequestStatus;
  createdAt: Date;
  updatedAt: Date;
  statusTimeline: Array<{
    status: TaskRequestStatus;
    updatedAt: Date;
  }>;
}
