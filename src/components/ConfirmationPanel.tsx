import { Text, View } from "react-native";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";

export const ConfirmationPanel = ({
  title,
  description,
  confirmLabel,
  onConfirm,
  onCancel,
  loading,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}) => (
  <Card>
    <Text className="text-lg font-semibold text-ink">{title}</Text>
    <Text className="mt-2 text-sm text-slate">{description}</Text>
    <View className="mt-4 gap-3">
      <Button title={confirmLabel} variant="danger" onPress={onConfirm} loading={loading} />
      <Button title="Cancel" variant="secondary" onPress={onCancel} disabled={loading} />
    </View>
  </Card>
);
