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

import { ItineraryItem } from "@/types/ItineraryItem";
import { stripUndefined } from "@/utils/firestoreHelpers";
import { compareItineraryOrder } from "@/utils/dateHelpers";

import { db } from "./firebaseConfig";

const itineraryCollection = (tripId: string) => collection(db, "trips", tripId, "itinerary");

export const itineraryService = {
  async addItem(item: Omit<ItineraryItem, "id" | "createdAt">) {
    await addDoc(itineraryCollection(item.tripId), {
      ...stripUndefined(item),
      createdAt: serverTimestamp(),
    });
  },
  subscribeItems(tripId: string, callback: (items: ItineraryItem[]) => void) {
    return onSnapshot(query(itineraryCollection(tripId), orderBy("createdAt", "asc")), (snapshot) => {
      callback(
        (snapshot.docs
          .map((item) => ({
            id: item.id,
            ...item.data(),
            createdAt:
              item.data().createdAt?.toDate?.()?.toISOString?.() ?? new Date().toISOString(),
          })) as ItineraryItem[]).sort(compareItineraryOrder),
      );
    });
  },
  async markVisited(tripId: string, itineraryId: string, visited: boolean) {
    await updateDoc(doc(db, "trips", tripId, "itinerary", itineraryId), { visited });
  },
  async updateItem(tripId: string, itineraryId: string, payload: Partial<ItineraryItem>) {
    await updateDoc(doc(db, "trips", tripId, "itinerary", itineraryId), stripUndefined(payload));
  },
  async deleteItem(tripId: string, itineraryId: string) {
    await deleteDoc(doc(db, "trips", tripId, "itinerary", itineraryId));
  },
};
