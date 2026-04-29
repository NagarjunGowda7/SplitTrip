import { useEffect, useState } from "react";

import { itineraryService } from "@/services/firebase/itineraryService";
import { ItineraryItem } from "@/types/ItineraryItem";

export const useItinerary = (tripId?: string) => {
  const [items, setItems] = useState<ItineraryItem[]>([]);

  useEffect(() => {
    if (!tripId) return;
    return itineraryService.subscribeItems(tripId, setItems);
  }, [tripId]);

  return {
    items,
    addItem: itineraryService.addItem,
    markVisited: itineraryService.markVisited,
    updateItem: itineraryService.updateItem,
    deleteItem: itineraryService.deleteItem,
  };
};
