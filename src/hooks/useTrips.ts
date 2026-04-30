import { useEffect } from "react";

import { useAuth } from "@/hooks/useAuth";
import { useTripStore } from "@/store/tripStore";
import { assertTripOwner, isTripOwner } from "@/utils/tripPermissions";

export const useTrips = () => {
  const { user } = useAuth();
  const trips = useTripStore((state) => state.trips);
  const activeTripId = useTripStore((state) => state.activeTripId);
  const subscribe = useTripStore((state) => state.subscribe);
  const createTripAction = useTripStore((state) => state.createTrip);
  const updateTripAction = useTripStore((state) => state.updateTrip);
  const updatePackingItemsAction = useTripStore((state) => state.updatePackingItems);
  const deleteTripAction = useTripStore((state) => state.deleteTrip);
  const setActiveTrip = useTripStore((state) => state.setActiveTrip);
  const activeTrip = trips.find((trip) => trip.id === activeTripId) ?? trips[0];

  useEffect(() => {
    subscribe();
  }, [subscribe]);

  const createTrip = createTripAction;

  const updateTrip = async (tripId: string, payload: Parameters<typeof updateTripAction>[1]) => {
    const targetTrip = trips.find((trip) => trip.id === tripId);
    assertTripOwner(targetTrip, user?.id);
    await updateTripAction(tripId, payload);
  };

  const updatePackingItems = async (
    tripId: string,
    packingItems: Parameters<typeof updatePackingItemsAction>[1],
  ) => {
    await updatePackingItemsAction(tripId, packingItems);
  };

  const deleteTrip = async (tripId: string) => {
    const targetTrip = trips.find((trip) => trip.id === tripId);
    assertTripOwner(targetTrip, user?.id);
    await deleteTripAction(tripId);
  };

  return {
    trips,
    activeTripId,
    activeTrip,
    createTrip,
    updateTrip,
    updatePackingItems,
    deleteTrip,
    setActiveTrip,
    isOwner: isTripOwner(activeTrip, user?.id),
  };
};
