import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { expenseCategories } from "@/constants/expenseCategories";
import { Expense } from "@/types/Expense";
import { formatDisplayDate } from "@/utils/dateHelpers";

import { Card } from "./Card";

export const ExpenseCard = ({ expense }: { expense: Expense }) => {
  const category = expenseCategories.find((item) => item.key === expense.category) ?? expenseCategories[5];

  return (
    <Card>
      <View className="flex-row items-center justify-between">
        <View className="flex-1 flex-row items-center gap-3">
          <View className="rounded-2xl p-3" style={{ backgroundColor: `${category.color}20` }}>
            <Ionicons name={category.icon as never} size={20} color={category.color} />
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-ink">{expense.title}</Text>
            <Text className="mt-1 text-sm text-slate">
              Paid by {expense.payerName} on {formatDisplayDate(expense.expenseDate)}
            </Text>
          </View>
        </View>
        <Text className="text-base font-bold text-ink">
          {expense.currency} {expense.amount.toFixed(2)}
        </Text>
      </View>
    </Card>
  );
};
