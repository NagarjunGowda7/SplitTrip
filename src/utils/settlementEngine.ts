export interface BalanceEntry {
  memberId: string;
  memberName: string;
  balance: number;
}

export interface SettlementTransaction {
  from: string;
  fromName: string;
  to: string;
  toName: string;
  amount: number;
}

export const simplifyDebts = (balances: BalanceEntry[]): SettlementTransaction[] => {
  const creditors = balances
    .filter((entry) => entry.balance > 0.009)
    .map((entry) => ({ ...entry, balance: Number(entry.balance.toFixed(2)) }))
    .sort((a, b) => b.balance - a.balance);

  const debtors = balances
    .filter((entry) => entry.balance < -0.009)
    .map((entry) => ({ ...entry, balance: Math.abs(Number(entry.balance.toFixed(2))) }))
    .sort((a, b) => b.balance - a.balance);

  const settlements: SettlementTransaction[] = [];
  let creditorIndex = 0;
  let debtorIndex = 0;

  while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
    const creditor = creditors[creditorIndex];
    const debtor = debtors[debtorIndex];
    const amount = Number(Math.min(creditor.balance, debtor.balance).toFixed(2));

    settlements.push({
      from: debtor.memberId,
      fromName: debtor.memberName,
      to: creditor.memberId,
      toName: creditor.memberName,
      amount,
    });

    creditor.balance = Number((creditor.balance - amount).toFixed(2));
    debtor.balance = Number((debtor.balance - amount).toFixed(2));

    if (creditor.balance <= 0.009) creditorIndex += 1;
    if (debtor.balance <= 0.009) debtorIndex += 1;
  }

  return settlements;
};
