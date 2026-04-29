import { Text, View } from "react-native";

import { appColors } from "@/constants/appColors";

export const MemberAvatar = ({
  name,
  size = 40,
}: {
  name: string;
  size?: number;
}) => (
  <View
    className="items-center justify-center rounded-full"
    style={{ width: size, height: size, backgroundColor: appColors.secondary }}
  >
    <Text className="font-semibold text-white">{name.slice(0, 2).toUpperCase()}</Text>
  </View>
);
