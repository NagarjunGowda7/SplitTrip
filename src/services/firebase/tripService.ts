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

import { PackingItem, Trip } from "@/types/Trip";
import { stripUndefined } from "@/utils/firestoreHelpers";

import { db } from "./firebaseConfig";

const tripsCollection = collection(db, "trips");

const normalizePackingItems = (packingItems: unknown): PackingItem[] => {
  if (!Array.isArray(packingItems)) return [];

  return packingItems.map((item, index) => {
    if (typeof item === "string") {
      return {
        id: `packing-${index}`,
        title: item,
        packed: false,
      };
    }

    const value = item as Partial<PackingItem>;
    return {
      id: value.id ?? `packing-${index}`,
      title: value.title ?? "Untitled item",
      packed: Boolean(value.packed),
    };
  });
};

export const tripService = {
  async createTrip(trip: Omit<Trip, "id" | "createdAt" | "updatedAt">) {
    const result = await addDoc(tripsCollection, {
      ...stripUndefined(trip),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return result.id;
  },
  subscribeTrips(callback: (trips: Trip[]) => void) {
    return onSnapshot(query(tripsCollection, orderBy("startDate", "asc")), (snapshot) => {
      callback(
        snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
          packingItems: normalizePackingItems(item.data().packingItems),
          createdAt:
            item.data().createdAt?.toDate?.()?.toISOString?.() ?? new Date().toISOString(),
          updatedAt:
            item.data().updatedAt?.toDate?.()?.toISOString?.() ?? new Date().toISOString(),
        })) as Trip[],
      );
    });
  },
  async updateTrip(tripId: string, payload: Partial<Trip>) {
    await updateDoc(doc(db, "trips", tripId), {
      ...stripUndefined(payload),
      updatedAt: serverTimestamp(),
    });
  },
  async deleteTrip(tripId: string) {
    await deleteDoc(doc(db, "trips", tripId));
  },
};
