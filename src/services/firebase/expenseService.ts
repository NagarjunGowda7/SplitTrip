import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { Expense } from "@/types/Expense";
import { stripUndefined } from "@/utils/firestoreHelpers";

import { db } from "./firebaseConfig";

const OFFLINE_QUEUE_KEY = "trip-ledger-expense-queue";

const expenseCollection = (tripId: string) => collection(db, "trips", tripId, "expenses");

const getQueuedExpenses = async (): Promise<Expense[]> => {
  const raw = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
  return raw ? JSON.parse(raw) : [];
};

const saveQueuedExpenses = async (expenses: Expense[]) => {
  await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(expenses));
};

export const expenseService = {
  async createExpense(expense: Expense) {
    const network = await NetInfo.fetch();
    if (!network.isConnected) {
      const queued = await getQueuedExpenses();
      await saveQueuedExpenses([...queued, { ...expense, synced: false }]);
      return { queued: true };
    }

    await addDoc(expenseCollection(expense.tripId), {
      ...stripUndefined(expense),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      synced: true,
    });
    return { queued: false };
  },
  subscribeExpenses(tripId: string, callback: (expenses: Expense[]) => void) {
    return onSnapshot(query(expenseCollection(tripId), orderBy("expenseDate", "desc")), (snapshot) => {
      callback(
        snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
          createdAt:
            item.data().createdAt?.toDate?.()?.toISOString?.() ?? new Date().toISOString(),
          updatedAt:
            item.data().updatedAt?.toDate?.()?.toISOString?.() ?? new Date().toISOString(),
        })) as Expense[],
      );
    });
  },
  async syncOfflineExpenses() {
    const queued = await getQueuedExpenses();
    if (!queued.length) return 0;

    for (const expense of queued) {
      await addDoc(expenseCollection(expense.tripId), {
        ...stripUndefined(expense),
        synced: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    await saveQueuedExpenses([]);
    return queued.length;
  },
  async getOfflineQueueCount() {
    const queued = await getQueuedExpenses();
    return queued.length;
  },
  async updateExpense(tripId: string, expenseId: string, payload: Partial<Expense>) {
    await updateDoc(doc(db, "trips", tripId, "expenses", expenseId), {
      ...stripUndefined(payload),
      updatedAt: serverTimestamp(),
    });
  },
  async deleteExpense(tripId: string, expenseId: string) {
    await deleteDoc(doc(db, "trips", tripId, "expenses", expenseId));
  },
};
