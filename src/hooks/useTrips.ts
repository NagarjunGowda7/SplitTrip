import { useEffect } from "react";

import { useTripStore } from "@/store/tripStore";

export const useTrips = () => {
  const trips = useTripStore((state) => state.trips);
  const activeTripId = useTripStore((state) => state.activeTripId);
  const subscribe = useTripStore((state) => state.subscribe);
  const createTrip = useTripStore((state) => state.createTrip);
  const updateTrip = useTripStore((state) => state.updateTrip);
  const deleteTrip = useTripStore((state) => state.deleteTrip);
  const setActiveTrip = useTripStore((state) => state.setActiveTrip);

  useEffect(() => {
    subscribe();
  }, [subscribe]);

  return {
    trips,
    activeTripId,
    activeTrip: trips.find((trip) => trip.id === activeTripId) ?? trips[0],
    createTrip,
    updateTrip,
    deleteTrip,
    setActiveTrip,
  };
};
