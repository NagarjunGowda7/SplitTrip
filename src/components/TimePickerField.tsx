import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

import { appColors } from "@/constants/appColors";
import { generateTimeOptions } from "@/utils/dateHelpers";

export const TimePickerField = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const options = useMemo(() => generateTimeOptions(30), []);

  return (
    <>
      <Text className="text-sm font-medium text-ink">{label}</Text>
      <Pressable
        onPress={() => setOpen(true)}
        className="rounded-2xl border px-4 py-4"
        style={{ backgroundColor: "#FFFFFF", borderColor: appColors.border }}
      >
        <Text className="text-base text-ink">{value || "Select time"}</Text>
      </Pressable>
      <Modal transparent animationType="slide" visible={open} onRequestClose={() => setOpen(false)}>
        <View className="flex-1 justify-end bg-black/30 px-4 py-6">
          <View className="rounded-[28px] bg-white p-5">
            <Text className="text-lg font-semibold text-ink">{label}</Text>
            <ScrollView className="mt-4 max-h-80">
              <View className="flex-row flex-wrap gap-2">
                {options.map((option) => (
                  <Pressable
                    key={option}
                    onPress={() => {
                      onChange(option);
                      setOpen(false);
                    }}
                    className="rounded-full px-4 py-2"
                    style={{
                      backgroundColor: option === value ? appColors.secondary : appColors.surface,
                      borderWidth: 1,
                      borderColor: option === value ? appColors.secondary : appColors.border,
                    }}
                  >
                    <Text
                      className="text-sm font-semibold"
                      style={{ color: option === value ? "#FFFFFF" : appColors.text }}
                    >
                      {option}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
            <Pressable onPress={() => setOpen(false)} className="mt-4">
              <Text className="text-center text-base font-semibold text-teal">Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
};
