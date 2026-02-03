"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CRYPTO_WALLETS, formatAddress, generatePaymentRef } from "@/lib/crypto";
import { calculatePaymentSplit, CRYPTO_DISCOUNT, packages } from "@/lib/pricing";

interface LeadData {
  id: string;
  name: string;
  email: string;
  selectedPackage: string;
  status: string;
}

export default function PaymentPage() {
  const params = useParams();
  const leadId = params.leadId as string;
  
  const [lead, setLead] = useState<LeadData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNetwork, setSelectedNetwork] = useState<"solana" | "ethereum" | null>(null);
  const [txHash, setTxHash] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Fetch lead data
    const fetchLead = async () => {
      try {
        const res = await fetch(`/api/admin/leads`);
        const data = await res.json();
        const foundLead = data.leads?.find((l: LeadData) => l.id === leadId);
        setLead(foundLead || null);
      } catch (error) {
        console.error("Failed to fetch lead:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLead();
  }, [leadId]);

  const pkg = packages.find((p) => p.name === lead?.selectedPackage);
  const price = pkg?.price || 133;
  const payment = calculatePaymentSplit(price, true); // With crypto discount
  const paymentRef = generatePaymentRef(leadId);

  const wallet = selectedNetwork ? CRYPTO_WALLETS.find((w) => w.network === selectedNetwork) : null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const verifyPayment = async () => {
    if (!txHash) return;
    setVerifying(true);

    try {
      const res = await fetch("/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId,
          network: selectedNetwork,
          txHash,
          amount: payment.upfront,
        }),
      });

      const data = await res.json();
      if (data.verified) {
        setVerified(true);
      } else {
        alert(data.error || "Payment not verified. Please check the transaction hash.");
      }
    } catch (error) {
      console.error("Verification error:", error);
      alert("Failed to verify payment. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Payment link not found</h1>
          <p className="text-muted mb-6">This payment link may have expired or is invalid.</p>
          <Link href="/" className="text-accent hover:underline">
            Go to homepage
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
          <h1 className="text-3xl font-bold mb-4">Payment Confirmed!</h1>
          <p className="text-muted mb-8">
            Thank you, {lead.name}! Your payment has been verified. Our AI team is now starting work on your project.
          </p>
          <Link
            href="/"
            className="px-6 py-3 bg-foreground text-background rounded-full font-medium hover:opacity-90 transition-all"
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
          <h1 className="text-3xl font-bold mt-4">Complete Your Payment</h1>
          <p className="text-muted mt-2">
            Hi {lead.name}! Pay with crypto and save {CRYPTO_DISCOUNT * 100}%.
          </p>
        </div>

        {/* Order Summary */}
        <div className="bg-foreground/5 rounded-2xl p-6 mb-8">
          <h2 className="font-semibold mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Package</span>
              <span className="font-medium">{lead.selectedPackage}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Original Price</span>
              <span className="line-through text-muted">${price}</span>
            </div>
            <div className="flex justify-between text-green-500">
              <span>Crypto Discount ({CRYPTO_DISCOUNT * 100}%)</span>
              <span>-${(price * CRYPTO_DISCOUNT).toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-foreground/10">
              <span className="text-muted">Upfront (20%)</span>
              <span className="text-xl font-bold">${payment.upfront}</span>
            </div>
          </div>
          <p className="text-xs text-muted mt-4">
            Reference: <code className="bg-foreground/10 px-2 py-1 rounded">{paymentRef}</code>
          </p>
        </div>

        {/* Network Selection */}
        {!selectedNetwork && (
          <div className="space-y-4">
            <h2 className="font-semibold">Choose Payment Network</h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setSelectedNetwork("solana")}
                className="p-6 border border-foreground/10 rounded-2xl hover:border-purple-500 transition-all text-center"
              >
                <div className="text-3xl mb-2">◎</div>
                <h3 className="font-semibold">Solana</h3>
                <p className="text-sm text-muted">USDC • Fast & cheap</p>
              </button>
              <button
                onClick={() => setSelectedNetwork("ethereum")}
                className="p-6 border border-foreground/10 rounded-2xl hover:border-blue-500 transition-all text-center"
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
                Send ${payment.upfront} USDC on {selectedNetwork === "solana" ? "Solana" : "Ethereum"}
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
                      className="px-4 py-3 bg-accent text-white rounded-xl text-sm hover:bg-accent/90"
                    >
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-sm">
                  <p className="font-medium text-yellow-600 dark:text-yellow-400">Important:</p>
                  <ul className="mt-2 space-y-1 text-yellow-700 dark:text-yellow-300">
                    <li>• Send exactly ${payment.upfront} USDC</li>
                    <li>• Use {selectedNetwork === "solana" ? "Solana" : "Ethereum"} network only</li>
                    <li>• Include reference: {paymentRef}</li>
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
                  {verifying ? "Verifying..." : "Verify"}
                </button>
              </div>
            </div>

            {/* Help */}
            <div className="text-center text-sm text-muted">
              <p>
                Need help?{" "}
                <a href="mailto:ai@n01.app" className="text-accent hover:underline">
                  Contact us
                </a>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
