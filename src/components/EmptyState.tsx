import { ReactNode } from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";

export const EmptyState = ({
  icon = "sparkles-outline",
  title,
  description,
  actionLabel,
  onAction,
  secondaryAction,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryAction?: ReactNode;
}) => (
  <Card>
    <View className="items-start gap-3">
      <View className="rounded-2xl bg-teal/10 p-3">
        <Ionicons name={icon} size={22} color="#2A9D8F" />
      </View>
      <View className="gap-1">
        <Text className="text-lg font-semibold text-ink">{title}</Text>
        <Text className="text-sm leading-6 text-slate">{description}</Text>
      </View>
      {actionLabel && onAction ? <Button title={actionLabel} onPress={onAction} /> : null}
      {secondaryAction}
    </View>
  </Card>
);
