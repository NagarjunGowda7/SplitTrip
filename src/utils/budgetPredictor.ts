export interface BudgetPredictionInput {
  tripDays: number;
  budget: number;
  spentAmount: number;
  elapsedDays?: number;
}

export interface BudgetPredictionResult {
  budgetRisk: "safe" | "watch" | "high";
  predictedOverspend: number;
  projectedSpend: number;
}

export const predictBudgetRisk = ({
  tripDays,
  budget,
  spentAmount,
  elapsedDays,
}: BudgetPredictionInput): BudgetPredictionResult => {
  const daysCompleted = Math.max(elapsedDays ?? Math.ceil(tripDays / 2), 1);
  const dailyBurn = spentAmount / daysCompleted;
  const projectedSpend = Number((dailyBurn * tripDays).toFixed(2));
  const predictedOverspend = Number(Math.max(projectedSpend - budget, 0).toFixed(2));

  const budgetRisk =
    projectedSpend <= budget * 0.85 ? "safe" : projectedSpend <= budget ? "watch" : "high";

  return {
    budgetRisk,
    projectedSpend,
    predictedOverspend,
  };
};
