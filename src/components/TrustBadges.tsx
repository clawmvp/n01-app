"use client";

export default function TrustBadges() {
  return (
    <section className="py-12 px-6 border-y border-foreground/10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
          {/* Money Back */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-sm">Money Back</div>
              <div className="text-xs text-muted">100% Guarantee</div>
            </div>
          </div>

          {/* Secure Payments */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-sm">Secure Payments</div>
              <div className="text-xs text-muted">Stripe & Crypto</div>
            </div>
          </div>

          {/* Fast Delivery */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-sm">Fast Delivery</div>
              <div className="text-xs text-muted">48h - 10 days</div>
            </div>
          </div>

          {/* Source Code */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-sm">Full Source Code</div>
              <div className="text-xs text-muted">GitHub Included</div>
            </div>
          </div>

          {/* 24/7 Support */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-cyan-500/10 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-sm">24/7 Available</div>
              <div className="text-xs text-muted">AI Never Sleeps</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
