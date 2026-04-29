import { create } from "zustand";

import { expenseService } from "@/services/firebase/expenseService";
import { Expense } from "@/types/Expense";

interface ExpenseState {
  expenses: Expense[];
  syncing: boolean;
  subscribe: (tripId?: string) => void;
  addExpense: (expense: Expense) => Promise<void>;
  updateExpense: (tripId: string, expenseId: string, payload: Partial<Expense>) => Promise<void>;
  deleteExpense: (tripId: string, expenseId: string) => Promise<void>;
  syncOffline: () => Promise<number>;
}

let unsubscribeExpenses: (() => void) | null = null;
let subscribedTripId: string | undefined;

export const useExpenseStore = create<ExpenseState>((set) => ({
  expenses: [],
  syncing: false,
  subscribe: (tripId) => {
    if (!tripId || subscribedTripId === tripId) return;
    unsubscribeExpenses?.();
    unsubscribeExpenses = expenseService.subscribeExpenses(tripId, (expenses) => set({ expenses }));
    subscribedTripId = tripId;
  },
  addExpense: async (expense) => {
    await expenseService.createExpense(expense);
  },
  updateExpense: async (tripId, expenseId, payload) => {
    await expenseService.updateExpense(tripId, expenseId, payload);
  },
  deleteExpense: async (tripId, expenseId) => {
    await expenseService.deleteExpense(tripId, expenseId);
  },
  syncOffline: async () => {
    set({ syncing: true });
    const synced = await expenseService.syncOfflineExpenses();
    set({ syncing: false });
    return synced;
  },
}));
