import { useEffect, useState } from "react";
import { Text } from "react-native";

import { Button } from "@/components/Button";
import { ConfirmationPanel } from "@/components/ConfirmationPanel";
import { DatePickerField } from "@/components/DatePickerField";
import { FormMessage } from "@/components/FormMessage";
import { InputField } from "@/components/InputField";
import { ScreenContainer } from "@/components/ScreenContainer";
import { TimePickerField } from "@/components/TimePickerField";
import { useItinerary } from "@/hooks/useItinerary";
import { useTrips } from "@/hooks/useTrips";
import { getTodayDateInput, getWeekdayLabel, parseTimeToMinutes } from "@/utils/dateHelpers";
import {
  isLikelyUrl,
  isValidDateInput,
  normalizeDateString,
} from "@/utils/validation";

export const AddPlaceScreen = ({ navigation, route }: any) => {
  const { activeTrip, isOwner } = useTrips();
  const { items, addItem, updateItem, deleteItem } = useItinerary(activeTrip?.id);
  const editingItem = items.find((item) => item.id === route?.params?.itemId);
  const [date, setDate] = useState(getTodayDateInput());
  const [startTime, setStartTime] = useState("");
  const [routeFrom, setRouteFrom] = useState("");
  const [endTime, setEndTime] = useState("");
  const [routeTo, setRouteTo] = useState("");
  const [distanceKm, setDistanceKm] = useState("");
  const [travelTime, setTravelTime] = useState("");
  const [timeSpent, setTimeSpent] = useState("");
  const [activity, setActivity] = useState("");
  const [notes, setNotes] = useState("");
  const [mapsLink, setMapsLink] = useState("");
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!editingItem) return;
    setDate(editingItem.date.slice(0, 10));
    setStartTime(editingItem.startTime);
    setRouteFrom(editingItem.routeFrom);
    setEndTime(editingItem.endTime);
    setRouteTo(editingItem.routeTo);
    setDistanceKm(editingItem.distanceKm ? String(editingItem.distanceKm) : "");
    setTravelTime(editingItem.travelTime ?? "");
    setTimeSpent(editingItem.timeSpent ?? "");
    setActivity(editingItem.activity);
    setNotes(editingItem.notes ?? "");
    setMapsLink(editingItem.mapsLink ?? "");
  }, [editingItem]);

  if (!activeTrip) return null;

  const validate = () => {
    if (!isValidDateInput(date)) return "Date must be in YYYY-MM-DD format.";
    if (!startTime) return "Start time is required.";
    if (!endTime) return "End time is required.";
    if (parseTimeToMinutes(endTime) <= parseTimeToMinutes(startTime)) return "End time must be after start time.";
    if (!routeFrom.trim()) return "From location is required.";
    if (!routeTo.trim()) return "To location is required.";
    if (!activity.trim()) return "Activity is required.";
    if (!isLikelyUrl(mapsLink)) return "Google Maps link must be a valid URL.";
    return undefined;
  };

  const handleSave = async () => {
    if (!isOwner) {
      setError("Only the trip creator can edit or delete itinerary items.");
      return;
    }

    const nextError = validate();
    setError(nextError);
    if (nextError) return;

    setSaving(true);
    try {
      const payload = {
        tripId: activeTrip.id,
        dayLabel: getWeekdayLabel(date),
        date: normalizeDateString(date),
        startTime: startTime.trim(),
        routeFrom: routeFrom.trim(),
        endTime: endTime.trim(),
        routeTo: routeTo.trim(),
        distanceKm: distanceKm ? Number(distanceKm) : undefined,
        travelTime: travelTime.trim() || undefined,
        timeSpent: timeSpent.trim() || undefined,
        activity: activity.trim(),
        notes: notes.trim() || undefined,
        mapsLink: mapsLink.trim() || undefined,
        visited: editingItem?.visited ?? false,
      };

      if (editingItem) {
        await updateItem(activeTrip.id, editingItem.id, payload);
      } else {
        await addItem(payload);
      }
      navigation.goBack();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save itinerary item.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editingItem) return;
    if (!isOwner) {
      setError("Only the trip creator can edit or delete itinerary items.");
      return;
    }
    setSaving(true);
    try {
      await deleteItem(activeTrip.id, editingItem.id);
      navigation.goBack();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to delete itinerary item.");
      setSaving(false);
    }
  };

  return (
    <ScreenContainer contentContainerStyle={{ padding: 24, gap: 16 }}>
      <Text className="font-display text-3xl text-ink">
        {editingItem ? "Edit Itinerary Item" : "Add Itinerary Item"}
      </Text>
      {!isOwner ? (
        <FormMessage message="Only the trip creator can edit or delete itinerary items." />
      ) : null}
      <InputField
        label="Day"
        value={getWeekdayLabel(date)}
        onChangeText={() => undefined}
        placeholder="Fri"
        editable={false}
      />
      <DatePickerField label="Date" value={date} onChange={setDate} />
      <TimePickerField label="Start Time" value={startTime} onChange={setStartTime} />
      <InputField label="From" value={routeFrom} onChangeText={setRouteFrom} placeholder="Bangalore" />
      <TimePickerField label="End Time" value={endTime} onChange={setEndTime} />
      <InputField label="To" value={routeTo} onChangeText={setRouteTo} placeholder="Salem" />
      <InputField
        label="Distance (km)"
        value={distanceKm}
        onChangeText={setDistanceKm}
        placeholder="200"
        keyboardType="numeric"
        autoCapitalize="none"
      />
      <InputField label="Travel Time" value={travelTime} onChangeText={setTravelTime} placeholder="3 hr" />
      <InputField label="Time Spent" value={timeSpent} onChangeText={setTimeSpent} placeholder="30 min" />
      <InputField label="Activity" value={activity} onChangeText={setActivity} placeholder="Dinner stop" />
      <InputField
        label="Google Maps"
        value={mapsLink}
        onChangeText={setMapsLink}
        placeholder="https://maps.google.com/..."
        autoCapitalize="none"
      />
      <InputField label="Notes" value={notes} onChangeText={setNotes} placeholder="Optional notes" multiline />
      <FormMessage message={error} />
      {editingItem && isOwner ? (
        <>
          <Button
            title={editingItem ? "Update Itinerary Item" : "Save Itinerary Item"}
            loading={saving}
            onPress={handleSave}
          />
          {confirmDelete ? (
            <ConfirmationPanel
              title="Delete Itinerary Item?"
              description="This route stop will be removed from the trip plan."
              confirmLabel="Delete Itinerary Item"
              onConfirm={handleDelete}
              onCancel={() => setConfirmDelete(false)}
              loading={saving}
            />
          ) : (
            <Button
              title="Delete Itinerary Item"
              variant="danger"
              disabled={saving}
              onPress={() => setConfirmDelete(true)}
            />
          )}
        </>
      ) : !editingItem && isOwner ? (
        <Button
          title="Save Itinerary Item"
          loading={saving}
          onPress={handleSave}
        />
      ) : null}
    </ScreenContainer>
  );
};
