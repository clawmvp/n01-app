"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CRYPTO_WALLETS } from "@/lib/crypto";
import { CRYPTO_DISCOUNT } from "@/lib/pricing";

function CryptoPaymentContent() {
  const searchParams = useSearchParams();
  const amount = parseFloat(searchParams.get("amount") || "0");
  const email = searchParams.get("email") || "";
  const packageName = searchParams.get("package") || "Custom";
  
  const [selectedNetwork, setSelectedNetwork] = useState<"solana" | "ethereum" | null>(null);
  const [txHash, setTxHash] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [copied, setCopied] = useState(false);

  const wallet = selectedNetwork ? CRYPTO_WALLETS.find((w) => w.network === selectedNetwork) : null;
  const discountedAmount = amount * (1 - CRYPTO_DISCOUNT);
  const paymentRef = `PAY-${Date.now().toString(36).toUpperCase()}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const verifyPayment = async () => {
    if (!txHash) return;
    setVerifying(true);

    try {
      // For now, just simulate verification
      // In production, this would call the verify-payment API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Send notification email
      await fetch("/api/chat/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name: email.split("@")[0],
          service: "Crypto Payment",
          package: packageName,
          source: "crypto-payment",
          conversation: `Crypto payment of $${discountedAmount} USDC on ${selectedNetwork}\nTX: ${txHash}`,
        }),
      });

      setVerified(true);
    } catch (error) {
      console.error("Verification error:", error);
      alert("Payment recorded. We'll verify and confirm shortly!");
      setVerified(true);
    } finally {
      setVerifying(false);
    }
  };

  if (!amount || amount <= 0) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Invalid Payment Link</h1>
          <p className="text-muted mb-6">This payment link is missing required information.</p>
          <Link href="/pricing" className="text-accent hover:underline">
            View our pricing →
          </Link>
        </div>
      </div>
    );
  }

  if (verified) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 mx-auto mb-8 bg-green-500/10 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-4">Payment Submitted!</h1>
          <p className="text-muted mb-8">
            Thank you! We've received your payment details. Our team will verify the transaction and start working on your project immediately.
          </p>
          <p className="text-sm text-muted mb-8">
            Confirmation email sent to: <strong>{email}</strong>
          </p>
          <Link
            href="/"
            className="px-6 py-3 bg-foreground text-background rounded-full font-medium hover:opacity-90 transition-all inline-block"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="text-2xl font-bold mb-4 inline-block">
            n01<span className="text-accent">.app</span>
          </Link>
          <h1 className="text-3xl font-bold mt-4">Pay with Crypto</h1>
          <p className="text-muted mt-2">
            Save {CRYPTO_DISCOUNT * 100}% when paying with USDC
          </p>
        </div>

        {/* Order Summary */}
        <div className="bg-foreground/5 rounded-2xl p-6 mb-8">
          <h2 className="font-semibold mb-4">Payment Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Package</span>
              <span className="font-medium">{packageName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Original Amount</span>
              <span className="line-through text-muted">${amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-green-500">
              <span>Crypto Discount ({CRYPTO_DISCOUNT * 100}%)</span>
              <span>-${(amount * CRYPTO_DISCOUNT).toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-foreground/10">
              <span className="text-muted">Amount to Pay</span>
              <span className="text-xl font-bold">${discountedAmount.toFixed(2)} USDC</span>
            </div>
          </div>
          {email && (
            <p className="text-xs text-muted mt-4">
              Payment for: <code className="bg-foreground/10 px-2 py-1 rounded">{email}</code>
            </p>
          )}
        </div>

        {/* Network Selection */}
        {!selectedNetwork && (
          <div className="space-y-4">
            <h2 className="font-semibold">Choose Payment Network</h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setSelectedNetwork("solana")}
                className="p-6 border border-foreground/10 rounded-2xl hover:border-purple-500 hover:bg-purple-500/5 transition-all text-center"
              >
                <div className="text-3xl mb-2">◎</div>
                <h3 className="font-semibold">Solana</h3>
                <p className="text-sm text-muted">USDC • Fast & cheap</p>
              </button>
              <button
                onClick={() => setSelectedNetwork("ethereum")}
                className="p-6 border border-foreground/10 rounded-2xl hover:border-blue-500 hover:bg-blue-500/5 transition-all text-center"
              >
                <div className="text-3xl mb-2">Ξ</div>
                <h3 className="font-semibold">Ethereum</h3>
                <p className="text-sm text-muted">USDC • Widely supported</p>
              </button>
            </div>
          </div>
        )}

        {/* Payment Instructions */}
        {selectedNetwork && wallet && (
          <div className="space-y-6">
            <button
              onClick={() => setSelectedNetwork(null)}
              className="text-sm text-muted hover:text-foreground"
            >
              ← Change network
            </button>

            <div className="bg-foreground/5 rounded-2xl p-6">
              <h2 className="font-semibold mb-4">
                Send ${discountedAmount.toFixed(2)} USDC on {selectedNetwork === "solana" ? "Solana" : "Ethereum"}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted">Send to this address:</label>
                  <div className="flex items-center gap-2 mt-2">
                    <code className="flex-1 bg-foreground/10 px-4 py-3 rounded-xl text-sm break-all">
                      {wallet.address}
                    </code>
                    <button
                      onClick={() => copyToClipboard(wallet.address)}
                      className="px-4 py-3 bg-accent text-white rounded-xl text-sm hover:bg-accent/90 flex-shrink-0"
                    >
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-sm">
                  <p className="font-medium text-yellow-600 dark:text-yellow-400">Important:</p>
                  <ul className="mt-2 space-y-1 text-yellow-700 dark:text-yellow-300">
                    <li>• Send exactly <strong>${discountedAmount.toFixed(2)} USDC</strong></li>
                    <li>• Use <strong>{selectedNetwork === "solana" ? "Solana" : "Ethereum"}</strong> network only</li>
                    <li>• Double-check the wallet address</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Verify Payment */}
            <div className="bg-foreground/5 rounded-2xl p-6">
              <h2 className="font-semibold mb-4">Confirm Your Payment</h2>
              <p className="text-sm text-muted mb-4">
                After sending, paste your transaction hash below:
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  placeholder="Transaction hash / signature"
                  className="flex-1 px-4 py-3 bg-background border border-foreground/10 rounded-xl text-sm focus:outline-none focus:border-accent"
                />
                <button
                  onClick={verifyPayment}
                  disabled={!txHash || verifying}
                  className="px-6 py-3 bg-accent text-white rounded-xl font-medium hover:bg-accent/90 disabled:opacity-50"
                >
                  {verifying ? "Verifying..." : "Submit"}
                </button>
              </div>
            </div>

            {/* Help */}
            <div className="text-center text-sm text-muted">
              <p>
                Need help?{" "}
                <a href="mailto:ai@n01.app" className="text-accent hover:underline">
                  Contact us at ai@n01.app
                </a>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CryptoPaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p>Loading payment...</p>
      </div>
    }>
      <CryptoPaymentContent />
    </Suspense>
  );
}
