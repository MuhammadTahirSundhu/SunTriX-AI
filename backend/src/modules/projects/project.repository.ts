import ProjectTracker, { IProjectTracker } from "../../models/ProjectTracker";

export class ProjectRepository {
  async findByTaskRequestId(taskRequestId: string): Promise<IProjectTracker | null> {
    return ProjectTracker.findOne({ taskRequestId });
  }

  async findByTrackerToken(trackerToken: string): Promise<IProjectTracker | null> {
    return ProjectTracker.findOne({ trackerToken }).populate("taskRequestId proposalId");
  }

  async create(data: any): Promise<IProjectTracker> {
    return ProjectTracker.create(data);
  }

  async findOrCreateTracker(taskRequestId: string, proposalId: string, initialData: any): Promise<IProjectTracker> {
    const existing = await ProjectTracker.findOne({ taskRequestId });
    if (existing) return existing;

    try {
      return await ProjectTracker.create({ taskRequestId, proposalId, ...initialData });
    } catch (err: any) {
      if (err.code === 11000) {
        const found = await ProjectTracker.findOne({ taskRequestId });
        if (found) return found;
      }
      throw err;
    }
  }
}

export const projectRepository = new ProjectRepository();
