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
    const clientIp = (req.headers["x-forwarded-for"] as string || req.socket?.remoteAddress || "").split(",")[0].trim();
    const userAgent = req.headers["user-agent"] || "";

    // Mark contract as signed
    await Contract.findByIdAndUpdate(contract._id, {
      status: "signed",
      signedAt,
      clientSignatureName: clientSignatureName.trim(),
      clientIp,
      userAgent,
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

    // Auto-create ProjectTracker (idempotent — safe to retry)
    const proposal = await Proposal.findById(contract.proposalId);
    let trackerToken = "";
    if (proposal) {
      const deliverables = proposal.deliverables
        ? proposal.deliverables
            .split("\n")
            .map((d: string) => d.replace(/^[•\-*]\s*/, "").trim())
            .filter(Boolean)
            .map((title: string) => ({ title, status: "Pending" as const, version: 1 }))
        : [];

      const milestones = proposal.milestones.map((m: any) => ({
        title: m.title,
        amount: Math.round((m.amount || 0) * 100), // store in cents
        linkedPhase: "Discovery" as const,
        // Use dueWeek to compute proper due date
        dueDate: new Date(signedAt.getTime() + ((m.dueWeek || 1) * 7 * 24 * 60 * 60 * 1000)),
      }));

      // Idempotent upsert — prevents duplicate trackers on retry
      const existing = await ProjectTracker.findOne({ taskRequestId: contract.taskRequestId });
      if (existing) {
        trackerToken = existing.trackerToken;
      } else {
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
            metadata: { contractToken: contract.contractToken, clientIp }
          }]
        });
        trackerToken = newTracker.trackerToken;
      }
    }

    // Notify admin that contract is signed and invoice can now be created
    await sendContractSignedNotification({
      clientName:    contract.clientName,
      clientEmail:   contract.clientEmail,
      projectTitle:  contract.projectTitle,
      signedAt:      signedAt.toLocaleDateString("en-US", { dateStyle: "long" }),
      adminUrl:      `${getAppUrl()}/admin/tasks`,
    });

    // Generate signed contract Word doc and email to both parties
    try {
      const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } = await import("docx");
      const signedDateStr = signedAt.toLocaleDateString("en-US", { dateStyle: "long" });
      const signedTimeStr = signedAt.toLocaleTimeString("en-US", { timeStyle: "long" });

      const contractLines = contract.fullContractText.split("\n").map((line: string) =>
        new Paragraph({
          children: [new TextRun({ text: line || " ", size: 22, font: "Calibri" })],
          spacing: { after: 120 },
        })
      );

      const doc = new Document({
        creator: getSetting("BRAND_NAME", "SunTriX AI Solutions"),
        title: `Signed Contract — ${contract.projectTitle}`,
        description: `Digitally signed service agreement`,
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              text: `SERVICE AGREEMENT`,
              heading: HeadingLevel.TITLE,
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [new TextRun({ text: contract.projectTitle, bold: true, size: 28, font: "Calibri" })],
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            }),
            ...contractLines,
            new Paragraph({ text: "", spacing: { before: 400 } }),
            new Paragraph({
              text: "─────────────────────────────────────────────────────────",
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [new TextRun({ text: "DIGITAL SIGNATURE RECORD", bold: true, size: 24, font: "Calibri" })],
              heading: HeadingLevel.HEADING_1,
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Client Name: ", bold: true, font: "Calibri", size: 22 }),
                new TextRun({ text: contract.clientSignatureName, font: "Calibri", size: 22 }),
              ],
              spacing: { after: 120 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Client Email: ", bold: true, font: "Calibri", size: 22 }),
                new TextRun({ text: contract.clientEmail, font: "Calibri", size: 22 }),
              ],
              spacing: { after: 120 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Signed On: ", bold: true, font: "Calibri", size: 22 }),
                new TextRun({ text: `${signedDateStr} at ${signedTimeStr}`, font: "Calibri", size: 22 }),
              ],
              spacing: { after: 120 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "IP Address: ", bold: true, font: "Calibri", size: 22 }),
                new TextRun({ text: clientIp || "Not recorded", font: "Calibri", size: 22 }),
              ],
              spacing: { after: 120 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "User Agent: ", bold: true, font: "Calibri", size: 22 }),
                new TextRun({ text: userAgent ? userAgent.substring(0, 120) : "Not recorded", font: "Calibri", size: 18, color: "666666" }),
              ],
              spacing: { after: 240 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `Issued by: ${getSetting("BRAND_NAME", "SunTriX AI Solutions")}`, italics: true, size: 20, color: "666666", font: "Calibri" }),
              ],
            }),
          ],
        }],
      });

      const docxBuffer = await Packer.toBuffer(doc);
      const { sendSignedContractEmail } = await import("../services/email");
      const safeTitle = contract.projectTitle.replace(/[^a-zA-Z0-9\s-]/g, "").trim().replace(/\s+/g, "_");
      await sendSignedContractEmail({
        clientEmail: contract.clientEmail,
        clientName: contract.clientName,
        adminEmail: getSetting("ADMIN_EMAIL", "admin@suntrix.com"),
        projectTitle: contract.projectTitle,
        signedAt: signedDateStr,
        docxBuffer,
        filename: `Signed_Contract_${safeTitle}.docx`,
      });
    } catch (docxErr: any) {
      // Non-blocking — don't fail the signing if docx generation fails
      console.error("[Contract] Failed to generate/send signed contract docx:", docxErr.message);
    }

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
