import { Router, Request, Response, NextFunction } from "express";
import crypto from "crypto";
import Proposal from "../models/Proposal";
import Contract from "../models/Contract";
import TaskRequest from "../models/TaskRequest";
import { requireAuth } from "../middleware/auth";
import { createError } from "../middleware/errorHandler";
import { logAudit } from "../lib/audit";
import { getSetting } from "../lib/configLoader";
import { sendProposalEmail, sendChangesRequestedNotification, sendContractEmail } from "../services/email";
import { draftProposalWithAI, generateContractWithAI } from "../services/groq";

const router = Router();

const getAppUrl = () => getSetting("FRONTEND_URL", "http://localhost:5173");
const getBrandName = () => getSetting("BRAND_NAME", "SunTriX AI Solutions");

const fmt = (cents: number, currency = "usd") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(cents / 100);

// ─────────────────────────────────────────────────────────────────
// ADMIN: POST /proposals/admin/ai-draft
// AI generates a proposal draft from the task brief (admin clicks "Generate with AI")
// ─────────────────────────────────────────────────────────────────
router.post("/admin/ai-draft", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { taskRequestId } = req.body;
    if (!taskRequestId) return next(createError("taskRequestId is required", 400));

    const task = await TaskRequest.findById(taskRequestId).lean() as any;
    if (!task) return next(createError("Task not found", 404));

    const draft = await draftProposalWithAI({
      projectTitle: task.projectTitle || "",
      description:  task.description || "",
      service:      task.service || "",
      budget:       task.budget || "",
      techStack:    task.techStack || "",
      timeline:     task.timeline || "",
      selectedPlan: task.selectedPlan || "",
      brandName:    getBrandName(),
    });

    res.json({ draft });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────
// ADMIN: POST /proposals/admin/create
// Admin creates and sends a proposal to the client
// ─────────────────────────────────────────────────────────────────
router.post("/admin/create", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      taskRequestId,
      title,
      introduction,
      scopeItems,
      timeline,
      milestones,    // array of { title, description, amount (USD), dueWeek, order }
      terms,
      executiveSummary,
      scopeOfWork,
      deliverables,
      pricingBreakdown,
      revisionsPolicy,
      clientResponsibilities,
      supportAndWarranty,
      paymentTerms,
      nextSteps,

      clientEmail,
      clientName,
      aiDrafted,
    } = req.body;

    if (!taskRequestId || !title || !milestones?.length || !clientEmail) {
      return next(createError("taskRequestId, title, milestones, and clientEmail are required", 400));
    }

    const task = await TaskRequest.findById(taskRequestId);
    if (!task) return next(createError("Task not found", 404));

    // Convert milestone amounts from USD to cents
    const milestonesInCents = milestones.map((m: any, i: number) => ({
      title:       m.title,
      description: m.description || "",
      amount:      Math.round(Number(m.amount) * 100),
      dueWeek:     Number(m.dueWeek) || 0,
      order:       i,
    }));

    const totalAmount = milestonesInCents.reduce((sum: number, m: any) => sum + m.amount, 0);

    const proposalToken = crypto.randomBytes(24).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14); // 14-day validity

    const proposal = await Proposal.create({
      proposalToken,
      taskRequestId,
      clientEmail,
      clientName: clientName || task.name,
      title,
      introduction: introduction || "",
      scopeItems:   Array.isArray(scopeItems) ? scopeItems : [],
      timeline:     timeline || "",
      totalAmount,
      currency:     "usd",
      milestones:   milestonesInCents,
      terms:        terms || "",
      executiveSummary:          executiveSummary || "",
      scopeOfWork:               scopeOfWork || "",
      deliverables:              deliverables || "",
      pricingBreakdown:          pricingBreakdown || "",
      revisionsPolicy:           revisionsPolicy || "",
      clientResponsibilities:    clientResponsibilities || "",
      supportAndWarranty:        supportAndWarranty || "",
      paymentTerms:              paymentTerms || "",
      nextSteps:                 nextSteps || "",

      status:       "sent",
      aiDrafted:    aiDrafted === true,
      expiresAt,
    });

    // Update task: store proposal reference, move status to proposal_sent
    await TaskRequest.findByIdAndUpdate(taskRequestId, {
      proposalId: proposal._id,
      status: "proposal_sent",
      $push: {
        statusHistory: {
          status: "proposal_sent",
          note: `Proposal "${title}" sent to ${clientEmail} · Total: ${fmt(totalAmount)}`,
          updatedAt: new Date(),
        },
      },
    });

    await logAudit(req, "create", "proposal", proposal._id.toString(), title);

    const proposalUrl = `${getAppUrl()}/proposal/${proposalToken}`;

    // Send proposal email to client
    await sendProposalEmail({
      clientName:   clientName || task.name,
      clientEmail,
      proposalTitle: title,
      introduction:  introduction || "",
      totalAmount:   fmt(totalAmount),
      milestones:    milestonesInCents.map((m: any) => ({ title: m.title, amount: fmt(m.amount) })),
      proposalUrl,
      expiresAt:     expiresAt.toLocaleDateString("en-US", { dateStyle: "long" }),
    });

    res.status(201).json({ proposal, proposalUrl, proposalToken });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────
