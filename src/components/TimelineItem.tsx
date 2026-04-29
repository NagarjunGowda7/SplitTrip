import { Text, View } from "react-native";

import { appColors } from "@/constants/appColors";

export const TimelineItem = ({
  title,
  subtitle,
  date,
  badge,
}: {
  title: string;
  subtitle: string;
  date: string;
  badge?: string;
}) => (
  <View className="flex-row gap-3 pb-6">
    <View className="relative items-center" style={{ width: 18 }}>
      <View className="h-3 w-3 rounded-full" style={{ backgroundColor: appColors.primary }} />
      <View
        className="absolute"
        style={{
          top: 14,
          bottom: -24,
          width: 1,
          backgroundColor: appColors.border,
        }}
      />
    </View>
    <View className="flex-1">
      <Text className="text-sm text-slate">{date}</Text>
      {badge ? (
        <View className="mt-2 self-start rounded-full bg-teal/10 px-3 py-1">
          <Text className="text-xs font-semibold uppercase tracking-widest text-teal">{badge}</Text>
        </View>
      ) : null}
      <Text className="mt-1 text-base font-semibold text-ink">{title}</Text>
      <Text className="mt-1 text-sm text-slate">{subtitle}</Text>
    </View>
  </View>
);
