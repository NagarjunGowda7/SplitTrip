import { create } from "zustand";

import { walletService } from "@/services/firebase/walletService";
import { WalletSummary, WalletTransaction } from "@/types/WalletTransaction";

interface WalletState {
  summary: WalletSummary;
  transactions: WalletTransaction[];
  subscribe: (tripId?: string) => void;
  addTransaction: (transaction: Omit<WalletTransaction, "id" | "createdAt">) => Promise<void>;
  updateTransaction: (tripId: string, transactionId: string, payload: Partial<WalletTransaction>) => Promise<void>;
  deleteTransaction: (tripId: string, transactionId: string) => Promise<void>;
}

const emptySummary: WalletSummary = {
  totalWallet: 0,
  totalSpent: 0,
  remainingBalance: 0,
  contributions: [],
};

let unsubscribeWallet: (() => void) | null = null;
let subscribedWalletTripId: string | undefined;

export const useWalletStore = create<WalletState>((set) => ({
  summary: emptySummary,
  transactions: [],
  subscribe: (tripId) => {
    if (!tripId || subscribedWalletTripId === tripId) return;
    unsubscribeWallet?.();
    unsubscribeWallet = walletService.subscribeWallet(tripId, (summary, transactions) =>
      set({ summary, transactions }),
    );
    subscribedWalletTripId = tripId;
  },
  addTransaction: async (transaction) => {
    await walletService.addTransaction(transaction);
  },
  updateTransaction: async (tripId, transactionId, payload) => {
    await walletService.updateTransaction(tripId, transactionId, payload);
  },
  deleteTransaction: async (tripId, transactionId) => {
    await walletService.deleteTransaction(tripId, transactionId);
  },
}));
