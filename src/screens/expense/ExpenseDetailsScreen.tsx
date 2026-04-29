import { useEffect, useState } from "react";
import { Text, View } from "react-native";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { ConfirmationPanel } from "@/components/ConfirmationPanel";
import { DatePickerField } from "@/components/DatePickerField";
import { FormMessage } from "@/components/FormMessage";
import { InputField } from "@/components/InputField";
import { ReceiptPreview } from "@/components/ReceiptPreview";
import { ScreenContainer } from "@/components/ScreenContainer";
import { SelectableChip } from "@/components/SelectableChip";
import { expenseCategories } from "@/constants/expenseCategories";
import { useExpenses } from "@/hooks/useExpenses";
import { useTrips } from "@/hooks/useTrips";
import { isPositiveNumber, isValidDateInput } from "@/utils/validation";

export const ExpenseDetailsScreen = ({ route, navigation }: any) => {
  const { activeTrip } = useTrips();
  const { expenses, updateExpense, deleteExpense } = useExpenses(activeTrip?.id);
  const expense = expenses.find((item) => item.id === route.params?.expenseId) ?? expenses[0];
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState("");
  const [notes, setNotes] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!expense) return;
    setTitle(expense.title);
    setAmount(String(expense.amount));
    setExpenseDate(expense.expenseDate.slice(0, 10));
    setNotes(expense.notes ?? "");
    setCategory(expense.category);
  }, [expense]);

  if (!expense || !activeTrip) {
    return (
      <View className="flex-1 items-center justify-center bg-sand">
        <Text className="text-slate">No expense selected.</Text>
      </View>
    );
  }

  const handleUpdate = async () => {
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!isPositiveNumber(amount)) {
      setError("Amount must be positive.");
      return;
    }
    if (!category) {
      setError("Category is required.");
      return;
    }
    if (!isValidDateInput(expenseDate)) {
      setError("Expense date must be YYYY-MM-DD.");
      return;
    }

    setError(undefined);
    setSuccess(undefined);
    setSaving(true);
    try {
      await updateExpense(activeTrip.id, expense.id, {
        title: title.trim(),
        amount: Number(amount),
        category,
        expenseDate,
        notes: notes.trim() || undefined,
      });
      setSuccess("Expense updated.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to update expense.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setError(undefined);
    setSuccess(undefined);
    setSaving(true);
    try {
      await deleteExpense(activeTrip.id, expense.id);
      navigation.goBack();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to delete expense.");
      setSaving(false);
    }
  };

  return (
    <ScreenContainer contentContainerStyle={{ padding: 24, gap: 16 }}>
      <Text className="font-display text-3xl text-ink">Expense Details</Text>
      <InputField label="Title" value={title} onChangeText={setTitle} placeholder="Expense title" />
      <View className="flex-row gap-3">
        <View className="flex-1">
          <InputField
            label="Amount"
            value={amount}
            onChangeText={setAmount}
            placeholder="0"
            keyboardType="numeric"
            autoCapitalize="none"
          />
        </View>
        <View className="flex-1">
          <View className="gap-2">
            <DatePickerField label="Date" value={expenseDate} onChange={setExpenseDate} />
          </View>
        </View>
      </View>
      <Text className="text-sm font-medium text-ink">Category</Text>
      <View className="flex-row flex-wrap gap-2">
        {expenseCategories.map((item) => (
          <SelectableChip
            key={item.key}
            label={item.label}
            selected={category === item.key}
            onPress={() => setCategory(item.key)}
          />
        ))}
      </View>
      <Card>
        <Text className="text-sm text-slate">Paid by</Text>
        <Text className="mt-2 text-base font-semibold text-ink">{expense.payerName}</Text>
      </Card>
      <InputField label="Notes" value={notes} onChangeText={setNotes} placeholder="Notes" multiline />
      <Card>
        <Text className="text-lg font-semibold text-ink">Split Details</Text>
        <View className="mt-3 gap-2">
          {expense.shares.map((share) => (
            <Text key={share.memberId} className="text-sm text-slate">
              {share.memberName ?? share.memberId}: {expense.currency} {share.amount.toFixed(2)}
            </Text>
          ))}
        </View>
      </Card>
      <ReceiptPreview uri={expense.receiptUrl} />
      <FormMessage message={error} />
      <FormMessage message={success} tone="success" />
      <Button title="Update Expense" onPress={handleUpdate} loading={saving} />
      {confirmDelete ? (
        <ConfirmationPanel
          title="Delete Expense?"
          description="This expense will be removed from totals and settlement calculations."
          confirmLabel="Delete Expense"
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(false)}
          loading={saving}
        />
      ) : (
        <Button title="Delete Expense" variant="danger" onPress={() => setConfirmDelete(true)} disabled={saving} />
      )}
    </ScreenContainer>
  );
};
