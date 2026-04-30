import { create } from "zustand";

import { tripService } from "@/services/firebase/tripService";
import { Trip } from "@/types/Trip";

interface TripState {
  trips: Trip[];
  activeTripId?: string;
  subscribe: () => void;
  setActiveTrip: (tripId: string) => void;
  createTrip: (trip: Omit<Trip, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateTrip: (tripId: string, payload: Partial<Trip>) => Promise<void>;
  updatePackingItems: (tripId: string, packingItems: Trip["packingItems"]) => Promise<void>;
  deleteTrip: (tripId: string) => Promise<void>;
}

let unsubscribeTrips: (() => void) | null = null;

export const useTripStore = create<TripState>((set) => ({
  trips: [],
  subscribe: () => {
    if (unsubscribeTrips) return;
    unsubscribeTrips = tripService.subscribeTrips((trips) => {
      set((state) => ({
        trips,
        activeTripId: state.activeTripId ?? trips[0]?.id,
      }));
    });
  },
  setActiveTrip: (tripId) => set({ activeTripId: tripId }),
  createTrip: async (trip) => {
    await tripService.createTrip(trip);
  },
  updateTrip: async (tripId, payload) => {
    await tripService.updateTrip(tripId, payload);
  },
  updatePackingItems: async (tripId, packingItems) => {
    await tripService.updateTrip(tripId, { packingItems });
  },
  deleteTrip: async (tripId) => {
    await tripService.deleteTrip(tripId);
    set((state) => ({
      activeTripId:
        state.activeTripId === tripId ? state.trips.find((trip) => trip.id !== tripId)?.id : state.activeTripId,
    }));
  },
}));
