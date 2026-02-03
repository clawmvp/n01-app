"use client";

import { useState } from "react";

interface SolanaPayButtonProps {
  quoteId: string;
  amount: number;
  packageName: string;
  paymentType: "upfront" | "final";
  onSuccess?: () => void;
}

export default function SolanaPayButton({
  quoteId,
  amount,
  packageName,
  paymentType,
  onSuccess,
}: SolanaPayButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [qrCode, setQRCode] = useState("");
  const [paymentURL, setPaymentURL] = useState("");

  const handlePayWithSolana = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/solana-pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quoteId,
          amount,
          packageName,
          paymentType,
        }),
      });

      const data = await response.json();

      if (data.qrCode) {
        setQRCode(data.qrCode);
        setPaymentURL(data.paymentURL);
        setShowQR(true);
      }
    } catch (error) {
      console.error("Error creating Solana payment:", error);
    } finally {
      setLoading(false);
    }
  };

  if (showQR) {
    return (
      <div className="p-6 rounded-xl border border-foreground/10 bg-foreground/5">
        <div className="text-center mb-4">
          <h3 className="font-semibold mb-2">Scan to Pay with USDC</h3>
          <p className="text-sm text-muted">
            Amount: <span className="font-bold">${amount} USDC</span>
          </p>
        </div>

        {qrCode && (
          <div className="flex justify-center mb-4">
            <img
              src={qrCode}
              alt="Solana Pay QR Code"
              className="w-48 h-48 rounded-lg"
            />
          </div>
        )}

        <p className="text-xs text-muted text-center mb-4">
          Open your Solana wallet app and scan this QR code
        </p>

        <div className="flex gap-2">
          <button
            onClick={() => {
              window.open(paymentURL, "_blank");
            }}
            className="flex-1 py-3 bg-purple-600 text-white rounded-full font-medium hover:bg-purple-700 transition-all text-sm"
          >
            Open in Wallet
          </button>
          <button
            onClick={() => setShowQR(false)}
            className="px-4 py-3 border border-foreground/20 rounded-full text-sm hover:border-foreground/40 transition-colors"
          >
            Cancel
          </button>
        </div>

        <button
          onClick={onSuccess}
          className="w-full mt-4 py-3 text-sm text-accent hover:underline"
        >
          I&apos;ve completed the payment
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handlePayWithSolana}
      disabled={loading}
      className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-full font-medium hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
    >
      {loading ? (
        "Creating payment..."
      ) : (
        <>
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.51 3.87L6.49 3.87C5.12 3.87 3.87 5.12 3.87 6.49L3.87 17.51C3.87 18.88 5.12 20.13 6.49 20.13L17.51 20.13C18.88 20.13 20.13 18.88 20.13 17.51L20.13 6.49C20.13 5.12 18.88 3.87 17.51 3.87ZM17.51 17.51L6.49 17.51L6.49 6.49L17.51 6.49L17.51 17.51Z" />
          </svg>
          Pay ${amount} USDC (5% off)
        </>
      )}
    </button>
  );
}