// PUBLIC: GET /proposals/:token
// Client views their proposal
// ─────────────────────────────────────────────────────────────────
router.get("/:token", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const proposal = await Proposal.findOne({ proposalToken: req.params.token })
      .populate("taskRequestId", "projectTitle service name email selectedPlan")
      .lean();

    if (!proposal) return next(createError("Proposal not found", 404));

    // Check expiry (only for non-accepted proposals)
    if (proposal.status === "sent" && proposal.expiresAt && new Date() > proposal.expiresAt) {
      return next(createError("This proposal has expired. Please contact us for a new one.", 410));
    }

    res.json(proposal);
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────
// PUBLIC: POST /proposals/:token/accept
// Client accepts the proposal → AI generates contract → contract email sent
// ─────────────────────────────────────────────────────────────────
router.post("/:token/accept", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const proposal = await Proposal.findOne({ proposalToken: req.params.token })
      .populate("taskRequestId", "projectTitle service name email selectedPlan techStack");

    if (!proposal) return next(createError("Proposal not found", 404));
    if (proposal.status === "accepted") {
      // Already accepted — return existing contract token
      const task = proposal.taskRequestId as any;
      return res.json({ message: "Already accepted", contractToken: task?.contractToken });
    }
    if (proposal.status !== "sent" && proposal.status !== "changes_requested") {
      return next(createError("This proposal cannot be accepted in its current state.", 400));
    }

    const task = proposal.taskRequestId as any;
    const brandName = getBrandName();

    // Generate contract with AI
    const contractText = await generateContractWithAI({
      brandName,
      clientName:    proposal.clientName || task?.name || "",
      clientEmail:   proposal.clientEmail,
      projectTitle:  proposal.title,
      scopeItems:    proposal.scopeItems,
      timeline:      proposal.timeline,
      milestones:    proposal.milestones.map(m => ({
        title:   m.title,
        amount:  fmt(m.amount),
        dueWeek: m.dueWeek,
      })),
      totalAmount:   fmt(proposal.totalAmount),
      terms:         proposal.terms,
      techStack:     task?.techStack || "",
    });

    const contractToken = crypto.randomBytes(24).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const contract = await Contract.create({
      contractToken,
      taskRequestId:    task?._id || proposal.taskRequestId,
      proposalId:       proposal._id,
      clientName:       proposal.clientName || task?.name || "",
      clientEmail:      proposal.clientEmail,
      projectTitle:     proposal.title,
      scopeSummary:     proposal.scopeItems.join("; "),
      deliverablesText: proposal.scopeItems.join("\n"),
      timelineText:     proposal.timeline,
      paymentTermsText: proposal.milestones
        .map((m, i) => `Milestone ${i + 1}: ${m.title} — ${fmt(m.amount)} (Week ${m.dueWeek || "TBD"})`)
        .join("\n"),
      fullContractText: contractText,
      status: "pending",
      expiresAt,
    });

    // Update proposal status
    await Proposal.findByIdAndUpdate(proposal._id, {
      status: "accepted",
      acceptedAt: new Date(),
    });

    // Update task: store contract token, move status to contract_sent
    await TaskRequest.findByIdAndUpdate(task?._id || proposal.taskRequestId, {
      contractToken,
      status: "contract_sent",
      $push: {
        statusHistory: {
          status: "contract_sent",
          note: "Client accepted the proposal — contract sent for signature.",
          updatedAt: new Date(),
        },
      },
    });

    const contractUrl = `${getAppUrl()}/contract/${contractToken}`;

    // Send contract email to client
    await sendContractEmail({
      clientName:    proposal.clientName || task?.name || "",
      clientEmail:   proposal.clientEmail,
      projectTitle:  proposal.title,
      totalAmount:   fmt(proposal.totalAmount),
      contractUrl,
      expiresAt:     expiresAt.toLocaleDateString("en-US", { dateStyle: "long" }),
    });

    res.json({ message: "Proposal accepted. Contract sent to your email.", contractToken, contractUrl });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────
// PUBLIC: POST /proposals/:token/request-changes
// Client submits revision request
// ─────────────────────────────────────────────────────────────────
router.post("/:token/request-changes", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { clientNote } = req.body;
    if (!clientNote?.trim()) return next(createError("Please describe the changes you need.", 400));

    const proposal = await Proposal.findOne({ proposalToken: req.params.token });
    if (!proposal) return next(createError("Proposal not found", 404));
    if (proposal.status !== "sent") return next(createError("This proposal is no longer editable.", 400));

    await Proposal.findByIdAndUpdate(proposal._id, {
      status: "changes_requested",
      clientNote: clientNote.trim(),
    });

    // Update task status back to in_review
    await TaskRequest.findByIdAndUpdate(proposal.taskRequestId, {
      status: "in_review",
      $push: {
        statusHistory: {
          status: "in_review",
          note: `Client requested changes: "${clientNote.trim().substring(0, 100)}${clientNote.length > 100 ? "…" : ""}"`,
          updatedAt: new Date(),
        },
      },
    });

    // Notify admin
    await sendChangesRequestedNotification({
      clientName:  proposal.clientName,
      clientEmail: proposal.clientEmail,
      projectTitle: proposal.title,
      clientNote:  clientNote.trim(),
      adminUrl:    `${getAppUrl()}/admin/tasks`,
    });

    res.json({ message: "Change request submitted. We'll review and send a revised proposal shortly." });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────
// ADMIN: GET /proposals/admin/by-task/:taskId
// ─────────────────────────────────────────────────────────────────
router.get("/admin/by-task/:taskId", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const proposals = await Proposal.find({ taskRequestId: req.params.taskId }).sort({ createdAt: -1 }).lean();
    res.json({ proposals });
  } catch (err) {
    next(err);
  }
});

export default router;
