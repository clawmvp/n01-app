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
    address: process.env.NEXT_PUBLIC_SOLANA_WALLET || "H8Qb75TmjiqEVSXk8k8u1J7cZy56P4j4DxnZmpD6bKsy",
    currency: "USDC",
  },
  {
    network: "ethereum",
    address: process.env.NEXT_PUBLIC_ETH_WALLET || "0xD2785f777a7381935770464979943Bf7a35c4CDE",
    currency: "USDC",
    chainId: 1, // Mainnet
  },
];

// USDC contract addresses
export const USDC_CONTRACTS = {
  ethereum: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  solana: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
};

// Generate unique order ID
export function generateOrderId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `N01-${timestamp}-${random}`;
}

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

// Verify Solana transaction
export async function verifySolanaPayment(signature: string, expectedAmount: number): Promise<{
  verified: boolean;
  amount?: number;
  error?: string;
}> {
  try {
    const rpcUrl = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
    
    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getTransaction",
        params: [signature, { encoding: "jsonParsed", maxSupportedTransactionVersion: 0 }],
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      return { verified: false, error: data.error.message };
    }

    if (!data.result) {
      return { verified: false, error: "Transaction not found or still pending" };
    }

    // Check if transaction was successful
    if (data.result.meta?.err) {
      return { verified: false, error: "Transaction failed" };
    }

    return { verified: true };
  } catch (error) {
    console.error("Solana verification error:", error);
    return { verified: false, error: "Failed to verify transaction" };
  }
}

// Verify Ethereum transaction using public RPC
export async function verifyEthPayment(txHash: string, expectedAmount: number): Promise<{
  verified: boolean;
  amount?: number;
  error?: string;
}> {
  try {
    // Try multiple methods for verification
    
    // Method 1: Use Etherscan API if key available
    const etherscanKey = process.env.ETHERSCAN_API_KEY;
    if (etherscanKey) {
      const response = await fetch(
        `https://api.etherscan.io/v2/api?chainid=1&module=transaction&action=gettxreceiptstatus&txhash=${txHash}&apikey=${etherscanKey}`
      );
      const data = await response.json();
      
      if (data.status === "1" && data.result?.status === "1") {
        return { verified: true };
      }
    }
    
    // Method 2: Use public Ethereum RPC
    const rpcResponse = await fetch("https://eth.llamarpc.com", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_getTransactionReceipt",
        params: [txHash],
      }),
    });

    const rpcData = await rpcResponse.json();
    
    if (rpcData.result) {
      // Check if transaction was successful (status 0x1)
      if (rpcData.result.status === "0x1") {
        return { verified: true };
      } else if (rpcData.result.status === "0x0") {
        return { verified: false, error: "Transaction reverted" };
      }
    }
    
    // Method 3: Check if transaction exists (might be pending)
    const txResponse = await fetch("https://eth.llamarpc.com", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_getTransactionByHash",
        params: [txHash],
      }),
    });

    const txData = await txResponse.json();
    
    if (txData.result) {
      // Transaction exists but receipt not available yet = pending
      return { verified: false, error: "Transaction pending confirmation. Please wait a few minutes and try again." };
    }

    return { verified: false, error: "Transaction not found. Please check the hash." };
  } catch (error) {
    console.error("Ethereum verification error:", error);
    return { verified: false, error: "Failed to verify transaction. Please try again." };
  }
}

// Verify any crypto payment
export async function verifyCryptoPayment(
  network: "solana" | "ethereum",
  txHash: string,
  expectedAmount: number
): Promise<{ verified: boolean; error?: string }> {
  if (network === "solana") {
    return verifySolanaPayment(txHash, expectedAmount);
  } else {
    return verifyEthPayment(txHash, expectedAmount);
  }
}
