import { useEffect, useState } from "react";

import { expenseService } from "@/services/firebase/expenseService";
import { useExpenseStore } from "@/store/expenseStore";

export const useExpenses = (tripId?: string) => {
  const [offlineQueueCount, setOfflineQueueCount] = useState(0);
  const expenses = useExpenseStore((state) => state.expenses);
  const subscribe = useExpenseStore((state) => state.subscribe);
  const addExpense = useExpenseStore((state) => state.addExpense);
  const updateExpense = useExpenseStore((state) => state.updateExpense);
  const deleteExpense = useExpenseStore((state) => state.deleteExpense);
  const syncOffline = useExpenseStore((state) => state.syncOffline);
  const syncing = useExpenseStore((state) => state.syncing);

  useEffect(() => {
    subscribe(tripId);
  }, [subscribe, tripId]);

  useEffect(() => {
    expenseService.getOfflineQueueCount().then(setOfflineQueueCount).catch(() => setOfflineQueueCount(0));
  }, [expenses.length, tripId]);

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
