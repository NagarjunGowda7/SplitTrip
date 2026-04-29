import { Text, View } from "react-native";

export const CategoryBadge = ({
  label,
  color,
  selected,
}: {
  label: string;
  color: string;
  selected?: boolean;
}) => (
  <View
    className="rounded-full px-3 py-2"
    style={{
      backgroundColor: selected ? color : `${color}20`,
      borderWidth: 1,
      borderColor: color,
    }}
  >
    <Text className="text-xs font-semibold" style={{ color: selected ? "#FFFFFF" : color }}>
      {label}
    </Text>
  </View>
);
