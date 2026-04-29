import { useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";

import { Button } from "@/components/Button";
import { DatePickerField } from "@/components/DatePickerField";
import { FormMessage } from "@/components/FormMessage";
import { InputField } from "@/components/InputField";
import { MemberEditorRow, EditableMember } from "@/components/MemberEditorRow";
import { ScreenContainer } from "@/components/ScreenContainer";
import { SelectableChip } from "@/components/SelectableChip";
import { useAuth } from "@/hooks/useAuth";
import { useTrips } from "@/hooks/useTrips";
import { TripMember } from "@/types/Trip";
import { getTodayDateInput } from "@/utils/dateHelpers";
import { isNonNegativeNumber, isValidDateInput } from "@/utils/validation";

const supportedCurrencies = ["INR", "USD", "EUR", "GBP", "AED"];

const emptyMember = (seed: number): EditableMember => ({
  id: `member-${Date.now()}-${seed}`,
  name: "",
  email: "",
});

export const CreateTripScreen = ({ navigation, route }: any) => {
  const { user } = useAuth();
  const { trips, createTrip, updateTrip } = useTrips();
  const editingTrip = useMemo(
    () => trips.find((trip) => trip.id === route?.params?.tripId),
    [route?.params?.tripId, trips],
  );

  const [name, setName] = useState("");
  const [destination, setDestination] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("0");
  const [notes, setNotes] = useState("");
  const [members, setMembers] = useState<EditableMember[]>([emptyMember(0)]);
  const [bulkMembers, setBulkMembers] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();

  useEffect(() => {
    if (editingTrip) {
      setName(editingTrip.name);
      setDestination(editingTrip.destination);
      setCurrency(editingTrip.currency);
      setStartDate(editingTrip.startDate.slice(0, 10));
      setEndDate(editingTrip.endDate.slice(0, 10));
      setBudget(String(editingTrip.budget));
      setNotes(editingTrip.notes ?? "");
      setMembers(
        editingTrip.members.map((member, index) => ({
          id: member.id || `member-${index}`,
          name: member.name,
          email: member.email ?? "",
        })),
      );
    } else if (user) {
      setMembers([
        {
          id: user.id,
          name: user.displayName,
          email: user.email,
        },
      ]);
      const today = getTodayDateInput();
      setStartDate(today);
      setEndDate(today);
    }
  }, [editingTrip, user]);

  const validate = () => {
    if (!name.trim()) return "Trip name is required.";
    if (!destination.trim()) return "Destination is required.";
    if (!currency.trim()) return "Currency is required.";
    if (!isValidDateInput(startDate)) return "Start date must be in YYYY-MM-DD format.";
    if (!isValidDateInput(endDate)) return "End date must be in YYYY-MM-DD format.";
    if (endDate < startDate) return "End date cannot be before the start date.";
    if (!isNonNegativeNumber(budget)) return "Budget must be a valid number.";
    if (!members.length) return "Add at least one member.";
    if (members.some((member) => !member.name.trim())) return "Every member needs a name.";
    return undefined;
  };

  const toTripMembers = (): TripMember[] =>
    members.map((member, index) => ({
      id:
        editingTrip?.members[index]?.id ||
        member.id ||
        `${member.name.trim().toLowerCase().replace(/\s+/g, "-")}-${index}`,
      name: member.name.trim(),
      email: member.email.trim() || undefined,
      role: index === 0 ? "owner" : "member",
    }));

  const addBulkMembers = () => {
    const parsedEntries = bulkMembers
      .split(/\r?\n|,/)
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry, index) => {
        const [namePart, emailPart] = entry.split("|").map((value) => value.trim());
        return {
          id: `member-bulk-${Date.now()}-${index}`,
          name: namePart,
          email: emailPart ?? "",
        };
      })
      .filter((entry) => entry.name);

    if (!parsedEntries.length) {
      setError("Add names separated by commas or new lines. Optional email format: Name | email@example.com");
      return;
    }

    setMembers((current) => [...current, ...parsedEntries]);
    setBulkMembers("");
    setError(undefined);
  };

  const handleSubmit = async () => {
    const nextError = validate();
    setError(nextError);
    setSuccess(undefined);
    if (nextError) return;

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        destination: destination.trim(),
        currency: currency.trim().toUpperCase(),
        startDate,
        endDate,
        createdBy: user?.id ?? "unknown",
        members: toTripMembers(),
        budget: Number(budget),
        walletBalance: editingTrip?.walletBalance ?? 0,
        totalSpent: editingTrip?.totalSpent ?? 0,
        notes: notes.trim() || undefined,
        packingItems:
          editingTrip?.packingItems ?? [
            { id: "packing-passport", title: "Passport", packed: false },
            { id: "packing-charger", title: "Charger", packed: false },
            { id: "packing-tickets", title: "Tickets", packed: false },
          ],
        memories: editingTrip?.memories ?? [],
        status: editingTrip?.status ?? "active",
      };

      if (editingTrip) {
        await updateTrip(editingTrip.id, payload);
        setSuccess("Trip updated.");
      } else {
        await createTrip(payload);
        setSuccess("Trip created.");
      }

      navigation.goBack();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save trip right now.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer contentContainerStyle={{ padding: 24, gap: 16 }}>
      <Text className="font-display text-3xl text-ink">
        {editingTrip ? "Edit Trip" : "Create a Trip"}
      </Text>
      <InputField label="Trip Name" value={name} onChangeText={setName} placeholder="Kerala Escape" />
      <InputField
        label="Destination"
        value={destination}
        onChangeText={setDestination}
        placeholder="Kerala, India"
      />
      <View className="flex-row gap-3">
        <View className="flex-1 gap-2">
          <DatePickerField label="Start Date" value={startDate} onChange={setStartDate} />
        </View>
        <View className="flex-1 gap-2">
          <DatePickerField label="End Date" value={endDate} onChange={setEndDate} />
        </View>
      </View>
      <View className="flex-row gap-3">
        <View className="flex-1">
          <Text className="mb-2 text-sm font-medium text-ink">Currency</Text>
          <View className="flex-row flex-wrap gap-2">
            {supportedCurrencies.map((item) => (
              <SelectableChip
                key={item}
                label={item}
                selected={currency === item}
                onPress={() => setCurrency(item)}
              />
            ))}
          </View>
        </View>
        <View className="flex-1">
          <InputField
            label="Budget"
            value={budget}
            onChangeText={setBudget}
            placeholder="45000"
            keyboardType="numeric"
            autoCapitalize="none"
          />
        </View>
      </View>
      <InputField
        label="Notes"
        value={notes}
        onChangeText={setNotes}
        placeholder="Family drive, beach stay, and temple visits"
        multiline
      />
      <View className="gap-3">
        <Text className="text-lg font-semibold text-ink">Members</Text>
        <InputField
          label="Quick Add Members"
          value={bulkMembers}
          onChangeText={setBulkMembers}
          placeholder={"Asha\nRavi | ravi@email.com\nNeha"}
          multiline
        />
        <Button title="Add Bulk Members" variant="secondary" onPress={addBulkMembers} />
        {members.map((member, index) => (
          <MemberEditorRow
            key={member.id}
            member={member}
            index={index}
            disableRemove={members.length === 1}
            onChange={(patch) =>
              setMembers((current) =>
                current.map((entry) => (entry.id === member.id ? { ...entry, ...patch } : entry)),
              )
            }
            onRemove={() =>
              setMembers((current) => current.filter((entry) => entry.id !== member.id))
            }
          />
        ))}
        <Button
          title="Add Member"
          variant="secondary"
          onPress={() => setMembers((current) => [...current, emptyMember(current.length)])}
        />
      </View>
      <FormMessage message={error} />
      <FormMessage message={success} tone="success" />
      <Button title={editingTrip ? "Update Trip" : "Save Trip"} onPress={handleSubmit} loading={saving} />
    </ScreenContainer>
  );
};
