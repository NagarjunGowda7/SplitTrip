import { useState } from "react";
import * as DocumentPicker from "expo-document-picker";
import { Linking, Pressable, Switch, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { FormMessage } from "@/components/FormMessage";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useItinerary } from "@/hooks/useItinerary";
import { useTrips } from "@/hooks/useTrips";
import { itineraryService } from "@/services/firebase/itineraryService";
import { compareItineraryOrder, formatItineraryTime } from "@/utils/dateHelpers";
import { ParsedItineraryRow, parseItineraryWorkbookDetailed } from "@/utils/excelParser";

export const ItineraryScreen = ({ navigation }: any) => {
  const { activeTrip } = useTrips();
  const { items, markVisited } = useItinerary(activeTrip?.id);
  const [statusMessage, setStatusMessage] = useState<string>();
  const [error, setError] = useState<string>();
  const [pendingImport, setPendingImport] = useState<ParsedItineraryRow[]>([]);

  if (!activeTrip) {
    return (
      <ScreenContainer contentContainerStyle={{ padding: 24, flexGrow: 1, justifyContent: "center" }}>
        <EmptyState
          icon="map-outline"
          title="No trip selected"
          description="Create a trip first. Then add itinerary rows manually or import your spreadsheet."
        />
      </ScreenContainer>
    );
  }

  const handleImport = async () => {
    setError(undefined);
    setStatusMessage(undefined);

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/vnd.ms-excel",
        ],
      });
      if (result.canceled) return;

      const parsed = await parseItineraryWorkbookDetailed(
        result.assets[0].uri,
        activeTrip.id,
        activeTrip.startDate,
      );
      setPendingImport(parsed);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to import itinerary right now.");
    }
  };

  const confirmImport = async () => {
    setError(undefined);
    setStatusMessage(undefined);
    try {
      for (const parsed of pendingImport) {
        const { id: _id, createdAt: _createdAt, ...payload } = parsed.item;
        await itineraryService.addItem(payload);
      }
      setStatusMessage(`${pendingImport.length} itinerary items imported.`);
      setPendingImport([]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to import itinerary right now.");
    }
  };

  const groupedItems = items.slice().sort(compareItineraryOrder);

  return (
    <ScreenContainer contentContainerStyle={{ padding: 24, gap: 16 }}>
      <Text className="font-display text-3xl text-ink">Itinerary</Text>
      <Button title="Add Itinerary Item" onPress={() => navigation.navigate("AddPlace")} />
      <Button title="Import Excel" variant="secondary" onPress={handleImport} />
      <FormMessage message={error} />
      <FormMessage message={statusMessage} tone="success" />
      {pendingImport.length ? (
        <Card>
          <Text className="text-lg font-semibold text-ink">Import Preview</Text>
          <Text className="mt-2 text-sm text-slate">
            Review parsed rows before saving them to the trip.
          </Text>
          <View className="mt-4 gap-3">
            {pendingImport.slice(0, 6).map((entry) => (
              <View key={entry.item.id} className="rounded-2xl border border-slate-200 p-3">
                <Text className="text-sm font-semibold text-ink">
                  Row {entry.sourceIndex + 2}: {entry.item.routeFrom} to {entry.item.routeTo}
                </Text>
                <Text className="mt-1 text-sm text-slate">
                  {entry.item.date} | {formatItineraryTime(entry.item.startTime)} - {formatItineraryTime(entry.item.endTime)}
                </Text>
                <Text className="mt-1 text-sm text-slate">{entry.item.activity}</Text>
                {entry.warnings.length ? (
                  <Text className="mt-2 text-sm text-coral">
                    Warnings: {entry.warnings.join(", ")}
                  </Text>
                ) : (
                  <Text className="mt-2 text-sm text-teal">Looks good</Text>
                )}
              </View>
            ))}
            {pendingImport.length > 6 ? (
              <Text className="text-sm text-slate">
                {pendingImport.length - 6} more rows ready to import.
              </Text>
            ) : null}
            <Button title="Confirm Import" onPress={confirmImport} />
            <Button title="Cancel Import" variant="secondary" onPress={() => setPendingImport([])} />
          </View>
        </Card>
      ) : null}
      {groupedItems.length ? groupedItems.map((item) => (
        <Pressable key={item.id} onPress={() => navigation.navigate("AddPlace", { itemId: item.id })}>
          <Card>
            <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-semibold uppercase tracking-widest text-slate">
                {item.dayLabel || item.date}
              </Text>
              <Switch
                value={item.visited}
                onValueChange={(value) => markVisited(activeTrip.id, item.id, value)}
              />
            </View>
            <Text className="text-lg font-semibold text-ink">
              {item.routeFrom} to {item.routeTo}
            </Text>
            <Text className="text-sm text-slate">
              {item.date} | {formatItineraryTime(item.startTime)} - {formatItineraryTime(item.endTime)}
            </Text>
            <Text className="text-sm text-slate">{item.activity}</Text>
            <Text className="text-sm text-slate">
              Distance {item.distanceKm ?? 0} km | Travel {item.travelTime ?? "-"} | Time spent{" "}
              {item.timeSpent ?? "-"}
            </Text>
            {item.mapsLink ? (
              <Pressable onPress={() => Linking.openURL(item.mapsLink!)}>
                <Text className="text-sm font-medium text-teal">Open Google Maps</Text>
              </Pressable>
            ) : null}
            </View>
          </Card>
        </Pressable>
      )) : (
        <EmptyState
          icon="trail-sign-outline"
          title="No itinerary items yet"
          description="Add your first route stop manually or import your trip sheet. SplitTrip will sort the plan by date and time automatically."
          actionLabel="Add Itinerary Item"
          onAction={() => navigation.navigate("AddPlace")}
        />
      )}
    </ScreenContainer>
  );
};
