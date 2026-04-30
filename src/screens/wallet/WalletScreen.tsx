import { useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { DatePickerField } from "@/components/DatePickerField";
import { EmptyState } from "@/components/EmptyState";
import { FormMessage } from "@/components/FormMessage";
import { InputField } from "@/components/InputField";
import { ScreenContainer } from "@/components/ScreenContainer";
import { SelectableChip } from "@/components/SelectableChip";
import { useExpenses } from "@/hooks/useExpenses";
import { useTrips } from "@/hooks/useTrips";
import { useWallet } from "@/hooks/useWallet";
import { WalletTransaction } from "@/types/WalletTransaction";
import { getTodayDateInput } from "@/utils/dateHelpers";
import { buildWalletInsights } from "@/utils/tripAnalytics";
import { isPositiveNumber, isValidDateInput } from "@/utils/validation";

const walletTypes: WalletTransaction["type"][] = ["add", "spend", "refund"];

export const WalletScreen = ({ navigation }: any) => {
  const { activeTrip } = useTrips();
  const { summary, addTransaction, transactions } = useWallet(activeTrip?.id);
  const { expenses } = useExpenses(activeTrip?.id);
  const [type, setType] = useState<WalletTransaction["type"]>("add");
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [transactionDate, setTransactionDate] = useState(getTodayDateInput());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();

  const members = useMemo(() => activeTrip?.members ?? [], [activeTrip?.members]);
  useEffect(() => {
    if (!selectedMemberIds.length && members.length) {
      setSelectedMemberIds([members[0].id]);
    }
  }, [selectedMemberIds.length, members]);
  useEffect(() => {
    if (type === "spend" && selectedMemberIds.length > 1) {
      setSelectedMemberIds((current) => current.slice(0, 1));
    }
  }, [selectedMemberIds.length, type]);

  if (!activeTrip) {
    return (
      <ScreenContainer contentContainerStyle={{ padding: 24, flexGrow: 1, justifyContent: "center" }}>
        <EmptyState
          icon="wallet-outline"
          title="No trip selected"
          description="Create a trip first. Then you can collect contributions and track shared wallet spending here."
        />
      </ScreenContainer>
    );
  }
  const walletInsights = buildWalletInsights({
    members,
    expenses,
    walletSummary: summary,
  });

  const multiSelectEnabled = type === "add" || type === "refund";

  const toggleMember = (memberId: string) => {
    setSelectedMemberIds((current) => {
      if (!multiSelectEnabled) {
        return [memberId];
      }

      return current.includes(memberId)
        ? current.filter((entry) => entry !== memberId)
        : [...current, memberId];
    });
  };

  const validate = () => {
    if (!selectedMemberIds.length) return "Select at least one member.";
    if (!isPositiveNumber(amount)) return "Enter a valid wallet amount.";
    if (!isValidDateInput(transactionDate)) return "Transaction date must be YYYY-MM-DD.";
    return undefined;
  };

  const handleSave = async () => {
    const nextError = validate();
    setError(nextError);
    setSuccess(undefined);
    if (nextError) return;

    setSaving(true);
    try {
      const targetMemberIds = multiSelectEnabled ? selectedMemberIds : [selectedMemberIds[0]];

      for (const memberId of targetMemberIds) {
        const member = members.find((item) => item.id === memberId);
        await addTransaction({
          tripId: activeTrip.id,
          type,
          memberId,
          memberName: member?.name ?? "Unknown member",
          amount: Number(amount),
          note: note.trim() || undefined,
          transactionDate,
        });
      }

      setSuccess(
        targetMemberIds.length > 1
          ? `${targetMemberIds.length} wallet transactions saved.`
          : "Wallet transaction saved.",
      );
      setAmount("");
      setNote("");
      setType("add");
      setSelectedMemberIds(members[0] ? [members[0].id] : []);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save wallet transaction.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer contentContainerStyle={{ padding: 24, gap: 16 }}>
      <Text className="font-display text-3xl text-ink">Group Wallet</Text>
      <View className="flex-row gap-3">
        <View className="flex-1">
          <Card>
            <Text className="text-sm text-slate">Total Wallet</Text>
            <Text className="mt-2 text-xl font-bold text-ink">
              {activeTrip.currency} {walletInsights.totalWallet.toFixed(2)}
            </Text>
          </Card>
        </View>
        <View className="flex-1">
          <Card>
            <Text className="text-sm text-slate">Total Spent</Text>
            <Text className="mt-2 text-xl font-bold text-ink">
              {activeTrip.currency} {walletInsights.totalSpent.toFixed(2)}
            </Text>
          </Card>
        </View>
      </View>
      <Card>
        <Text className="text-sm text-slate">Remaining Balance</Text>
        <Text className="mt-2 text-2xl font-bold text-ink">
          {activeTrip.currency} {walletInsights.remainingBalance.toFixed(2)}
        </Text>
        <Text className="mt-2 text-sm text-slate">
          Wallet-paid expenses are deducted from the shared wallet total automatically.
        </Text>
      </Card>

      <Card>
        <Text className="text-lg font-semibold text-ink">Add Wallet Transaction</Text>
        <View className="mt-4 gap-4">
          <View className="flex-row flex-wrap gap-2">
            {walletTypes.map((option) => (
              <SelectableChip
                key={option}
                label={option.toUpperCase()}
                selected={type === option}
                onPress={() => setType(option)}
              />
            ))}
          </View>
          <Text className="text-sm font-medium text-ink">
            {multiSelectEnabled ? "Members" : "Member"}
          </Text>
          {multiSelectEnabled ? (
            <Text className="text-xs text-slate">
              Apply the same amount to multiple members in one step.
            </Text>
          ) : null}
          <View className="flex-row flex-wrap gap-2">
            {members.map((member) => (
              <SelectableChip
                key={member.id}
                label={member.name}
                selected={selectedMemberIds.includes(member.id)}
                onPress={() => toggleMember(member.id)}
              />
            ))}
          </View>
          <InputField
            label="Amount"
            value={amount}
            onChangeText={setAmount}
            placeholder="5000"
            keyboardType="numeric"
            autoCapitalize="none"
          />
          <View className="gap-2">
            <DatePickerField
              label="Transaction Date"
              value={transactionDate}
              onChange={setTransactionDate}
            />
          </View>
          <InputField
            label="Note"
            value={note}
            onChangeText={setNote}
            placeholder="Hotel deposit"
            multiline
          />
          <FormMessage message={error} />
          <FormMessage message={success} tone="success" />
          <Button title="Save Wallet Transaction" onPress={handleSave} loading={saving} />
        </View>
      </Card>

      <Button
        title={`View Transactions (${transactions.length})`}
        variant="secondary"
        onPress={() => navigation.navigate("WalletTransactions")}
      />

      {!walletInsights.contributions.length ? (
        <EmptyState
          icon="cash-outline"
          title="No wallet contributions yet"
          description="Add who has put money into the shared wallet. Wallet-paid expenses will reduce the common balance automatically."
        />
      ) : null}
      {walletInsights.contributions.map((item) => {
        const member = members.find((entry) => entry.id === item.memberId);
        return (
          <Card key={item.memberId}>
            <Text className="text-base font-semibold text-ink">{member?.name ?? item.memberId}</Text>
            <Text className="mt-1 text-sm text-slate">
              Added {item.amountAdded.toFixed(2)} | Shared spend {item.amountSpent.toFixed(2)} | Balance{" "}
              {item.balance.toFixed(2)}
            </Text>
          </Card>
        );
      })}
    </ScreenContainer>
  );
};
