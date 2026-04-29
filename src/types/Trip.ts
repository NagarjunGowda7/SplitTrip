import { UserProfile } from "./User";

export interface TripMember {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  contribution?: number;
  role?: "owner" | "member";
}

export interface BudgetSnapshot {
  totalBudget: number;
  totalSpent: number;
  predictedOverspend: number;
  budgetRisk: "safe" | "watch" | "high";
}

export interface TripMemory {
  id: string;
  type: "place" | "expense" | "photo" | "note";
  title: string;
  description?: string;
  date: string;
  imageUrl?: string;
  relatedId?: string;
}

export interface PackingItem {
  id: string;
  title: string;
  packed: boolean;
}

export interface Trip {
  id: string;
  name: string;
  destination: string;
  currency: string;
  startDate: string;
  endDate: string;
  coverImage?: string;
  createdBy: string;
  members: TripMember[];
  budget: number;
  walletBalance: number;
  totalSpent: number;
  notes?: string;
  packingItems: PackingItem[];
  memories: TripMemory[];
  status?: "draft" | "active" | "completed";
  createdAt: string;
  updatedAt: string;
  owner?: UserProfile;
}
