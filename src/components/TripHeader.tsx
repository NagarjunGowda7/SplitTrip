import { Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { Trip } from "@/types/Trip";
import { formatDisplayDate } from "@/utils/dateHelpers";

export const TripHeader = ({
  trip,
  onEdit,
}: {
  trip: Trip;
  onEdit?: () => void;
}) => (
  <LinearGradient
    colors={["#264653", "#2A9D8F"]}
    className="rounded-[28px] p-5"
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
  >
    <View className="flex-row items-start justify-between">
      <View className="flex-1 pr-4">
        <Text className="font-display text-3xl text-white">{trip.name}</Text>
        <Text className="mt-2 text-sm text-white/85">{trip.destination}</Text>
      </View>
      {onEdit ? (
        <Pressable onPress={onEdit} className="rounded-full bg-white/15 p-3">
          <Ionicons name="create-outline" size={18} color="#FFFFFF" />
        </Pressable>
      ) : null}
    </View>
    <View className="mt-5 flex-row justify-between">
      <View>
        <Text className="text-xs uppercase tracking-widest text-white/60">Dates</Text>
        <Text className="mt-1 text-sm text-white">
          {formatDisplayDate(trip.startDate)} - {formatDisplayDate(trip.endDate)}
        </Text>
      </View>
      <View>
        <Text className="text-xs uppercase tracking-widest text-white/60">Budget</Text>
        <Text className="mt-1 text-sm text-white">
          {trip.currency} {trip.budget.toFixed(2)}
        </Text>
      </View>
    </View>
  </LinearGradient>
);
