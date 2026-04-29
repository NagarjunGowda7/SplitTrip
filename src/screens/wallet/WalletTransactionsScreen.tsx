import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { ConfirmationPanel } from "@/components/ConfirmationPanel";
import { DatePickerField } from "@/components/DatePickerField";
import { FormMessage } from "@/components/FormMessage";
import { InputField } from "@/components/InputField";
import { ListItem } from "@/components/ListItem";
import { SelectableChip } from "@/components/SelectableChip";
import { useTrips } from "@/hooks/useTrips";
import { useWallet } from "@/hooks/useWallet";
import { WalletTransaction } from "@/types/WalletTransaction";
import { isPositiveNumber, isValidDateInput } from "@/utils/validation";

const walletTypes: WalletTransaction["type"][] = ["add", "spend", "refund"];

export const WalletTransactionsScreen = () => {
  const { activeTrip } = useTrips();
  const { transactions, updateTransaction, deleteTransaction } = useWallet(activeTrip?.id);
  const [editingId, setEditingId] = useState<string>();
  const [type, setType] = useState<WalletTransaction["type"]>("add");
  const [memberId, setMemberId] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [transactionDate, setTransactionDate] = useState("");
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const members = activeTrip?.members ?? [];
  const editingTransaction = transactions.find((item) => item.id === editingId);

  useEffect(() => {
    if (!editingTransaction) return;
    setType(editingTransaction.type);
    setMemberId(editingTransaction.memberId);
    setAmount(String(editingTransaction.amount));
    setNote(editingTransaction.note ?? "");
    setTransactionDate(editingTransaction.transactionDate);
  }, [editingTransaction]);

  if (!activeTrip) return null;

  const validate = () => {
    if (!memberId) return "Select a member.";
    if (!isPositiveNumber(amount)) return "Enter a valid amount.";
    if (!isValidDateInput(transactionDate)) return "Transaction date must be YYYY-MM-DD.";
    return undefined;
  };

  const handleUpdate = async () => {
    if (!editingTransaction) return;
    const nextError = validate();
    setError(nextError);
    if (nextError) return;

    setSaving(true);
    try {
      const member = members.find((entry) => entry.id === memberId);
      await updateTransaction(activeTrip.id, editingTransaction.id, {
        type,
        memberId,
        memberName: member?.name ?? editingTransaction.memberName,
        amount: Number(amount),
        note: note.trim() || undefined,
        transactionDate,
      });
      setEditingId(undefined);
      setError(undefined);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to update transaction.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editingTransaction) return;
    setSaving(true);
    try {
      await deleteTransaction(activeTrip.id, editingTransaction.id);
      setEditingId(undefined);
      setError(undefined);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to delete transaction.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-sand" contentContainerStyle={{ padding: 24, gap: 12 }}>
      <Text className="font-display text-3xl text-ink">Wallet Transactions</Text>
      {editingTransaction ? (
        <View className="gap-4 rounded-3xl border border-slate-200 bg-white p-4">
          <Text className="text-lg font-semibold text-ink">Edit Transaction</Text>
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
          <View className="flex-row flex-wrap gap-2">
            {members.map((member) => (
              <SelectableChip
                key={member.id}
                label={member.name}
                selected={memberId === member.id}
                onPress={() => setMemberId(member.id)}
              />
            ))}
          </View>
          <InputField
            label="Amount"
            value={amount}
            onChangeText={setAmount}
            placeholder="0"
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
          <InputField label="Note" value={note} onChangeText={setNote} placeholder="Note" multiline />
          <FormMessage message={error} />
          <Button title="Update Transaction" onPress={handleUpdate} loading={saving} />
          {confirmDelete ? (
            <ConfirmationPanel
              title="Delete Transaction?"
              description="This wallet entry will be removed and the summary totals will be recalculated."
              confirmLabel="Delete Transaction"
              onConfirm={handleDelete}
              onCancel={() => setConfirmDelete(false)}
              loading={saving}
            />
          ) : (
            <Button title="Delete Transaction" variant="danger" onPress={() => setConfirmDelete(true)} disabled={saving} />
          )}
          <Button title="Cancel" variant="secondary" onPress={() => setEditingId(undefined)} disabled={saving} />
        </View>
      ) : null}
      {transactions.map((item) => (
        <Pressable key={item.id} onPress={() => setEditingId(item.id)}>
          <ListItem
            title={`${item.memberName} | ${item.type.toUpperCase()}`}
            subtitle={item.note ?? item.transactionDate ?? item.createdAt}
            rightContent={
              <Text className="font-semibold text-ink">
                {activeTrip.currency} {item.amount.toFixed(2)}
              </Text>
            }
          />
        </Pressable>
      ))}
    </ScrollView>
  );
};
