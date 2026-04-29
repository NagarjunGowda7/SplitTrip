import { Image, Text, View } from "react-native";

import { Card } from "./Card";

export const ReceiptPreview = ({ uri }: { uri?: string }) => (
  <Card>
    {uri ? (
      <Image source={{ uri }} className="h-40 w-full rounded-2xl" resizeMode="cover" />
    ) : (
      <View className="h-40 items-center justify-center rounded-2xl bg-slate-100">
        <Text className="text-sm text-slate">No receipt uploaded yet</Text>
      </View>
    )}
  </Card>
);
