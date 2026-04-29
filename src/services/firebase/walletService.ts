import {
  addDoc,
  collection,
  deleteDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  doc,
  updateDoc,
} from "firebase/firestore";

import { WalletSummary, WalletTransaction } from "@/types/WalletTransaction";
import { stripUndefined } from "@/utils/firestoreHelpers";

import { db } from "./firebaseConfig";

const walletCollection = (tripId: string) => collection(db, "trips", tripId, "wallet");

export const walletService = {
  async addTransaction(transaction: Omit<WalletTransaction, "id" | "createdAt">) {
    await addDoc(walletCollection(transaction.tripId), {
      ...stripUndefined(transaction),
      createdAt: serverTimestamp(),
    });
  },
  async updateTransaction(tripId: string, transactionId: string, payload: Partial<WalletTransaction>) {
    await updateDoc(doc(db, "trips", tripId, "wallet", transactionId), {
      ...stripUndefined(payload),
    });
  },
  async deleteTransaction(tripId: string, transactionId: string) {
    await deleteDoc(doc(db, "trips", tripId, "wallet", transactionId));
  },
  subscribeWallet(tripId: string, callback: (summary: WalletSummary, items: WalletTransaction[]) => void) {
    return onSnapshot(query(walletCollection(tripId), orderBy("createdAt", "desc")), (snapshot) => {
      const items = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
        createdAt:
          item.data().createdAt?.toDate?.()?.toISOString?.() ?? new Date().toISOString(),
      })) as WalletTransaction[];

      const contributionMap = new Map<string, WalletSummary["contributions"][number]>();
      let totalWallet = 0;
      let totalSpent = 0;

      items.forEach((item) => {
        const current = contributionMap.get(item.memberId) ?? {
          memberId: item.memberId,
          amountAdded: 0,
          amountSpent: 0,
          balance: 0,
        };

        if (item.type === "add" || item.type === "refund") {
          current.amountAdded += item.amount;
          totalWallet += item.amount;
        } else {
          current.amountSpent += item.amount;
          totalSpent += item.amount;
        }

        current.balance = Number((current.amountAdded - current.amountSpent).toFixed(2));
        contributionMap.set(item.memberId, current);
      });

      callback(
        {
          totalWallet,
          totalSpent,
          remainingBalance: Number((totalWallet - totalSpent).toFixed(2)),
          contributions: Array.from(contributionMap.values()),
        },
        items,
      );
    });
  },
};
