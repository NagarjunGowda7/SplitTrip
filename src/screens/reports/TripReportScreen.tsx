import { useState } from "react";
import { Text } from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { ScreenContainer } from "@/components/ScreenContainer";
import { expenseCategories } from "@/constants/expenseCategories";
import { useExpenses } from "@/hooks/useExpenses";
import { useTrips } from "@/hooks/useTrips";
import { useItinerary } from "@/hooks/useItinerary";
import { useWallet } from "@/hooks/useWallet";
import { buildTripReportData, buildWalletInsights } from "@/utils/tripAnalytics";

export const TripReportScreen = () => {
  const { activeTrip } = useTrips();
  const { expenses } = useExpenses(activeTrip?.id);
  const { items } = useItinerary(activeTrip?.id);
  const { summary } = useWallet(activeTrip?.id);
  const [exporting, setExporting] = useState(false);

  if (!activeTrip) {
    return (
      <ScreenContainer contentContainerStyle={{ padding: 24, flexGrow: 1, justifyContent: "center" }}>
        <EmptyState
          icon="document-text-outline"
          title="No trip report yet"
          description="Create a trip and add expenses to unlock the summary report."
        />
      </ScreenContainer>
    );
  }

  const { balances, settlements, totalCost } = buildTripReportData({
    members: activeTrip.members,
    expenses,
    walletSummary: summary,
  });
  const walletInsights = buildWalletInsights({
    members: activeTrip.members,
    expenses,
    walletSummary: summary,
  });
  const categoryBreakdown = expenseCategories.map((category) => ({
    label: category.label,
    total: expenses
      .filter((expense) => expense.category === category.key)
      .reduce((sum, expense) => sum + expense.amount, 0),
  }));
  const visitedStops = items.filter((item) => item.visited).length;
  const itineraryStops = items.length;

  const exportPdf = async () => {
    setExporting(true);
    try {
      const html = `
        <html>
          <body style="font-family: Helvetica; padding: 28px; color: #1F2937;">
            <div style="background:#264653; color:#ffffff; padding:20px; border-radius:16px;">
              <h1 style="margin:0;">${activeTrip.name}</h1>
              <p style="margin:8px 0 0 0;">${activeTrip.destination}</p>
              <p style="margin:8px 0 0 0;">${activeTrip.startDate} to ${activeTrip.endDate}</p>
            </div>
            <h2 style="margin-top:24px;">Financial Summary</h2>
            <p>Total trip cost: ${activeTrip.currency} ${totalCost.toFixed(2)}</p>
      <p>Wallet remaining: ${activeTrip.currency} ${walletInsights.remainingBalance.toFixed(2)}</p>
            <p>Visited itinerary stops: ${visitedStops} / ${itineraryStops}</p>
            <h2 style="margin-top:20px;">Category breakdown</h2>
            <ul>${categoryBreakdown
              .map((item) => `<li>${item.label}: ${activeTrip.currency} ${item.total.toFixed(2)}</li>`)
              .join("")}</ul>
            <h2 style="margin-top:20px;">Member balances</h2>
            <ul>${balances
              .map((item) => `<li>${item.memberName}: ${activeTrip.currency} ${item.balance.toFixed(2)}</li>`)
              .join("")}</ul>
            <h2 style="margin-top:20px;">Final settlements</h2>
            <ul>${settlements.length
              ? settlements
                  .map(
                    (item) =>
                      `<li>${item.fromName} pays ${item.toName} ${activeTrip.currency} ${item.amount.toFixed(2)}</li>`,
                  )
                  .join("")
              : "<li>Everyone is already settled.</li>"}</ul>
          </body>
        </html>
      `;
      const result = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(result.uri);
    } finally {
      setExporting(false);
    }
  };

  return (
    <ScreenContainer contentContainerStyle={{ padding: 24, gap: 16 }}>
      <Text className="font-display text-3xl text-ink">Trip Report</Text>
      <Card>
        <Text className="text-sm text-slate">Total Trip Cost</Text>
        <Text className="mt-2 text-2xl font-bold text-ink">
          {activeTrip.currency} {totalCost.toFixed(2)}
        </Text>
      </Card>
      <Card>
        <Text className="text-lg font-semibold text-ink">Trip Progress</Text>
        <Text className="mt-2 text-sm text-slate">
          Visited stops: {visitedStops} / {itineraryStops}
        </Text>
        <Text className="mt-2 text-sm text-slate">
          Wallet remaining: {activeTrip.currency} {walletInsights.remainingBalance.toFixed(2)}
        </Text>
        <Text className="mt-2 text-sm text-slate">
          Wallet spent: {activeTrip.currency} {walletInsights.totalSpent.toFixed(2)}
        </Text>
      </Card>
      <Card>
        <Text className="text-lg font-semibold text-ink">Category Breakdown</Text>
        {categoryBreakdown.map((item) => (
          <Text key={item.label} className="mt-2 text-sm text-slate">
            {item.label}: {activeTrip.currency} {item.total.toFixed(2)}
          </Text>
        ))}
      </Card>
      <Card>
        <Text className="text-lg font-semibold text-ink">Member Balances</Text>
        {balances.map((item) => (
          <Text key={item.memberId} className="mt-2 text-sm text-slate">
            {item.memberName}: {activeTrip.currency} {item.balance.toFixed(2)}
          </Text>
        ))}
      </Card>
      <Card>
        <Text className="text-lg font-semibold text-ink">Final Settlements</Text>
        {settlements.length ? (
          settlements.map((item) => (
            <Text key={`${item.from}-${item.to}`} className="mt-2 text-sm text-slate">
              {item.fromName} pays {item.toName} {activeTrip.currency} {item.amount.toFixed(2)}
            </Text>
          ))
        ) : (
          <Text className="mt-2 text-sm text-slate">Everyone is already settled.</Text>
        )}
      </Card>
      <Button title="Export PDF" onPress={exportPdf} loading={exporting} />
    </ScreenContainer>
  );
};
