import { ExpenseParticipantShare } from "@/types/Expense";

export const calculateEqualSplit = (
  amount: number,
  memberIds: string[],
): ExpenseParticipantShare[] => {
  if (!memberIds.length) {
    return [];
  }

  const baseAmount = Number((amount / memberIds.length).toFixed(2));
  const totalAssigned = baseAmount * memberIds.length;
  const delta = Number((amount - totalAssigned).toFixed(2));

  return memberIds.map((memberId, index) => ({
    memberId,
    amount: index === 0 ? Number((baseAmount + delta).toFixed(2)) : baseAmount,
  }));
};

export const calculateCustomSplit = (
  shares: ExpenseParticipantShare[],
  amount: number,
): ExpenseParticipantShare[] => {
  const total = shares.reduce((sum, share) => sum + share.amount, 0);
  if (Number(total.toFixed(2)) !== Number(amount.toFixed(2))) {
    throw new Error("Custom split does not match total amount.");
  }

  return shares.map((share) => ({
    memberId: share.memberId,
    amount: Number(share.amount.toFixed(2)),
  }));
};

export const calculatePercentageSplit = (
  amount: number,
  percentages: { memberId: string; percentage: number }[],
): ExpenseParticipantShare[] => {
  const totalPercentage = percentages.reduce((sum, item) => sum + item.percentage, 0);
  if (Number(totalPercentage.toFixed(2)) !== 100) {
    throw new Error("Percentage split must total 100.");
  }

  return percentages.map((item, index) => {
    const rawAmount = Number(((amount * item.percentage) / 100).toFixed(2));
    if (index === percentages.length - 1) {
      const assigned = percentages
        .slice(0, -1)
        .reduce((sum, current) => sum + Number(((amount * current.percentage) / 100).toFixed(2)), 0);
      return {
        memberId: item.memberId,
        amount: Number((amount - assigned).toFixed(2)),
        percentage: item.percentage,
      };
    }

    return {
      memberId: item.memberId,
      amount: rawAmount,
      percentage: item.percentage,
    };
  });
};
