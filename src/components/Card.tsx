import { ReactNode } from "react";
import { View } from "react-native";

import { appColors } from "@/constants/appColors";

export const Card = ({ children }: { children: ReactNode }) => (
  <View
    className="rounded-3xl p-4"
    style={{
      backgroundColor: appColors.surface,
      borderWidth: 1,
      borderColor: appColors.border,
      shadowColor: "#0F172A",
      shadowOpacity: 0.08,
      shadowOffset: { width: 0, height: 8 },
      shadowRadius: 16,
      elevation: 3,
    }}
  >
    {children}
  </View>
);
