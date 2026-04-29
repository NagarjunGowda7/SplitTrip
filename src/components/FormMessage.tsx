import { Text } from "react-native";

import { appColors } from "@/constants/appColors";

export const FormMessage = ({
  message,
  tone = "error",
}: {
  message?: string;
  tone?: "error" | "success" | "muted";
}) => {
  if (!message) return null;

  const color =
    tone === "success"
      ? appColors.success
      : tone === "muted"
        ? appColors.textMuted
        : appColors.danger;

  return (
    <Text className="text-sm" style={{ color }}>
      {message}
    </Text>
  );
};
