import { IProjectTracker } from "../../models/ProjectTracker";

export { IProjectTracker };

export interface CreateProjectTrackerDTO {
  taskRequestId: string;
  proposalId: string;
  phases?: any[];
  deliverables?: any[];
  milestones?: any[];
}
