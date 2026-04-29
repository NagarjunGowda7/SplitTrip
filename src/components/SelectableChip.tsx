import { Pressable, Text } from "react-native";

import { appColors } from "@/constants/appColors";

export const SelectableChip = ({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) => (
  <Pressable
    onPress={onPress}
    className="rounded-full px-4 py-2"
    style={{
      backgroundColor: selected ? appColors.secondary : appColors.surface,
      borderColor: selected ? appColors.secondary : appColors.border,
      borderWidth: 1,
    }}
  >
    <Text
      className="text-sm font-semibold"
      style={{ color: selected ? "#FFFFFF" : appColors.text }}
    >
      {label}
    </Text>
  </Pressable>
);
