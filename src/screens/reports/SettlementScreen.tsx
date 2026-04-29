import { Text } from "react-native";

import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useExpenses } from "@/hooks/useExpenses";
import { useTrips } from "@/hooks/useTrips";
import { useWallet } from "@/hooks/useWallet";
import { buildMemberBalances, buildWalletInsights } from "@/utils/tripAnalytics";
import { simplifyDebts } from "@/utils/settlementEngine";

export const SettlementScreen = () => {
  const { activeTrip } = useTrips();
  const { expenses } = useExpenses(activeTrip?.id);
  const { summary } = useWallet(activeTrip?.id);

  if (!activeTrip) {
    return (
      <ScreenContainer contentContainerStyle={{ padding: 24, flexGrow: 1, justifyContent: "center" }}>
        <EmptyState
          icon="swap-horizontal-outline"
          title="No trip selected"
          description="Create a trip first and SplitTrip will calculate personal settlements here."
          actionLabel="Create Trip"
        />
      </ScreenContainer>
    );
  }

  const balances = buildMemberBalances(activeTrip.members, expenses);
  const settlements = simplifyDebts(balances);
  const walletInsights = buildWalletInsights({
    members: activeTrip.members,
    expenses,
    walletSummary: summary,
  });

  return (
    <ScreenContainer contentContainerStyle={{ padding: 24, gap: 16 }}>
      <Text className="font-display text-3xl text-ink">Smart Settlement</Text>
      <Card>
        <Text className="text-sm text-slate">
          Only personal expenses affect settlement here. Expenses paid from the group wallet stay inside shared wallet accounting.
        </Text>
      </Card>
      <Card>
        <Text className="text-lg font-semibold text-ink">Member Balances</Text>
        {balances.map((entry) => (
          <Text key={entry.memberId} className="mt-2 text-sm text-slate">
            {entry.memberName}: {activeTrip.currency} {entry.balance.toFixed(2)}
          </Text>
        ))}
      </Card>
      <Card>
        <Text className="text-lg font-semibold text-ink">Minimal Transactions</Text>
        {settlements.length ? (
          settlements.map((entry) => (
            <Text key={`${entry.from}-${entry.to}`} className="mt-2 text-sm text-slate">
              {entry.fromName} pays {entry.toName} {activeTrip.currency} {entry.amount.toFixed(2)}
            </Text>
          ))
        ) : (
          <Text className="mt-2 text-sm text-slate">Everyone is already settled.</Text>
        )}
      </Card>
      <Card>
        <Text className="text-lg font-semibold text-ink">Shared Wallet Balances</Text>
        <Text className="mt-2 text-sm text-slate">
          Positive means the member has more money in the group wallet. Negative means they have used more than they contributed and may need a return adjustment later.
        </Text>
        {walletInsights.contributions.map((entry) => (
          <Text key={entry.memberId} className="mt-2 text-sm text-slate">
            {activeTrip.members.find((member) => member.id === entry.memberId)?.name ?? entry.memberId}: {activeTrip.currency} {entry.balance.toFixed(2)}
          </Text>
        ))}
      </Card>
    </ScreenContainer>
  );
};
