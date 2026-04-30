import { useEffect, useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import { useTrips } from "@/hooks/useTrips";
import { expenseService } from "@/services/firebase/expenseService";
import { useExpenseStore } from "@/store/expenseStore";
import { assertTripOwner } from "@/utils/tripPermissions";

export const useExpenses = (tripId?: string) => {
  const { user } = useAuth();
  const { trips } = useTrips();
  const [offlineQueueCount, setOfflineQueueCount] = useState(0);
  const expenses = useExpenseStore((state) => state.expenses);
  const subscribe = useExpenseStore((state) => state.subscribe);
  const addExpense = useExpenseStore((state) => state.addExpense);
  const updateExpenseAction = useExpenseStore((state) => state.updateExpense);
  const deleteExpenseAction = useExpenseStore((state) => state.deleteExpense);
  const syncOffline = useExpenseStore((state) => state.syncOffline);
  const syncing = useExpenseStore((state) => state.syncing);
  const targetTrip = trips.find((trip) => trip.id === tripId);

  useEffect(() => {
    subscribe(tripId);
  }, [subscribe, tripId]);

  useEffect(() => {
    expenseService.getOfflineQueueCount().then(setOfflineQueueCount).catch(() => setOfflineQueueCount(0));
  }, [expenses.length, tripId]);

  const updateExpense = async (
    nextTripId: string,
    expenseId: string,
    payload: Parameters<typeof updateExpenseAction>[2],
  ) => {
    assertTripOwner(
      nextTripId === tripId ? targetTrip : trips.find((trip) => trip.id === nextTripId),
      user?.id,
    );
    await updateExpenseAction(nextTripId, expenseId, payload);
  };

  const deleteExpense = async (nextTripId: string, expenseId: string) => {
    assertTripOwner(
      nextTripId === tripId ? targetTrip : trips.find((trip) => trip.id === nextTripId),
      user?.id,
    );
    await deleteExpenseAction(nextTripId, expenseId);
  };

  return {
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    syncOffline,
    syncing,
    offlineQueueCount,
  };
};
