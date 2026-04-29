import { Expense } from "@/types/Expense";
import { TripMember } from "@/types/Trip";
import { WalletSummary } from "@/types/WalletTransaction";
import { BalanceEntry, simplifyDebts } from "@/utils/settlementEngine";

export const buildMemberBalances = (
  members: TripMember[],
  expenses: Expense[],
): BalanceEntry[] =>
  members.map((member) => {
    const paid = expenses
      .filter((expense) => expense.paymentSource !== "wallet" && expense.payerId === member.id)
      .reduce((sum, expense) => sum + expense.amount, 0);
    const owes = expenses
      .filter((expense) => expense.paymentSource !== "wallet")
      .reduce(
      (sum, expense) =>
        sum + (expense.shares.find((share) => share.memberId === member.id)?.amount ?? 0),
      0,
    );

    return {
      memberId: member.id,
      memberName: member.name,
      balance: Number((paid - owes).toFixed(2)),
    };
  });

export const buildTripReportData = ({
  members,
  expenses,
  walletSummary,
}: {
  members: TripMember[];
  expenses: Expense[];
  walletSummary: WalletSummary;
}) => {
  const balances = buildMemberBalances(members, expenses);
  const settlements = simplifyDebts(balances);
  const totalCost = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return {
    balances,
    settlements,
    totalCost,
    walletSummary,
  };
};

export const buildWalletInsights = ({
  members,
  expenses,
  walletSummary,
}: {
  members: TripMember[];
  expenses: Expense[];
  walletSummary: WalletSummary;
}) => {
  const walletPaidExpenses = expenses.filter((expense) => expense.paymentSource === "wallet");
  const walletExpenseSpend = walletPaidExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalSpent = Number((walletSummary.totalSpent + walletExpenseSpend).toFixed(2));
  const remainingBalance = Number((walletSummary.totalWallet - totalSpent).toFixed(2));

  const contributionByMember = new Map(
    members.map((member) => [member.id, { memberId: member.id, amountAdded: 0, amountSpent: 0, balance: 0 }]),
  );

  walletSummary.contributions.forEach((entry) => {
    contributionByMember.set(entry.memberId, {
      memberId: entry.memberId,
      amountAdded: entry.amountAdded,
      amountSpent: 0,
      balance: entry.amountAdded,
    });
  });

  walletPaidExpenses.forEach((expense) => {
    expense.shares.forEach((share) => {
      const current = contributionByMember.get(share.memberId) ?? {
        memberId: share.memberId,
        amountAdded: 0,
        amountSpent: 0,
        balance: 0,
      };
      current.amountSpent = Number((current.amountSpent + share.amount).toFixed(2));
      current.balance = Number((current.amountAdded - current.amountSpent).toFixed(2));
      contributionByMember.set(share.memberId, current);
    });
  });

  return {
    totalWallet: walletSummary.totalWallet,
    totalSpent,
    remainingBalance,
    contributions: Array.from(contributionByMember.values()),
    walletExpenseSpend,
  };
};
