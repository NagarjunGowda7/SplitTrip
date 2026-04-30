import { Image, Text, View } from "react-native";

type BrandLockupProps = {
  compact?: boolean;
  showTagline?: boolean;
  centered?: boolean;
};

export const BrandLockup = ({
  compact = false,
  showTagline = true,
  centered = false,
}: BrandLockupProps) => {
  const iconSize = compact ? 36 : 78;
  const titleSize = compact ? "text-2xl" : "text-5xl";
  const containerClass = compact
    ? `flex-row items-center gap-3 ${centered ? "justify-center" : ""}`
    : `items-center gap-4 ${centered ? "justify-center" : ""}`;

  return (
    <View className={containerClass}>
      <Image
        source={require("../../assets/icon.png")}
        style={{ width: iconSize, height: iconSize }}
        resizeMode="contain"
      />
      <View className={compact ? "justify-center" : "items-center"}>
        <View className="flex-row items-end">
          <Text className={`font-display ${titleSize} text-ink`}>Split</Text>
          <Text className={`font-display ${titleSize} text-teal`}>Trip</Text>
        </View>
        {showTagline ? (
          <Text className={`mt-1 ${compact ? "text-xs" : "text-sm"} uppercase tracking-[2px] text-slate`}>
            Travel together, split smarter
          </Text>
        ) : null}
      </View>
    </View>
  );
};
