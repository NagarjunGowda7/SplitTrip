import { ReactNode } from "react";
import { Text, View } from "react-native";

import { Card } from "./Card";

export const ListItem = ({
  title,
  subtitle,
  rightContent,
}: {
  title: string;
  subtitle?: string;
  rightContent?: ReactNode;
}) => (
  <Card>
    <View className="flex-row items-center justify-between gap-3">
      <View className="flex-1">
        <Text className="text-base font-semibold text-ink">{title}</Text>
        {subtitle ? <Text className="mt-1 text-sm text-slate">{subtitle}</Text> : null}
      </View>
      {rightContent}
    </View>
  </Card>
);
