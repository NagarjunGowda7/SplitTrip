import { ActivityIndicator, Pressable, Text } from "react-native";

import { appColors } from "@/constants/appColors";

type Variant = "primary" | "secondary" | "danger";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
}

const variantStyles: Record<Variant, { bg: string; text: string }> = {
  primary: { bg: appColors.primary, text: "#FFFFFF" },
  secondary: { bg: appColors.secondary, text: "#FFFFFF" },
  danger: { bg: appColors.danger, text: "#FFFFFF" },
};

export const Button = ({
  title,
  onPress,
  variant = "primary",
  disabled,
  loading,
}: ButtonProps) => (
  <Pressable
    onPress={onPress}
    disabled={disabled || loading}
    className="rounded-2xl px-4 py-4"
    style={{
      backgroundColor: disabled ? appColors.border : variantStyles[variant].bg,
      opacity: disabled ? 0.7 : 1,
    }}
  >
    {loading ? (
      <ActivityIndicator color={variantStyles[variant].text} />
    ) : (
      <Text
        className="text-center text-base font-semibold"
        style={{ color: variantStyles[variant].text }}
      >
        {title}
      </Text>
    )}
  </Pressable>
);
