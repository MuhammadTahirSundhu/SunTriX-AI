# SunTriX AI Solutions - Payment Flow Documentation

This document outlines the complete, end-to-end payment and project scoping flow implemented for SunTriX AI Solutions.

## Overview: The "Agency" (Upwork/Fiverr) Model

Unlike a standard SaaS where users pay immediately for a subscription, an agency/custom-development model requires **scoping** before payment. 

The implemented flow follows these principles:
1. **No direct payments on the pricing page.**
2. **Consultation first.** Clients submit a project brief to get a quote.
3. **Admin reviews and scopes.** The admin sets the final price and sends a targeted invoice.
4. **Secure Checkout.** The client reviews the proposal and pays securely via Stripe.
5. **Instant Tracker.** Upon payment, the client is redirected directly to a real-time project tracker.

---

## Step-by-Step Flow

### 1. The Pricing Page (`/pricing`)
* Clients browse standard tiers and features.
* Instead of a "Buy Now" button, the CTA is **"Get a Free Quote"**.
* Clicking the CTA redirects the client to the `/request-task` page, pre-filling the URL parameters (`?plan=Growth&budget=1500`).

### 2. Submitting a Task Request (`/request-task`)
* The client fills out their project requirements, budget, timeline, and contact info.
* A `TaskRequest` document is created in the database with status `new`.
* A unique `trackingToken` is generated so the client can monitor the request status.

### 3. Admin Review & Proposal Drafting
* The Admin reviews the request in the Admin Dashboard (`/admin/tasks`).
* Admin drafts a formal Proposal detailing Scope Items, Timeline, and Milestones. The Admin can use AI to automatically generate the draft.
* **Backend (`POST /api/proposals/admin/create`)**:
  * Creates a `Proposal` document.
  * Updates the `TaskRequest` status to `proposal_sent`.
  * Sends a branded **Proposal Email** to the client.

### 4. Client Reviews Proposal (`/proposal/:token`)
* Client views the detailed proposal online.
* If revisions are needed, the client requests changes.
* If approved, the client clicks **"Accept Proposal"**.
* **Backend (`POST /api/proposals/:token/accept`)**:
  * Generates the legal text for the contract based on the proposal terms.
  * Creates a `Contract` document.
  * Updates task status to `contract_sent`.
  * Emails the **Contract Link** to the client.

### 5. Client Signs Contract (`/contract/:token`)
* The client views the generated contract.
* They type their full name as a digital signature and agree to the terms.
* **Backend (`POST /api/contracts/:token/sign`)**:
  * Marks contract as signed and sets `contractSignedAt`.
  * Updates task status to `contract_signed`.
  * Sends an admin notification that the project is legally confirmed.

### 6. Admin Creates Invoice
* Once the contract is signed, the Admin's "Create Invoice" button unlocks in the dashboard.
* Admin creates an invoice for the first milestone (or full amount).
* **Backend (`POST /api/payments/admin/create-invoice`)**:
  * Creates a `Payment` document linked to the task.
  * Sends a branded **Invoice Email** to the client.

### 7. Client Pays & Project Starts (`/invoice/:token`)
* The client clicks the invoice link and lands on `ClientInvoice`.
* Upon clicking "Pay", they are taken to a **Stripe Checkout Session**.
* **Backend Webhook**:
  * Verifies the payment.
  * Updates task status to `in_progress`.
  * Sends a receipt email with the project tracker link.

---

## Technical Components

### Database Models
1. **`TaskRequest`**: Stores the project brief, status pipeline (`new` -> `in_review` -> `proposal_sent` -> `in_progress` -> `completed`), and `trackingToken`.
2. **`Payment`**: Stores financial details, `invoiceToken`, `stripeSessionId`, `amount`, `status`, and references the `taskRequestId`.

### Key Backend Routes (`payment.routes.ts`)
* `GET /verify/:sessionId`: Used by fallback success pages to retrieve receipt URLs.
* `GET /invoice/:token`: Validates an invoice and generates a Stripe Checkout URL on the fly.
* `POST /webhook`: Handles async Stripe events to reliably update DB state and trigger receipt emails.
* `POST /admin/create-invoice`: Admin endpoint to formalize a quote and email the client.
* `POST /admin/create-payment-link`: For generic retainers not tied to a specific `TaskRequest`.

### Key Frontend Pages
* `src/pages/Pricing.tsx`: The entry point for scoping.
* `src/pages/ClientInvoice.tsx`: The proposal/invoice viewer.
* `src/pages/TrackRequest.tsx`: The real-time project tracker with payment success state handling.
* `src/pages/PaymentSuccess.tsx`: A fallback success page for standalone retainers.

### Email Services (`email.ts`)
* `sendInvoiceEmail`: HTML template rendering a professional proposal summary and a "View & Pay" button.
* `sendPaymentConfirmation`: HTML template acting as a receipt, outlining the "What happens next" workflow (manager assignment, kickoff call, development).

---

## Security & Best Practices
* **No Client-Side Pricing Manipulation:** The price is strictly set by the Admin in the backend during invoice creation.
* **Robust Webhooks:** Database fulfillment and receipt emails happen securely in the backend via Stripe Webhooks, ensuring clients can't bypass payment steps by manipulating URLs.
* **Data Integrity:** `invoiceToken` and `trackingToken` are cryptographically generated secure random hex strings.
* **Idempotency:** The webhook is designed to handle multiple events (`checkout.session.completed` and `payment_intent.succeeded`) gracefully without duplicating emails or status updates.
