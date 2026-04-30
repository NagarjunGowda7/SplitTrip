import { useEffect, useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import { useTrips } from "@/hooks/useTrips";
import { itineraryService } from "@/services/firebase/itineraryService";
import { ItineraryItem } from "@/types/ItineraryItem";
import { assertTripOwner } from "@/utils/tripPermissions";

export const useItinerary = (tripId?: string) => {
  const { user } = useAuth();
  const { trips } = useTrips();
  const [items, setItems] = useState<ItineraryItem[]>([]);
  const targetTrip = trips.find((trip) => trip.id === tripId);

  useEffect(() => {
    if (!tripId) return;
    return itineraryService.subscribeItems(tripId, setItems);
  }, [tripId]);

  const markVisited = async (nextTripId: string, itineraryId: string, visited: boolean) => {
    assertTripOwner(
      nextTripId === tripId ? targetTrip : trips.find((trip) => trip.id === nextTripId),
      user?.id,
    );
    await itineraryService.markVisited(nextTripId, itineraryId, visited);
  };

  const updateItem = async (nextTripId: string, itineraryId: string, payload: Partial<ItineraryItem>) => {
    assertTripOwner(
      nextTripId === tripId ? targetTrip : trips.find((trip) => trip.id === nextTripId),
      user?.id,
    );
    await itineraryService.updateItem(nextTripId, itineraryId, payload);
  };

  const deleteItem = async (nextTripId: string, itineraryId: string) => {
    assertTripOwner(
      nextTripId === tripId ? targetTrip : trips.find((trip) => trip.id === nextTripId),
      user?.id,
    );
    await itineraryService.deleteItem(nextTripId, itineraryId);
  };

  return {
    items,
    addItem: itineraryService.addItem,
    markVisited,
    updateItem,
    deleteItem,
  };
};
