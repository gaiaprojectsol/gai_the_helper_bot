import { Connection, PublicKey } from "@solana/web3.js";
import { CONFIG } from "./config.js";

const connection = new Connection(CONFIG.SOLANA_RPC, "confirmed");

// Validate a wallet address
export async function validateWallet(address) {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

// Get SOL balance
export async function getBalance(address) {
  const pubkey = new PublicKey(address);
  const balance = await connection.getBalance(pubkey);
  return balance / 1_000_000_000; // lamports → SOL
}

// Get last N signatures
export async function getTransactions(address, limit = 10) {
  const pubkey = new PublicKey(address);
  const signatures = await connection.getSignaturesForAddress(pubkey, { limit });
  return signatures;
}

// Get block time
export async function getBlockTime(slot) {
  return await connection.getBlockTime(slot);
}

// Get current slot
export async function getCurrentSlot() {
  return await connection.getSlot();
}

export default {
  validateWallet,
  getBalance,
  getTransactions,
  getBlockTime,
  getCurrentSlot
};
