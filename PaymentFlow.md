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

### 3. Admin Review & Invoice Creation
* The Admin reviews the request in the Admin Dashboard (`/admin/tasks`).
* The Admin scopes the project and creates an invoice via the **Create Invoice** modal.
* **Backend (`POST /api/payments/admin/create-invoice`)**:
  * Creates a `Payment` document with `type: "invoice"`, `status: "pending"`, and a generated `invoiceToken`.
  * Links the `Payment` to the `TaskRequest` using `taskRequestId`.
  * Updates the `TaskRequest` status to `proposal_sent`.
  * Automatically sends a beautifully branded **Invoice/Proposal Email** to the client using Resend (`sendInvoiceEmail`).

### 4. Client Views the Invoice (`/invoice/:token`)
* The client clicks the link in their email and lands on the `ClientInvoice` page.
* The page displays:
  * Project Title and Service Description.
  * Total amount due.
  * Expiry date (invoices expire in 30 days).
  * "What happens next" expectations.
* The client clicks **"Accept Proposal & Pay"**.
* **Backend (`GET /api/payments/invoice/:token`)**:
  * Generates a fresh **Stripe Checkout Session**.
  * Sets the `success_url` to redirect to the project tracker (`/track/:trackingToken?paid=1`).
  * Returns the Stripe `checkoutUrl`.

### 5. Stripe Checkout & Webhook
* The client completes the payment on Stripe's securely hosted checkout page.
* Stripe fires a webhook (`checkout.session.completed` and `payment_intent.succeeded`) to our backend.
* **Backend (`POST /api/payments/webhook`)**:
  * Verifies the Stripe signature.
  * Finds the `Payment` document via `stripeSessionId` or metadata `invoiceToken`.
  * Updates the `Payment` status to `paid` and saves the Stripe `receiptUrl`.
  * Updates the associated `TaskRequest` status to `in_progress` (adding a status history note).
  * Automatically sends a **Payment Confirmed (Receipt) Email** to the client (`sendPaymentConfirmation`) containing their Stripe receipt link and the Tracker URL.

### 6. Post-Payment Redirect (`/track/:token?paid=1` or `/payment/success`)
* After successful payment, Stripe redirects the client.
* Because we linked the task, they land on `/track/:trackingToken?paid=1`.
* The `TrackRequest` frontend detects `?paid=1` and displays a prominent **Payment Confirmed — Project is Now Active!** green banner.
* The timeline shows the project has moved through "Request Received", "In Review", "Proposal Sent", and is now officially "In Progress".

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
