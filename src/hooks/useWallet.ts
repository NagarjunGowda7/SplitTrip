import { useEffect } from "react";

import { useWalletStore } from "@/store/walletStore";

export const useWallet = (tripId?: string) => {
  const summary = useWalletStore((state) => state.summary);
  const transactions = useWalletStore((state) => state.transactions);
  const subscribe = useWalletStore((state) => state.subscribe);
  const addTransaction = useWalletStore((state) => state.addTransaction);
  const updateTransaction = useWalletStore((state) => state.updateTransaction);
  const deleteTransaction = useWalletStore((state) => state.deleteTransaction);

  useEffect(() => {
    subscribe(tripId);
  }, [subscribe, tripId]);

  return {
    summary,
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  };
};
