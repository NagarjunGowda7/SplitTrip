import { useEffect } from "react";

import { useAuth } from "@/hooks/useAuth";
import { useTrips } from "@/hooks/useTrips";
import { useWalletStore } from "@/store/walletStore";
import { assertTripOwner } from "@/utils/tripPermissions";

export const useWallet = (tripId?: string) => {
  const { user } = useAuth();
  const { trips } = useTrips();
  const summary = useWalletStore((state) => state.summary);
  const transactions = useWalletStore((state) => state.transactions);
  const subscribe = useWalletStore((state) => state.subscribe);
  const addTransaction = useWalletStore((state) => state.addTransaction);
  const updateTransactionAction = useWalletStore((state) => state.updateTransaction);
  const deleteTransactionAction = useWalletStore((state) => state.deleteTransaction);
  const targetTrip = trips.find((trip) => trip.id === tripId);

  useEffect(() => {
    subscribe(tripId);
  }, [subscribe, tripId]);

  const updateTransaction = async (
    nextTripId: string,
    transactionId: string,
    payload: Parameters<typeof updateTransactionAction>[2],
  ) => {
    assertTripOwner(
      nextTripId === tripId ? targetTrip : trips.find((trip) => trip.id === nextTripId),
      user?.id,
    );
    await updateTransactionAction(nextTripId, transactionId, payload);
  };

  const deleteTransaction = async (nextTripId: string, transactionId: string) => {
    assertTripOwner(
      nextTripId === tripId ? targetTrip : trips.find((trip) => trip.id === nextTripId),
      user?.id,
    );
    await deleteTransactionAction(nextTripId, transactionId);
  };

  return {
    summary,
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  };
};
