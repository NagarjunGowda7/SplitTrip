import { Text } from "react-native";

import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useExpenses } from "@/hooks/useExpenses";
import { useTrips } from "@/hooks/useTrips";
import { predictBudgetRisk } from "@/utils/budgetPredictor";
import { getTripDays } from "@/utils/dateHelpers";

export const BudgetAnalyticsScreen = () => {
  const { activeTrip } = useTrips();
  const { expenses } = useExpenses(activeTrip?.id);

  if (!activeTrip) {
    return (
      <ScreenContainer contentContainerStyle={{ padding: 24, flexGrow: 1, justifyContent: "center" }}>
        <EmptyState
          icon="pie-chart-outline"
          title="No trip selected"
          description="Create a trip first. Budget analytics will appear here after you start logging expenses."
        />
      </ScreenContainer>
    );
  }

  const spentAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const forecast = predictBudgetRisk({
    tripDays: getTripDays(activeTrip.startDate, activeTrip.endDate),
    budget: activeTrip.budget,
    spentAmount,
  });

  return (
    <ScreenContainer contentContainerStyle={{ padding: 24, gap: 16 }}>
      <Text className="font-display text-3xl text-ink">Budget Analytics</Text>
      {!expenses.length ? (
        <EmptyState
          icon="analytics-outline"
          title="No expenses recorded yet"
          description="Add a few expenses and SplitTrip will start forecasting budget risk and overspending."
        />
      ) : null}
      <Card>
        <Text className="text-sm text-slate">Budget Risk</Text>
        <Text className="mt-2 text-2xl font-bold capitalize text-ink">{forecast.budgetRisk}</Text>
      </Card>
      <Card>
        <Text className="text-sm text-slate">Projected Spend</Text>
        <Text className="mt-2 text-2xl font-bold text-ink">
          {activeTrip.currency} {forecast.projectedSpend.toFixed(2)}
        </Text>
      </Card>
      <Card>
        <Text className="text-sm text-slate">Predicted Overspend</Text>
        <Text className="mt-2 text-2xl font-bold text-ink">
          {activeTrip.currency} {forecast.predictedOverspend.toFixed(2)}
        </Text>
      </Card>
    </ScreenContainer>
  );
};
