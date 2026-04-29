import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { CategoryBadge } from "@/components/CategoryBadge";
import { DatePickerField } from "@/components/DatePickerField";
import { EmptyState } from "@/components/EmptyState";
import { FormMessage } from "@/components/FormMessage";
import { InputField } from "@/components/InputField";
import { ReceiptPreview } from "@/components/ReceiptPreview";
import { ScreenContainer } from "@/components/ScreenContainer";
import { SelectableChip } from "@/components/SelectableChip";
import { expenseCategories } from "@/constants/expenseCategories";
import { useExpenses } from "@/hooks/useExpenses";
import { useTrips } from "@/hooks/useTrips";
import { useWallet } from "@/hooks/useWallet";
import { receiptService } from "@/services/firebase/receiptService";
import { ExpenseParticipantShare, ExpenseSplitType } from "@/types/Expense";
import {
  calculateCustomSplit,
  calculateEqualSplit,
  calculatePercentageSplit,
} from "@/utils/expenseCalculator";
import { getTodayDateInput } from "@/utils/dateHelpers";
import { buildWalletInsights } from "@/utils/tripAnalytics";
import { isPositiveNumber, isValidDateInput, normalizeDateString } from "@/utils/validation";

const splitOptions: ExpenseSplitType[] = ["equal", "custom", "percentage"];

