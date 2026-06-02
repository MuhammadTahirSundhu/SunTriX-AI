import { Router, Request, Response, NextFunction } from "express";
import Contract from "../models/Contract";
import TaskRequest from "../models/TaskRequest";
import Proposal from "../models/Proposal";
import ProjectTracker from "../models/ProjectTracker";
import { requireAuth } from "../middleware/auth";
import { createError } from "../middleware/errorHandler";
import { sendContractSignedNotification } from "../services/email";
import { getSetting } from "../lib/configLoader";

const router = Router();

const getAppUrl = () => getSetting("FRONTEND_URL", "http://localhost:5173");

// ─────────────────────────────────────────────────────────────────
// PUBLIC: GET /contracts/:token
// Client views their contract before signing
// ─────────────────────────────────────────────────────────────────
router.get("/:token", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contract = await Contract.findOne({ contractToken: req.params.token }).lean();
    if (!contract) return next(createError("Contract not found", 404));

    if (contract.status === "expired" || (contract.status === "pending" && new Date() > contract.expiresAt)) {
      return next(createError("This contract link has expired. Please contact us.", 410));
    }

    res.json(contract);
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────
// PUBLIC: POST /contracts/:token/sign
// Client digitally signs the contract with their typed name
// ─────────────────────────────────────────────────────────────────
router.post("/:token/sign", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { clientSignatureName, agreed } = req.body;

    if (!clientSignatureName?.trim()) {
      return next(createError("Please type your full name to sign.", 400));
    }
    if (!agreed) {
      return next(createError("You must agree to the contract terms.", 400));
    }

    const contract = await Contract.findOne({ contractToken: req.params.token });
    if (!contract) return next(createError("Contract not found", 404));

    if (contract.status === "signed") {
      return res.json({ message: "Already signed", trackingToken: null });
    }
    if (contract.status === "expired" || new Date() > contract.expiresAt) {
      return next(createError("This contract has expired. Please contact us.", 410));
    }

    const signedAt = new Date();

    // Mark contract as signed
    await Contract.findByIdAndUpdate(contract._id, {
      status: "signed",
      signedAt,
      clientSignatureName: clientSignatureName.trim(),
    });

    // Update task: store signature details, move to contract_signed
    const task = await TaskRequest.findByIdAndUpdate(
      contract.taskRequestId,
      {
        contractSignedAt:   signedAt,
        contractClientName: clientSignatureName.trim(),
        status: "contract_signed",
        $push: {
          statusHistory: {
            status: "contract_signed",
            note: `Contract signed by ${clientSignatureName.trim()} on ${signedAt.toLocaleDateString("en-US", { dateStyle: "long" })}`,
            updatedAt: signedAt,
          },
        },
      },
      { new: true }
    ).lean() as any;

    // Auto-create ProjectTracker
    const proposal = await Proposal.findById(contract.proposalId);
    let trackerToken = "";
    if (proposal) {
      const deliverables = proposal.deliverables ? proposal.deliverables.split('\n').map(d => ({ title: d.replace(/^•\s*/, '').trim(), status: "Pending" as const, version: 1 })) : [];
      const milestones = proposal.milestones.map(m => ({ title: m.title, amount: m.amount, linkedPhase: "Discovery" as const, dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }));
      
      const newTracker = await ProjectTracker.create({
        taskRequestId: contract.taskRequestId,
        proposalId: contract.proposalId,
        currentPhase: "Discovery",
        phases: [{ name: "Discovery", enteredAt: signedAt }],
        deliverables,
        milestones,
        auditLog: [{
          action: "Project Created",
          actor: "System",
          actorRole: "System",
          timestamp: signedAt,
          metadata: { contractToken: contract.contractToken }
        }]
      });
      trackerToken = newTracker.trackerToken;
    }

    // Notify admin that contract is signed and invoice can now be created
    await sendContractSignedNotification({
      clientName:    contract.clientName,
      clientEmail:   contract.clientEmail,
      projectTitle:  contract.projectTitle,
      signedAt:      signedAt.toLocaleDateString("en-US", { dateStyle: "long" }),
      adminUrl:      `${getAppUrl()}/admin/tasks`,
    });

    res.json({
      message: "Contract signed successfully. The project is now confirmed.",
      trackingToken: trackerToken || task?.trackingToken || "",
    });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────
// ADMIN: GET /contracts/admin/by-task/:taskId
// ─────────────────────────────────────────────────────────────────
router.get("/admin/by-task/:taskId", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contract = await Contract.findOne({ taskRequestId: req.params.taskId }).lean();
    res.json({ contract });
  } catch (err) {
    next(err);
  }
});

export default router;
