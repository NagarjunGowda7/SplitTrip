import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { EmptyState } from "@/components/EmptyState";
import { ExpenseCard } from "@/components/ExpenseCard";
import { InputField } from "@/components/InputField";
import { ScreenContainer } from "@/components/ScreenContainer";
import { SelectableChip } from "@/components/SelectableChip";
import { expenseCategories } from "@/constants/expenseCategories";
import { useExpenses } from "@/hooks/useExpenses";
import { useTrips } from "@/hooks/useTrips";

export const ExpenseTimelineScreen = ({ navigation }: any) => {
  const { activeTrip } = useTrips();
  const { expenses } = useExpenses(activeTrip?.id);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPayer, setSelectedPayer] = useState<string>("all");
  const [searchText, setSearchText] = useState("");

  const filteredExpenses = useMemo(
    () =>
      expenses.filter((expense) => {
        const matchesCategory =
          selectedCategory === "all" || expense.category === selectedCategory;
        const matchesPayer = selectedPayer === "all" || expense.payerId === selectedPayer;
        const matchesSearch =
          !searchText.trim() ||
          expense.title.toLowerCase().includes(searchText.trim().toLowerCase());

        return matchesCategory && matchesPayer && matchesSearch;
      }),
    [expenses, searchText, selectedCategory, selectedPayer],
  );

  if (!activeTrip) {
    return (
      <ScreenContainer contentContainerStyle={{ padding: 24, flexGrow: 1, justifyContent: "center" }}>
        <EmptyState
          icon="receipt-outline"
          title="No trip selected"
          description="Create a trip first. Your full expense timeline will appear here once you start adding costs."
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer contentContainerStyle={{ padding: 20, gap: 12 }}>
      <Text className="font-display text-3xl text-ink">Expense Timeline</Text>
      <InputField
        label="Search"
        value={searchText}
        onChangeText={setSearchText}
        placeholder="Search expense title"
      />
      <Text className="text-sm font-medium text-ink">Filter by Category</Text>
      <View className="flex-row flex-wrap gap-2">
        <SelectableChip
          label="All"
          selected={selectedCategory === "all"}
          onPress={() => setSelectedCategory("all")}
        />
        {expenseCategories.map((category) => (
          <SelectableChip
            key={category.key}
            label={category.label}
            selected={selectedCategory === category.key}
            onPress={() => setSelectedCategory(category.key)}
          />
        ))}
      </View>
      <Text className="text-sm font-medium text-ink">Filter by Payer</Text>
      <View className="flex-row flex-wrap gap-2">
        <SelectableChip
          label="All"
          selected={selectedPayer === "all"}
          onPress={() => setSelectedPayer("all")}
        />
        {(activeTrip?.members ?? []).map((member) => (
          <SelectableChip
            key={member.id}
            label={member.name}
            selected={selectedPayer === member.id}
            onPress={() => setSelectedPayer(member.id)}
          />
        ))}
      </View>
      <Text className="text-sm text-slate">
        Showing {filteredExpenses.length} of {expenses.length} expenses
      </Text>
      {filteredExpenses.length ? (
        filteredExpenses.map((expense) => (
          <Pressable
            key={expense.id}
            onPress={() => navigation.navigate("ExpenseDetails", { expenseId: expense.id })}
          >
            <ExpenseCard expense={expense} />
          </Pressable>
        ))
      ) : (
        <EmptyState
          icon="search-outline"
          title={expenses.length ? "No expenses match these filters" : "No expenses added yet"}
          description={
            expenses.length
              ? "Try a different category, payer, or search term."
              : "Add your first expense to start building the trip ledger."
          }
          actionLabel={expenses.length ? undefined : "Add Expense"}
          onAction={expenses.length ? undefined : () => navigation.navigate("AddExpense")}
        />
      )}
    </ScreenContainer>
  );
};
