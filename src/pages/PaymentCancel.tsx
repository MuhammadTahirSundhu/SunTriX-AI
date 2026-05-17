import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { XCircle, ArrowLeft, MessageSquare } from "lucide-react";

const PaymentCancel = () => (
  <div className="min-h-screen flex items-center justify-center bg-background px-4">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md rounded-2xl border border-border bg-card shadow-xl overflow-hidden"
    >
      <div className="bg-gradient-to-br from-rose-500/10 to-transparent p-8 text-center border-b border-border">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="mx-auto mb-4 h-16 w-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center"
        >
          <XCircle className="h-8 w-8 text-rose-500" />
        </motion.div>
        <h1 className="text-2xl font-extrabold text-foreground">Payment Cancelled</h1>
        <p className="text-muted-foreground text-sm mt-1">No charge was made to your account.</p>
      </div>

      <div className="p-6 space-y-4">
        <p className="text-sm text-muted-foreground text-center leading-relaxed">
          Your payment was cancelled and no funds were collected. If you experienced any issues or have questions about our plans, we're happy to help.
        </p>

        <div className="flex gap-3 pt-2">
          <Link
            to="/pricing"
            className="flex-1 rounded-xl border border-border py-3 text-center text-sm font-medium hover:bg-muted/50 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> View Plans
          </Link>
          <Link
            to="/contact"
            className="flex-1 gradient-bg rounded-xl py-3 text-center text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <MessageSquare className="h-4 w-4" /> Contact Us
          </Link>
        </div>
      </div>
    </motion.div>
  </div>
);

export default PaymentCancel;
