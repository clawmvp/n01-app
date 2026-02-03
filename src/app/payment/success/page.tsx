import Link from "next/link";

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="w-20 h-20 mx-auto mb-8 bg-green-500/10 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
        
        <p className="text-muted mb-8">
          Thank you for your payment. Our AI team has been notified and will start working on your project immediately.
        </p>

        <div className="p-6 rounded-xl bg-foreground/5 mb-8 text-left">
          <h2 className="font-semibold mb-4">What happens next?</h2>
          <ul className="space-y-3 text-sm text-muted">
            <li className="flex items-start gap-3">
              <span className="text-accent font-bold">1.</span>
              <span>Our Orchestrator AI will analyze your project requirements</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-accent font-bold">2.</span>
              <span>Specialized agents will begin development in parallel</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-accent font-bold">3.</span>
              <span>You&apos;ll receive updates via email throughout the process</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-accent font-bold">4.</span>
              <span>We&apos;ll deliver a preview for your review within the estimated timeline</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <Link
            href="/"
            className="px-6 py-3 bg-foreground text-background rounded-full font-medium hover:opacity-90 transition-all"
          >
            Back to Home
          </Link>
          <a
            href="mailto:ai@n01.app"
            className="px-6 py-3 border border-foreground/20 rounded-full font-medium hover:border-foreground/40 transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
