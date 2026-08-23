import { contractRepository, ContractRepository } from "./contract.repository";
import { projectRepository, ProjectRepository } from "../projects/project.repository";
import { taskRequestService, TaskRequestService } from "../task-requests/task-request.service";
import { AppError, ERROR_CODES } from "../../shared/errors/appError";
import { IContract, SignContractDTO } from "./contract.types";
import { getSetting } from "../../lib/configLoader";
import { sendContractSignedNotification } from "../../services/email";
import Proposal from "../../models/Proposal";

export class ContractService {
  constructor(
    private contractRepo: ContractRepository = contractRepository,
    private projectRepo: ProjectRepository = projectRepository,
    private taskService: TaskRequestService = taskRequestService
  ) {}

  async getByToken(token: string): Promise<IContract> {
    const contract = await this.contractRepo.findByToken(token);
    if (!contract) throw new AppError("Contract not found", ERROR_CODES.NOT_FOUND);

    if (contract.status === "expired" || (contract.status === "pending" && new Date() > contract.expiresAt)) {
      throw new AppError("This contract link has expired. Please contact us.", 410);
    }
    return contract;
  }

  async signContract(dto: SignContractDTO): Promise<{ contract: IContract; trackerToken: string; checkoutUrl: string }> {
    const existing = await this.contractRepo.findByToken(dto.token);
    if (!existing) throw new AppError("Contract not found", ERROR_CODES.NOT_FOUND);

    let contract = existing;
    if (contract.status === "pending") {
      const signed = await this.contractRepo.markSigned(
        existing._id.toString(),
        dto.clientSignatureName,
        dto.clientIp,
        dto.userAgent
      );
      if (signed) contract = signed;
    }

    const taskRequestId = contract.taskRequestId._id ? contract.taskRequestId._id.toString() : contract.taskRequestId.toString();
    const proposalId = contract.proposalId._id ? contract.proposalId._id.toString() : contract.proposalId.toString();

    await this.taskService.transitionStatus(taskRequestId, "contract_signed", "client");

    const proposal = await Proposal.findById(proposalId).lean() as any;
    const initialPhases = (proposal?.milestones || []).map((m: any, idx: number) => ({
      phaseNumber: idx + 1,
      title: m.title,
      description: m.description || "",
      status: idx === 0 ? "in_progress" : "pending",
      dueWeek: m.dueWeek || idx + 1,
    }));

    const initialDeliverables = (proposal?.scopeItems || []).map((item: string) => ({
      title: item,
      status: "Pending",
    }));

    const tracker = await this.projectRepo.findOrCreateTracker(taskRequestId, proposalId, {
      clientName: contract.clientName,
      clientEmail: contract.clientEmail,
      projectTitle: contract.projectTitle,
      phases: initialPhases,
      deliverables: initialDeliverables,
      status: "active",
    });

    const appUrl = getSetting("FRONTEND_URL", "http://localhost:5173");
    const checkoutUrl = `${appUrl}/checkout?taskToken=${(contract.taskRequestId as any).trackingToken || ""}&contract=${contract.contractToken}`;

    const adminUrl = `${appUrl}/admin/tasks`;
    sendContractSignedNotification({
      projectTitle: contract.projectTitle,
      clientName: contract.clientName,
      clientEmail: contract.clientEmail,
      signedAt: (contract.signedAt || new Date()).toISOString(),
      adminUrl,
    }).catch(console.error);

    return { contract, trackerToken: tracker.trackerToken, checkoutUrl };
  }
}

export const contractService = new ContractService();
