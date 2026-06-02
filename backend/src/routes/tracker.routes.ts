import { Router, Request, Response, NextFunction } from "express";
import ProjectTracker, { IProjectTracker, PhaseEnum } from "../models/ProjectTracker";
import TaskRequest from "../models/TaskRequest";
import Proposal from "../models/Proposal";
import { requireAuth } from "../middleware/auth";
import { createError } from "../middleware/errorHandler";
import { 
  sendTrackerPhaseAdvancedEmail, 
  sendTrackerDeliverableReviewEmail,
  sendTrackerUpdateEmail,
  sendTrackerFileEmail,
  sendTrackerClientActionToAdminEmail 
} from "../services/email";
import { getSetting } from "../lib/configLoader";

const router = Router();
const getAppUrl = () => getSetting("FRONTEND_URL", "http://localhost:5173");
const getClientPortalUrl = (token: string) => `${getAppUrl()}/client/project/${token}`;
const getAdminUrl = () => `${getAppUrl()}/admin/tasks`;

// ─── HELPER ────────────────────────────────────────────────────────
const writeAudit = async (tracker: any, action: string, actor: string, role: "Admin"|"Client"|"System", metadata?: any) => {
  tracker.auditLog.push({ action, actor, actorRole: role, timestamp: new Date(), metadata });
};

// ─── ADMIN ENDPOINTS ───────────────────────────────────────────────

router.get("/admin/list", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trackers = await ProjectTracker.find()
      .populate("taskRequestId", "name projectTitle company service status")
      .sort({ createdAt: -1 })
      .lean();
    res.json({ trackers });
  } catch (err) { next(err); }
});

router.get("/admin/:id", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tracker = await ProjectTracker.findById(req.params.id)
      .populate("taskRequestId")
      .populate("proposalId")
      .lean();
    if (!tracker) return next(createError("Tracker not found", 404));
    res.json({ tracker });
  } catch (err) { next(err); }
});

router.post("/admin/:id/phase/advance", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { nextPhase, adminNote } = req.body;
    const tracker = await ProjectTracker.findById(req.params.id);
    if (!tracker) return next(createError("Tracker not found", 404));

    // Complete current phase
    const currentPhaseIndex = tracker.phases.findIndex(p => p.name === tracker.currentPhase);
    if (currentPhaseIndex > -1) {
      tracker.phases[currentPhaseIndex].completedAt = new Date();
      if (adminNote) tracker.phases[currentPhaseIndex].adminNote = adminNote;
    }

    // Add new phase
    tracker.currentPhase = nextPhase;
    tracker.phases.push({ name: nextPhase, enteredAt: new Date() });
    await writeAudit(tracker, `Advanced to Phase: ${nextPhase}`, "Admin", "Admin");

    await tracker.save();

    // Send email
    const task = await TaskRequest.findById(tracker.taskRequestId).lean();
    if (task) {
      await sendTrackerPhaseAdvancedEmail({
        clientEmail: task.email,
        projectTitle: task.projectTitle,
        newPhase: nextPhase,
        portalUrl: getClientPortalUrl(tracker.trackerToken)
      });
    }

    res.json({ message: "Phase advanced successfully", tracker });
  } catch (err) { next(err); }
});

router.post("/admin/:id/deliverable/:dId/complete", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { attachedUrl } = req.body;
    const tracker = await ProjectTracker.findById(req.params.id);
    if (!tracker) return next(createError("Tracker not found", 404));

    const deliverable = tracker.deliverables.id(req.params.dId);
    if (!deliverable) return next(createError("Deliverable not found", 404));

    deliverable.status = "InReview";
    if (attachedUrl) deliverable.attachedUrl = attachedUrl;

    await writeAudit(tracker, `Marked deliverable ready for review: ${deliverable.title}`, "Admin", "Admin");
    await tracker.save();

    const task = await TaskRequest.findById(tracker.taskRequestId).lean();
    if (task) {
      await sendTrackerDeliverableReviewEmail({
        clientEmail: task.email,
        projectTitle: task.projectTitle,
        deliverableTitle: deliverable.title,
        portalUrl: getClientPortalUrl(tracker.trackerToken)
      });
    }

    res.json({ message: "Deliverable marked complete", tracker });
  } catch (err) { next(err); }
});

