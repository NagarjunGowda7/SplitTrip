export interface WalletContribution {
  memberId: string;
  amountAdded: number;
  amountSpent: number;
  balance: number;
}

export interface WalletTransaction {
  id: string;
  tripId: string;
  type: "add" | "spend" | "refund";
  memberId: string;
  memberName: string;
  amount: number;
  note?: string;
  transactionDate: string;
  createdAt: string;
}

export interface WalletSummary {
  totalWallet: number;
  totalSpent: number;
  remainingBalance: number;
  contributions: WalletContribution[];
}