export const AddExpenseScreen = () => {
  const { activeTrip } = useTrips();
  const { addExpense, expenses } = useExpenses(activeTrip?.id);
  const { summary } = useWallet(activeTrip?.id);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [payerId, setPayerId] = useState("");
  const [paymentSource, setPaymentSource] = useState<"personal" | "wallet">("personal");
  const [splitType, setSplitType] = useState<ExpenseSplitType>("equal");
  const [expenseDate, setExpenseDate] = useState(getTodayDateInput());
  const [notes, setNotes] = useState("");
  const [receiptUri, setReceiptUri] = useState<string | undefined>();
  const [receiptAsset, setReceiptAsset] = useState<{ uri: string; base64?: string | null }>();
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>([]);
  const [customShares, setCustomShares] = useState<Record<string, string>>({});
  const [percentageShares, setPercentageShares] = useState<Record<string, string>>({});
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const [saving, setSaving] = useState(false);

  const members = activeTrip?.members ?? [];
  const walletInsights = activeTrip
    ? buildWalletInsights({ members, expenses, walletSummary: summary })
    : summary;

  useEffect(() => {
    if (!activeTrip) return;
    if (!payerId) setPayerId(activeTrip.members[0]?.id ?? "");
    if (!selectedParticipantIds.length) {
      setSelectedParticipantIds(activeTrip.members.map((member) => member.id));
    }
  }, [activeTrip, payerId, selectedParticipantIds.length]);

  if (!activeTrip) {
    return (
      <ScreenContainer contentContainerStyle={{ padding: 24, flexGrow: 1, justifyContent: "center" }}>
        <EmptyState
          icon="receipt-outline"
          title="No trip available yet"
          description="Create a trip first. Then you can add expenses, choose who paid, and track every split cleanly."
        />
      </ScreenContainer>
    );
  }

  const toggleParticipant = (memberId: string) => {
    setSelectedParticipantIds((current) =>
      current.includes(memberId)
        ? current.filter((id) => id !== memberId)
        : [...current, memberId],
    );
  };

  const buildShares = (): ExpenseParticipantShare[] => {
    const numericAmount = Number(amount);
    if (splitType === "equal") {
      return calculateEqualSplit(numericAmount, selectedParticipantIds).map((share) => ({
        ...share,
        memberName: members.find((member) => member.id === share.memberId)?.name,
      }));
    }

    if (splitType === "custom") {
      return calculateCustomSplit(
        selectedParticipantIds.map((memberId) => ({
          memberId,
          amount: Number(customShares[memberId] ?? 0),
        })),
        numericAmount,
      ).map((share) => ({
        ...share,
        memberName: members.find((member) => member.id === share.memberId)?.name,
      }));
    }

    return calculatePercentageSplit(
      numericAmount,
      selectedParticipantIds.map((memberId) => ({
        memberId,
        percentage: Number(percentageShares[memberId] ?? 0),
      })),
    ).map((share) => ({
      ...share,
      memberName: members.find((member) => member.id === share.memberId)?.name,
    }));
  };

  const validate = () => {
    if (!title.trim()) return "Expense title is required.";
    if (!isPositiveNumber(amount)) return "Enter a valid positive amount.";
    if (!category) return "Select an expense category.";
    if (!payerId) return "Select who paid.";
    if (!selectedParticipantIds.length) return "Pick at least one participant.";
    if (!isValidDateInput(expenseDate)) return "Expense date must be in YYYY-MM-DD format.";
    if (paymentSource === "wallet" && Number(amount) > walletInsights.remainingBalance) {
      return `Group wallet only has ${activeTrip.currency} ${walletInsights.remainingBalance.toFixed(2)} left. Use personal payment or add more wallet money first.`;
    }
    try {
      buildShares();
    } catch (caught) {
      return caught instanceof Error ? caught.message : "Split values are invalid.";
    }
    return undefined;
  };

  const resetForm = () => {
    setTitle("");
    setAmount("");
    setCategory("");
    setNotes("");
    setReceiptUri(undefined);
    setReceiptAsset(undefined);
    setSplitType("equal");
    setCustomShares({});
    setPercentageShares({});
    setSelectedParticipantIds(activeTrip.members.map((member) => member.id));
    setExpenseDate(getTodayDateInput());
    setPaymentSource("personal");
  };

  const handleSave = async () => {
    const nextError = validate();
    setError(nextError);
    setSuccess(undefined);
    if (nextError) return;

    setSaving(true);
    try {
      const shares = buildShares();
      const payer = members.find((member) => member.id === payerId);
      const expenseId = `expense-${Date.now()}`;
      const receiptUrl = receiptAsset ? await receiptService.uploadReceipt(receiptAsset) : undefined;

      await addExpense({
        id: expenseId,
        tripId: activeTrip.id,
        title: title.trim(),
        amount: Number(amount),
        currency: activeTrip.currency,
        category,
        payerId,
        payerName: payer?.name ?? "Unknown payer",
        paymentSource,
        splitType,
        participantIds: selectedParticipantIds,
        shares,
        receiptUrl,
        expenseDate: normalizeDateString(expenseDate),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        notes: notes.trim() || undefined,
        synced: true,
      });
      setSuccess("Expense saved successfully.");
      resetForm();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save this expense.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer contentContainerStyle={{ padding: 24, gap: 16 }}>
      <Text className="font-display text-3xl text-ink">Add Expense</Text>
      <InputField label="Title" value={title} onChangeText={setTitle} placeholder="Seafood dinner" />
      <View className="flex-row gap-3">
        <View className="flex-1">
          <InputField
            label="Amount"
            value={amount}
            onChangeText={setAmount}
            placeholder="2450"
            keyboardType="numeric"
            autoCapitalize="none"
          />
        </View>
        <View className="flex-1">
          <View className="gap-2">
            <DatePickerField label="Expense Date" value={expenseDate} onChange={setExpenseDate} />
          </View>
        </View>
      </View>
      <Text className="text-sm font-medium text-ink">Category</Text>
      <View className="flex-row flex-wrap gap-2">
        {expenseCategories.map((item) => (
          <Pressable key={item.key} onPress={() => setCategory(item.key)}>
            <CategoryBadge label={item.label} color={item.color} selected={category === item.key} />
          </Pressable>
        ))}
      </View>
      {paymentSource === "wallet" ? (
        <Text className="text-sm text-slate">
          Available in group wallet: {activeTrip.currency} {walletInsights.remainingBalance.toFixed(2)}
        </Text>
      ) : null}

      <Text className="text-sm font-medium text-ink">Paid By</Text>
      <View className="flex-row flex-wrap gap-2">
        {members.map((member) => (
          <SelectableChip
            key={member.id}
            label={member.name}
            selected={payerId === member.id}
            onPress={() => setPayerId(member.id)}
          />
        ))}
      </View>

      <Text className="text-sm font-medium text-ink">Payment Source</Text>
      <View className="flex-row flex-wrap gap-2">
        <SelectableChip
          label="Personal"
          selected={paymentSource === "personal"}
          onPress={() => setPaymentSource("personal")}
        />
        <SelectableChip
          label="Group Wallet"
          selected={paymentSource === "wallet"}
          onPress={() => setPaymentSource("wallet")}
        />
      </View>

      <Text className="text-sm font-medium text-ink">Participants</Text>
      <View className="flex-row flex-wrap gap-2">
        {members.map((member) => (
          <SelectableChip
            key={member.id}
            label={member.name}
            selected={selectedParticipantIds.includes(member.id)}
            onPress={() => toggleParticipant(member.id)}
          />
        ))}
      </View>

      <Text className="text-sm font-medium text-ink">Split Type</Text>
      <View className="flex-row flex-wrap gap-2">
        {splitOptions.map((option) => (
          <SelectableChip
            key={option}
            label={option.toUpperCase()}
            selected={splitType === option}
            onPress={() => setSplitType(option)}
          />
        ))}
      </View>

      {splitType !== "equal" ? (
        <View className="gap-3 rounded-3xl border border-slate-200 bg-white p-4">
          {selectedParticipantIds.map((memberId) => {
            const member = members.find((entry) => entry.id === memberId);
            return (
              <InputField
                key={memberId}
                label={splitType === "custom" ? `${member?.name} Amount` : `${member?.name} %`}
                value={
                  splitType === "custom"
                    ? customShares[memberId] ?? ""
                    : percentageShares[memberId] ?? ""
                }
                onChangeText={(value) =>
                  splitType === "custom"
                    ? setCustomShares((current) => ({ ...current, [memberId]: value }))
                    : setPercentageShares((current) => ({ ...current, [memberId]: value }))
                }
                placeholder={splitType === "custom" ? "0" : "0"}
                keyboardType="numeric"
                autoCapitalize="none"
              />
            );
          })}
        </View>
      ) : null}

      <InputField
        label="Notes"
        value={notes}
        onChangeText={setNotes}
        placeholder="Dinner after cliff walk"
        multiline
      />
      <Button
        title="Attach Receipt"
        variant="secondary"
        onPress={async () => {
          try {
            const selected = await receiptService.pickReceipt();
            setReceiptUri(selected?.uri);
            setReceiptAsset(selected ?? undefined);
          } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Unable to pick receipt.");
          }
        }}
      />
      <Text className="text-xs text-slate">
        Receipts are stored inline in this free-only build, so they stay visible without Firebase Storage.
      </Text>
      <ReceiptPreview uri={receiptUri} />
      <FormMessage message={error} />
      <FormMessage message={success} tone="success" />
      <Button title="Save Expense" onPress={handleSave} loading={saving} />
    </ScreenContainer>
  );
};
