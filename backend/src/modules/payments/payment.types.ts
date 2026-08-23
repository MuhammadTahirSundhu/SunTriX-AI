import { IPayment, PaymentType, PaymentStatus } from "../../models/Payment";

export { IPayment, PaymentType, PaymentStatus };

export interface CreateInvoiceDTO {
  taskRequestId?: string;
  clientEmail: string;
  clientName?: string;
  description: string;
  amountCents: number;
  currency?: string;
  expiresInDays?: number;
}
