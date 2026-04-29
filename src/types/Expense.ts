export type ExpenseSplitType = "equal" | "custom" | "percentage";

export interface ExpenseParticipantShare {
  memberId: string;
  memberName?: string;
  amount: number;
  percentage?: number;
}

export interface Expense {
  id: string;
  tripId: string;
  title: string;
  amount: number;
  currency: string;
  category: string;
  payerId: string;
  payerName: string;
  paymentSource?: "personal" | "wallet";
  splitType: ExpenseSplitType;
  participantIds: string[];
  shares: ExpenseParticipantShare[];
  receiptUrl?: string;
  notes?: string;
  expenseDate: string;
  createdAt: string;
  updatedAt: string;
  synced: boolean;
}
