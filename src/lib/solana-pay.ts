import { PublicKey, Connection, clusterApiUrl } from "@solana/web3.js";
import { encodeURL, createQR } from "@solana/pay";
import BigNumber from "bignumber.js";

// n01.app treasury wallet - REPLACE WITH YOUR ACTUAL WALLET
const TREASURY_WALLET = new PublicKey(
  process.env.SOLANA_TREASURY_WALLET || "11111111111111111111111111111111" // Default to system program for safety
);

// USDC on Solana mainnet
const USDC_MINT = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");

// Connection to Solana
export const connection = new Connection(
  process.env.SOLANA_RPC_URL || clusterApiUrl("mainnet-beta")
);

export interface SolanaPaymentRequest {
  quoteId: string;
  amount: number; // in USD
  label: string;
  message: string;
}

export function createPaymentURL(params: SolanaPaymentRequest): URL {
  const { amount, label, message, quoteId } = params;

  // Create the payment URL
  const url = encodeURL({
    recipient: TREASURY_WALLET,
    amount: new BigNumber(amount),
    splToken: USDC_MINT,
    label,
    message,
    memo: `n01-${quoteId}`,
  });

  return url;
}

export async function generatePaymentQR(url: URL): Promise<string> {
  const qr = createQR(url);
  
  // Get the QR code as a data URL
  const qrBlob = await qr.getRawData("png");
  if (!qrBlob) return "";
  
  const buffer = await qrBlob.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  
  return `data:image/png;base64,${base64}`;
}

export async function verifyPayment(signature: string): Promise<{
  verified: boolean;
  amount?: number;
  memo?: string;
}> {
  try {
    const transaction = await connection.getTransaction(signature, {
      commitment: "confirmed",
    });

    if (!transaction) {
      return { verified: false };
    }

    // Check if transaction was successful
    if (transaction.meta?.err) {
      return { verified: false };
    }

    // Extract memo from transaction
    const memo = transaction.meta?.logMessages?.find((log) =>
      log.includes("Program log: Memo")
    );

    return {
      verified: true,
      memo: memo || undefined,
    };
  } catch (error) {
    console.error("Error verifying payment:", error);
    return { verified: false };
  }
}