router.post("/admin/:id/update", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, body, nextUpdateDue } = req.body;
    const tracker = await ProjectTracker.findById(req.params.id);
    if (!tracker) return next(createError("Tracker not found", 404));

    tracker.updates.unshift({ type, body, postedAt: new Date(), nextUpdateDue });
    await writeAudit(tracker, `Posted new update: ${type}`, "Admin", "Admin");
    await tracker.save();

    const task = await TaskRequest.findById(tracker.taskRequestId).lean();
    if (task) {
      await sendTrackerUpdateEmail({
        clientEmail: task.email,
        projectTitle: task.projectTitle,
        updateType: type,
        isActionRequired: type === "ActionRequired",
        portalUrl: getClientPortalUrl(tracker.trackerToken)
      });
    }

    res.json({ message: "Update posted", tracker });
  } catch (err) { next(err); }
});

router.post("/admin/:id/chat", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { text } = req.body;
    const tracker = await ProjectTracker.findById(req.params.id);
    if (!tracker) return next(createError("Tracker not found", 404));

    tracker.messages.push({
      sender: "Admin",
      text,
      sentAt: new Date(),
      readByAdmin: true,
      readByClient: false
    });
    
    // We don't necessarily log every chat in the audit log to avoid bloat, or we can. Let's log it.
    await writeAudit(tracker, "Sent chat message", "Admin", "Admin");
    await tracker.save();

    res.json({ message: "Message sent", tracker });
  } catch (err) { next(err); }
});


// ─── CLIENT ENDPOINTS ──────────────────────────────────────────────

router.get("/client/:token", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tracker = await ProjectTracker.findOne({ trackerToken: req.params.token })
      .populate("taskRequestId", "name projectTitle service timeline techStack selectedPlan")
      .lean();
    if (!tracker) return next(createError("Invalid tracking token", 404));
    
    // Sanitize: remove audit log
    const sanitized: any = { ...tracker };
    delete sanitized.auditLog;
    
    res.json({ tracker: sanitized });
  } catch (err) { next(err); }
});

router.post("/client/:token/deliverable/:dId/approve", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tracker = await ProjectTracker.findOne({ trackerToken: req.params.token });
    if (!tracker) return next(createError("Invalid token", 404));

    const deliverable = tracker.deliverables.id(req.params.dId);
    if (!deliverable) return next(createError("Deliverable not found", 404));

    deliverable.status = "Approved";
    deliverable.clientApprovedAt = new Date();

    const task = await TaskRequest.findById(tracker.taskRequestId).lean();
    const clientName = task?.name || "Client";

    await writeAudit(tracker, `Approved deliverable: ${deliverable.title}`, clientName, "Client");
    await tracker.save();

    await sendTrackerClientActionToAdminEmail({
      actionStr: "approved a deliverable",
      projectTitle: task?.projectTitle || "",
      targetName: deliverable.title,
      adminUrl: getAdminUrl()
    });

    res.json({ message: "Deliverable approved", tracker });
  } catch (err) { next(err); }
});

router.post("/client/:token/deliverable/:dId/reject", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { clientRejectionNote } = req.body;
    const tracker = await ProjectTracker.findOne({ trackerToken: req.params.token });
    if (!tracker) return next(createError("Invalid token", 404));

    const deliverable = tracker.deliverables.id(req.params.dId);
    if (!deliverable) return next(createError("Deliverable not found", 404));

    deliverable.status = "Rejected";
    deliverable.clientRejectionNote = clientRejectionNote;

    const task = await TaskRequest.findById(tracker.taskRequestId).lean();
    const clientName = task?.name || "Client";

    await writeAudit(tracker, `Requested changes on deliverable: ${deliverable.title}`, clientName, "Client");
    await tracker.save();

    await sendTrackerClientActionToAdminEmail({
      actionStr: "requested changes on a deliverable",
      projectTitle: task?.projectTitle || "",
      targetName: deliverable.title,
      adminUrl: getAdminUrl()
    });

    res.json({ message: "Deliverable rejected", tracker });
  } catch (err) { next(err); }
});

router.post("/client/:token/update/:uId/acknowledge", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tracker = await ProjectTracker.findOne({ trackerToken: req.params.token });
    if (!tracker) return next(createError("Invalid token", 404));

    const update = tracker.updates.id(req.params.uId);
    if (!update) return next(createError("Update not found", 404));

    update.clientAcknowledgedAt = new Date();

    const task = await TaskRequest.findById(tracker.taskRequestId).lean();
    const clientName = task?.name || "Client";

    await writeAudit(tracker, `Acknowledged update`, clientName, "Client");
    await tracker.save();

    res.json({ message: "Update acknowledged", tracker });
  } catch (err) { next(err); }
});

router.post("/client/:token/chat", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { text } = req.body;
    const tracker = await ProjectTracker.findOne({ trackerToken: req.params.token });
    if (!tracker) return next(createError("Invalid token", 404));

    tracker.messages.push({
      sender: "Client",
      text,
      sentAt: new Date(),
      readByAdmin: false,
      readByClient: true
    });
    
    // Maybe don't spam audit log with chat messages, just save.
    await tracker.save();

    res.json({ message: "Message sent", tracker });
  } catch (err) { next(err); }
});

