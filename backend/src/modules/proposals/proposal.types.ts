import { IProposal, ProposalStatus } from "../../models/Proposal";

export { ProposalStatus, IProposal };

export interface CreateProposalDTO {
  taskRequestId: string;
  clientEmail: string;
  clientName?: string;
  title: string;
  scopeItems?: string[];
  timeline?: string;
  totalAmount: number; // in cents or dollars (will be converted safely)
  currency?: string;
  milestones?: Array<{
    title: string;
    description?: string;
    amount: number;
    dueWeek: number;
    order: number;
  }>;
  terms?: string;
  executiveSummary?: string;
  scopeOfWork?: string;
  deliverables?: string;
  pricingBreakdown?: string;
  revisionsPolicy?: string;
  clientResponsibilities?: string;
  supportAndWarranty?: string;
  paymentTerms?: string;
  nextSteps?: string;
  expiresInDays?: number;
}
