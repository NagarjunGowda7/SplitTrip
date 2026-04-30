export interface ItineraryItem {
  id: string;
  tripId: string;
  dayLabel: string;
  date: string;
  startTime: string;
  routeFrom: string;
  endTime: string;
  routeTo: string;
  distanceKm?: number;
  travelTime?: string;
  timeSpent?: string;
  activity: string;
  notes?: string;
  mapsLink?: string;
  visited: boolean;
  visitedAt?: string;
  sortOrder?: number;
  createdAt: string;
}