// ─── ADMIN: Mark milestone payable → create Stripe Checkout ────────
router.post("/admin/:id/milestone/:mId/mark-payable", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tracker = await ProjectTracker.findById(req.params.id);
    if (!tracker) return next(createError("Tracker not found", 404));

    const milestone = tracker.milestones.id(req.params.mId);
    if (!milestone) return next(createError("Milestone not found", 404));
    if (milestone.paidAt) return next(createError("Milestone already paid", 400));

    const task = await TaskRequest.findById(tracker.taskRequestId).lean() as any;
    if (!task) return next(createError("Task not found", 404));

    // Lazy import stripe to keep things tidy
    const stripe = (await import("../services/stripe")).default;
    const appUrl = getAppUrl();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: {
            name: milestone.title,
            description: `Project: ${task.projectTitle} — Milestone payment`,
          },
          unit_amount: milestone.amount, // already in cents
        },
        quantity: 1,
      }],
      customer_email: task.email,
      metadata: {
        type: "tracker_milestone",
        trackerId: tracker._id.toString(),
        milestoneId: milestone._id!.toString(),
        trackerToken: tracker.trackerToken,
      },
      success_url: `${appUrl}/client/project/${tracker.trackerToken}?paid=1`,
      cancel_url:  `${appUrl}/client/project/${tracker.trackerToken}`,
    });

    await writeAudit(tracker, `Milestone marked payable: ${milestone.title}`, "Admin", "Admin");
    await tracker.save();

    // Email client
    const { sendTrackerPaymentDueEmail } = await import("../services/email");
    await sendTrackerPaymentDueEmail({
      clientEmail: task.email,
      projectTitle: task.projectTitle,
      milestoneTitle: milestone.title,
      amountFormatted: `$${(milestone.amount / 100).toFixed(2)}`,
      portalUrl: getClientPortalUrl(tracker.trackerToken),
    });

    res.json({ checkoutUrl: session.url, sessionId: session.id });
  } catch (err) { next(err); }
});

// ─── ADMIN: Upload file ──────────────────────────────────────────────
router.post("/admin/:id/file/upload", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { upload, uploadDocument, uploadImage } = await import("../services/cloudinary");

    // Multer middleware inline
    upload.single("file")(req as any, res as any, async (err: any) => {
      if (err) return next(createError(err.message, 400));
      if (!(req as any).file) return next(createError("No file provided", 400));

      const tracker = await ProjectTracker.findById(req.params.id);
      if (!tracker) return next(createError("Tracker not found", 404));

      const file = (req as any).file;
      const folder = `projects/${tracker.taskRequestId}/files`;
      const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.originalname);

      let result;
      if (isImage) {
        result = await uploadImage(file.buffer, folder);
      } else {
        result = await uploadDocument(file.buffer, file.originalname, folder);
      }

      tracker.files.push({
        filename: file.originalname,
        cloudinaryUrl: result.url,
        cloudinaryPublicId: result.publicId,
        version: 1,
        uploadedAt: new Date(),
        approvalStatus: "Pending",
      });

      await writeAudit(tracker, `Uploaded file: ${file.originalname}`, "Admin", "Admin");
      await tracker.save();

      const task = await TaskRequest.findById(tracker.taskRequestId).lean() as any;
      if (task) {
        const { sendTrackerFileEmail } = await import("../services/email");
        await sendTrackerFileEmail({
          clientEmail: task.email,
          projectTitle: task.projectTitle,
          filename: file.originalname,
          portalUrl: getClientPortalUrl(tracker.trackerToken),
        });
      }

      res.json({ message: "File uploaded", tracker });
    });
  } catch (err) { next(err); }
});

// ─── ADMIN: Audit log ───────────────────────────────────────────────
router.get("/admin/:id/audit", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tracker = await ProjectTracker.findById(req.params.id).select("auditLog").lean();
    if (!tracker) return next(createError("Tracker not found", 404));
    res.json({ auditLog: tracker.auditLog });
  } catch (err) { next(err); }
});

