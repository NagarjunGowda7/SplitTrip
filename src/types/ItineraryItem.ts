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
  sortOrder?: number;
  createdAt: string;
}
