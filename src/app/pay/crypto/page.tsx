"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CRYPTO_WALLETS, generateOrderId } from "@/lib/crypto";
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
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Generate stable order ID
  const orderId = useMemo(() => generateOrderId(), []);

  const wallet = selectedNetwork ? CRYPTO_WALLETS.find((w) => w.network === selectedNetwork) : null;
  const discountedAmount = amount * (1 - CRYPTO_DISCOUNT);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const verifyPayment = async () => {
    if (!txHash) return;
    setVerifying(true);
    setError(null);

    try {
      const res = await fetch("/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: orderId,
          network: selectedNetwork,
          txHash,
          amount: discountedAmount,
          email,
          packageName,
        }),
      });

      const data = await res.json();

      if (data.verified) {
        setVerified(true);
      } else {
        setError(data.error || "Transaction not found. Please check the hash.");
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError("Could not verify payment. Please try again.");
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
          <div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/25">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-4">Payment Verified! 🎉</h1>
          <p className="text-muted mb-6">
            Your payment has been confirmed. Our AI team is already starting work on your project!
          </p>
          
          <div className="bg-foreground/5 rounded-2xl p-6 mb-8 text-left">
            <h3 className="font-semibold mb-4">Order Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Order ID</span>
                <span className="font-mono">{orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Package</span>
                <span>{packageName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Amount Paid</span>
                <span className="text-green-500 font-semibold">${discountedAmount.toFixed(2)} USDC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Network</span>
                <span>{selectedNetwork === "solana" ? "Solana" : "Ethereum"}</span>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-muted mb-8">
            Confirmation email sent to: <strong>{email}</strong>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="px-6 py-3 bg-foreground text-background rounded-full font-medium hover:opacity-90 transition-all"
            >
              Back to Home
            </Link>
          </div>
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
        <div className="bg-gradient-to-br from-accent/10 to-purple-500/10 rounded-2xl p-6 mb-8 border border-accent/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Order Summary</h2>
            <span className="text-xs font-mono bg-foreground/10 px-3 py-1 rounded-full">{orderId}</span>
          </div>
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
            <div className="flex justify-between pt-3 border-t border-foreground/10">
              <span className="font-medium">Amount to Pay</span>
              <span className="text-2xl font-bold text-accent">${discountedAmount.toFixed(2)} USDC</span>
            </div>
          </div>
          {email && (
            <div className="mt-4 pt-4 border-t border-foreground/10">
              <p className="text-xs text-muted">
                Billing email: <code className="text-foreground">{email}</code>
              </p>
            </div>
          )}
        </div>

        {/* Network Selection */}
        {!selectedNetwork && (
          <div className="space-y-4">
            <h2 className="font-semibold">Choose Payment Network</h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setSelectedNetwork("solana")}
                className="group p-6 border border-foreground/10 rounded-2xl hover:border-purple-500 hover:bg-purple-500/5 transition-all text-center"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">◎</div>
                <h3 className="font-semibold">Solana</h3>
                <p className="text-sm text-muted mt-1">USDC • Fast & cheap</p>
                <span className="inline-block mt-3 text-xs text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
                  ~1 sec • &lt;$0.01 fee
                </span>
              </button>
              <button
                onClick={() => setSelectedNetwork("ethereum")}
                className="group p-6 border border-foreground/10 rounded-2xl hover:border-blue-500 hover:bg-blue-500/5 transition-all text-center"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">Ξ</div>
                <h3 className="font-semibold">Ethereum</h3>
                <p className="text-sm text-muted mt-1">USDC • Widely supported</p>
                <span className="inline-block mt-3 text-xs text-blue-500 bg-blue-500/10 px-2 py-1 rounded-full">
                  ~15 sec • Gas fees apply
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Payment Instructions */}
        {selectedNetwork && wallet && (
          <div className="space-y-6">
            <button
              onClick={() => {
                setSelectedNetwork(null);
                setError(null);
              }}
              className="text-sm text-muted hover:text-foreground flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Change network
            </button>

            <div className="bg-foreground/5 rounded-2xl p-6">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <span className="text-2xl">{selectedNetwork === "solana" ? "◎" : "Ξ"}</span>
                Send ${discountedAmount.toFixed(2)} USDC
              </h2>

              <div className="space-y-4">
                {/* Amount */}
                <div className="bg-accent/10 rounded-xl p-4">
                  <label className="text-xs text-muted">Amount (USDC)</label>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-2xl font-bold">{discountedAmount.toFixed(2)}</span>
                    <button
                      onClick={() => copyToClipboard(discountedAmount.toFixed(2), "amount")}
                      className="text-xs bg-accent text-white px-3 py-1.5 rounded-lg hover:bg-accent/90"
                    >
                      {copied === "amount" ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="text-xs text-muted">Send to this address:</label>
                  <div className="flex items-center gap-2 mt-2">
                    <code className="flex-1 bg-foreground/10 px-4 py-3 rounded-xl text-sm break-all font-mono">
                      {wallet.address}
                    </code>
                    <button
                      onClick={() => copyToClipboard(wallet.address, "address")}
                      className="px-4 py-3 bg-accent text-white rounded-xl text-sm hover:bg-accent/90 flex-shrink-0 transition-colors"
                    >
                      {copied === "address" ? "✓" : "Copy"}
                    </button>
                  </div>
                </div>

                {/* Warning */}
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-sm">
                  <p className="font-medium text-yellow-600 dark:text-yellow-400 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Before you send:
                  </p>
                  <ul className="mt-2 space-y-1 text-yellow-700 dark:text-yellow-300">
                    <li>• Send exactly <strong>${discountedAmount.toFixed(2)} USDC</strong></li>
                    <li>• Use <strong>{selectedNetwork === "solana" ? "Solana" : "Ethereum Mainnet"}</strong> only</li>
                    <li>• Double-check the wallet address</li>
                    <li>• Include order ID <strong>{orderId}</strong> in memo if possible</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Verify Payment */}
            <div className="bg-foreground/5 rounded-2xl p-6">
              <h2 className="font-semibold mb-4">Verify Your Payment</h2>
              <p className="text-sm text-muted mb-4">
                After sending, paste your transaction hash below to verify:
              </p>
              
              <div className="space-y-3">
                <input
                  type="text"
                  value={txHash}
                  onChange={(e) => {
                    setTxHash(e.target.value);
                    setError(null);
                  }}
                  placeholder={selectedNetwork === "solana" ? "Solana signature (starts with 3, 4, or 5...)" : "Ethereum tx hash (starts with 0x...)"}
                  className="w-full px-4 py-3 bg-background border border-foreground/10 rounded-xl text-sm font-mono focus:outline-none focus:border-accent transition-colors"
                />
                
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-500">
                    <p className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {error}
                    </p>
                    {error.includes("pending") && (
                      <p className="mt-2 text-xs">Transactions can take a few minutes to confirm. Please wait and try again.</p>
                    )}
                  </div>
                )}
                
                <button
                  onClick={verifyPayment}
                  disabled={!txHash || verifying}
                  className="w-full px-6 py-3 bg-accent text-white rounded-xl font-medium hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {verifying ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying on {selectedNetwork === "solana" ? "Solana" : "Ethereum"}...
                    </>
                  ) : (
                    "Verify Payment"
                  )}
                </button>
              </div>
            </div>

            {/* Partial Payment Note */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-sm text-blue-600 dark:text-blue-400">
              <p className="font-medium">💡 Partial payment?</p>
              <p className="mt-1">
                If you sent a different amount, your payment will be recorded and we&apos;ll contact you about the remaining balance.
              </p>
            </div>

            {/* Help */}
            <div className="text-center text-sm text-muted">
              <p>
                Need help? Chat with{" "}
                <Link href="/" className="text-accent hover:underline">ARIA</Link>
                {" "}or email{" "}
                <a href="mailto:ai@n01.app" className="text-accent hover:underline">ai@n01.app</a>
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
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 animate-spin text-accent" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Loading payment...</span>
        </div>
      </div>
    }>
      <CryptoPaymentContent />
    </Suspense>
  );
}