// ─── STRIPE WEBHOOK for tracker milestones ─────────────────────────
// Note: Must be registered with raw body parser in app.ts
router.post("/webhook/stripe", async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"];
  const stripe = (await import("../services/stripe")).default;
  const { getSetting: getS } = await import("../lib/configLoader");
  const webhookSecret = getS("STRIPE_WEBHOOK_SECRET");
  if (!webhookSecret) { console.error("STRIPE_WEBHOOK_SECRET not set"); return res.sendStatus(500); }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig as string, webhookSecret);
  } catch (err: any) {
    console.error("Tracker webhook sig failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    if (session.metadata?.type === "tracker_milestone") {
      try {
        const { trackerId, milestoneId, trackerToken } = session.metadata;
        const tracker = await ProjectTracker.findById(trackerId);
        if (tracker) {
          const milestone = tracker.milestones.id(milestoneId);
          if (milestone && !milestone.paidAt) {
            milestone.paidAt = new Date();
            milestone.stripePaymentIntentId = session.payment_intent || "";
            await writeAudit(tracker, `Milestone paid: ${milestone.title}`, "System", "System", { amount: milestone.amount });
            await tracker.save();

            const task = await TaskRequest.findById(tracker.taskRequestId).lean() as any;
            if (task) {
              const { sendTrackerPaymentConfirmedEmail } = await import("../services/email");
              await sendTrackerPaymentConfirmedEmail({
                clientEmail: task.email,
                projectTitle: task.projectTitle,
                milestoneTitle: milestone.title,
                amountFormatted: `$${(milestone.amount / 100).toFixed(2)}`,
                portalUrl: getClientPortalUrl(trackerToken),
              });
            }
          }
        }
      } catch (e) { console.error("Error processing tracker milestone payment:", e); }
    }
  }
  res.json({ received: true });
});

// ─── CLIENT: Approve file ──────────────────────────────────────────
router.post("/client/:token/file/:fId/approve", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tracker = await ProjectTracker.findOne({ trackerToken: req.params.token });
    if (!tracker) return next(createError("Invalid token", 404));
    const file = tracker.files.id(req.params.fId);
    if (!file) return next(createError("File not found", 404));
    file.approvalStatus = "Approved";
    file.approvedAt = new Date();
    const task = await TaskRequest.findById(tracker.taskRequestId).lean() as any;
    await writeAudit(tracker, `Approved file: ${file.filename}`, task?.name || "Client", "Client");
    await tracker.save();
    await sendTrackerClientActionToAdminEmail({ actionStr: "approved a file", projectTitle: task?.projectTitle || "", targetName: file.filename, adminUrl: getAdminUrl() });
    res.json({ message: "File approved", tracker });
  } catch (err) { next(err); }
});

// ─── CLIENT: Reject file ───────────────────────────────────────────
router.post("/client/:token/file/:fId/reject", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { clientComment } = req.body;
    const tracker = await ProjectTracker.findOne({ trackerToken: req.params.token });
    if (!tracker) return next(createError("Invalid token", 404));
    const file = tracker.files.id(req.params.fId);
    if (!file) return next(createError("File not found", 404));
    file.approvalStatus = "Rejected";
    file.clientComment = clientComment || "";
    const task = await TaskRequest.findById(tracker.taskRequestId).lean() as any;
    await writeAudit(tracker, `Rejected file: ${file.filename}`, task?.name || "Client", "Client");
    await tracker.save();
    await sendTrackerClientActionToAdminEmail({ actionStr: "rejected a file", projectTitle: task?.projectTitle || "", targetName: file.filename, adminUrl: getAdminUrl() });
    res.json({ message: "File rejected", tracker });
  } catch (err) { next(err); }
});

// ─── CLIENT: Checkout for milestone ───────────────────────────────
// The client clicks "Pay Now" → hits this endpoint to get a fresh checkout URL
router.post("/client/:token/milestone/:mId/checkout", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tracker = await ProjectTracker.findOne({ trackerToken: req.params.token });
    if (!tracker) return next(createError("Invalid token", 404));

    const milestone = tracker.milestones.id(req.params.mId);
    if (!milestone) return next(createError("Milestone not found", 404));
    if (milestone.paidAt) return res.json({ alreadyPaid: true });

    const task = await TaskRequest.findById(tracker.taskRequestId).lean() as any;
    const stripe = (await import("../services/stripe")).default;
    const appUrl = getAppUrl();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: { name: milestone.title, description: `Project: ${task?.projectTitle}` },
          unit_amount: milestone.amount,
        },
        quantity: 1,
      }],
      customer_email: task?.email,
      metadata: {
        type: "tracker_milestone",
        trackerId: tracker._id.toString(),
        milestoneId: milestone._id!.toString(),
        trackerToken: tracker.trackerToken,
      },
      success_url: `${appUrl}/client/project/${tracker.trackerToken}?paid=1`,
      cancel_url:  `${appUrl}/client/project/${tracker.trackerToken}`,
    });

    res.json({ checkoutUrl: session.url });
  } catch (err) { next(err); }
});

export default router;
