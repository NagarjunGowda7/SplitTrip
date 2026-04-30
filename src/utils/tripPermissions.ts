import { Trip } from "@/types/Trip";

export const isTripOwner = (trip: Pick<Trip, "createdBy"> | undefined, userId?: string) =>
  Boolean(trip && userId && trip.createdBy === userId);

export const assertTripOwner = (
  trip: Pick<Trip, "createdBy" | "name"> | undefined,
  userId?: string,
  fallbackMessage = "Only the trip creator can edit or delete this information.",
) => {
  if (!isTripOwner(trip, userId)) {
    throw new Error(fallbackMessage);
  }
};
