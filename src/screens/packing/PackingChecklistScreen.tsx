import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { FormMessage } from "@/components/FormMessage";
import { InputField } from "@/components/InputField";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useTrips } from "@/hooks/useTrips";

export const PackingChecklistScreen = () => {
  const { activeTrip, updateTrip } = useTrips();
  const [newItemTitle, setNewItemTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();
  const packedCount = useMemo(
    () => activeTrip?.packingItems.filter((item) => item.packed).length ?? 0,
    [activeTrip?.packingItems],
  );

  if (!activeTrip) {
    return (
      <ScreenContainer contentContainerStyle={{ padding: 24, flexGrow: 1, justifyContent: "center" }}>
        <EmptyState
          icon="briefcase-outline"
          title="No trip selected"
          description="Create a trip first. The shared packing list will then sync across devices for everyone in the trip."
        />
      </ScreenContainer>
    );
  }

  const togglePacked = async (itemId: string) => {
    setSaving(true);
    setError(undefined);
    try {
      await updateTrip(activeTrip.id, {
        packingItems: activeTrip.packingItems.map((item) =>
          item.id === itemId ? { ...item, packed: !item.packed } : item,
        ),
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to update checklist.");
    } finally {
      setSaving(false);
    }
  };

  const removeItem = async (itemId: string) => {
    setSaving(true);
    setError(undefined);
    try {
      await updateTrip(activeTrip.id, {
        packingItems: activeTrip.packingItems.filter((item) => item.id !== itemId),
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to remove item.");
    } finally {
      setSaving(false);
    }
  };

  const addItem = async () => {
    if (!newItemTitle.trim()) {
      setError("Packing item title is required.");
      return;
    }

    setSaving(true);
    setError(undefined);
    try {
      await updateTrip(activeTrip.id, {
        packingItems: [
          ...activeTrip.packingItems,
          {
            id: `packing-${Date.now()}`,
            title: newItemTitle.trim(),
            packed: false,
          },
        ],
      });
      setNewItemTitle("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to add packing item.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer contentContainerStyle={{ padding: 24, gap: 12 }}>
      <Text className="font-display text-3xl text-ink">Packing Checklist</Text>
      <Card>
        <Text className="text-sm text-slate">Progress</Text>
        <Text className="mt-2 text-2xl font-bold text-ink">
          {packedCount}/{activeTrip.packingItems.length} packed
        </Text>
      </Card>
      <InputField
        label="Add Item"
        value={newItemTitle}
        onChangeText={setNewItemTitle}
        placeholder="Sunscreen"
      />
      <FormMessage message={error} />
      <Button title="Add Packing Item" onPress={addItem} loading={saving} />
      {!activeTrip.packingItems.length ? (
        <EmptyState
          icon="checkbox-outline"
          title="No packing items yet"
          description="Add the essentials for the whole group here. Everyone in the same trip will see the same checklist."
        />
      ) : null}
      {activeTrip.packingItems.map((item) => (
        <Card key={item.id}>
          <View className="flex-row items-center justify-between gap-3">
            <View className="flex-1">
              <Text className="text-base font-medium text-ink">{item.title}</Text>
              <Text className="mt-1 text-sm text-slate">
                {item.packed ? "Packed" : "Pending"}
              </Text>
            </View>
            <View className="flex-row gap-2">
              <Pressable onPress={() => togglePacked(item.id)}>
                <Text className="font-semibold text-teal">{item.packed ? "Unpack" : "Packed"}</Text>
              </Pressable>
              <Pressable onPress={() => removeItem(item.id)}>
                <Text className="font-semibold text-coral">Remove</Text>
              </Pressable>
            </View>
          </View>
        </Card>
      ))}
    </ScreenContainer>
  );
};
