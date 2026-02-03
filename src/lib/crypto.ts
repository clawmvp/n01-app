// Crypto payment configuration

export interface CryptoWallet {
  network: "solana" | "ethereum";
  address: string;
  currency: string;
  chainId?: number;
}

// Default wallets - will be overridden by environment variables
export const CRYPTO_WALLETS: CryptoWallet[] = [
  {
    network: "solana",
    address: process.env.NEXT_PUBLIC_SOLANA_WALLET || "YOUR_SOLANA_WALLET_ADDRESS",
    currency: "USDC",
  },
  {
    network: "ethereum",
    address: process.env.NEXT_PUBLIC_ETH_WALLET || "YOUR_ETH_WALLET_ADDRESS",
    currency: "USDC",
    chainId: 1, // Mainnet
  },
];

// USDC contract addresses
export const USDC_CONTRACTS = {
  ethereum: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  solana: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
};

// Get wallet by network
export function getWallet(network: "solana" | "ethereum"): CryptoWallet | undefined {
  return CRYPTO_WALLETS.find((w) => w.network === network);
}

// Generate payment memo/reference
export function generatePaymentRef(leadId: string): string {
  return `N01-${leadId.replace("L-", "").slice(0, 12)}`;
}

// Format address for display
export function formatAddress(address: string, chars: number = 6): string {
  if (address.length <= chars * 2) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

// Verify Solana transaction (basic check - in production use proper RPC)
export async function verifySolanaPayment(signature: string, expectedAmount: number): Promise<{
  verified: boolean;
  amount?: number;
  error?: string;
}> {
  try {
    const response = await fetch(
      `https://api.mainnet-beta.solana.com`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getTransaction",
          params: [signature, { encoding: "jsonParsed", maxSupportedTransactionVersion: 0 }],
        }),
      }
    );

    const data = await response.json();
    
    if (data.error) {
      return { verified: false, error: data.error.message };
    }

    if (!data.result) {
      return { verified: false, error: "Transaction not found" };
    }

    // Transaction exists and confirmed
    return { verified: true };
  } catch (error) {
    return { verified: false, error: String(error) };
  }
}

// Verify Ethereum transaction
export async function verifyEthPayment(txHash: string, expectedAmount: number): Promise<{
  verified: boolean;
  amount?: number;
  error?: string;
}> {
  try {
    // Use Etherscan API for verification
    const apiKey = process.env.ETHERSCAN_API_KEY || "";
    const response = await fetch(
      `https://api.etherscan.io/api?module=transaction&action=gettxreceiptstatus&txhash=${txHash}&apikey=${apiKey}`
    );

    const data = await response.json();

    if (data.status === "1" && data.result.status === "1") {
      return { verified: true };
    }

    return { verified: false, error: "Transaction failed or pending" };
  } catch (error) {
    return { verified: false, error: String(error) };
  }
}
