import Link from "next/link";

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="w-20 h-20 mx-auto mb-8 bg-yellow-500/10 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold mb-4">Payment Cancelled</h1>
        
        <p className="text-muted mb-8">
          No worries! Your payment was cancelled and you haven&apos;t been charged. 
          Feel free to return to our pricing page when you&apos;re ready.
        </p>

        <div className="flex flex-col gap-4">
          <Link
            href="/pricing"
            className="px-6 py-3 bg-accent text-white rounded-full font-medium hover:bg-accent/90 transition-all"
          >
            Return to Pricing
          </Link>
          <Link
            href="/"
            className="px-6 py-3 border border-foreground/20 rounded-full font-medium hover:border-foreground/40 transition-colors"
          >
            Back to Home
          </Link>
        </div>

        <p className="text-sm text-muted mt-8">
          Have questions?{" "}
          <a href="mailto:ai@n01.app" className="text-accent hover:underline">
            Contact us
          </a>
        </p>
      </div>
    </div>
  );
}
