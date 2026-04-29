import { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";

import { appColors } from "@/constants/appColors";
import {
  formatCalendarMonth,
  formatDisplayDate,
  getCalendarDays,
} from "@/utils/dateHelpers";

export const DatePickerField = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() =>
    value ? new Date(`${value}T12:00:00`) : new Date(),
  );

  useEffect(() => {
    if (!value) return;
    const nextVisibleMonth = new Date(`${value}T12:00:00`);
    if (!Number.isNaN(nextVisibleMonth.getTime())) {
      setVisibleMonth(new Date(nextVisibleMonth.getFullYear(), nextVisibleMonth.getMonth(), 1));
    }
  }, [value]);

  const days = useMemo(() => getCalendarDays(visibleMonth), [visibleMonth]);

  return (
    <>
      <Text className="text-sm font-medium text-ink">{label}</Text>
      <Pressable
        onPress={() => setOpen(true)}
        className="rounded-2xl border px-4 py-4"
        style={{ backgroundColor: "#FFFFFF", borderColor: appColors.border }}
      >
        <Text className="text-base text-ink">
          {value ? formatDisplayDate(value) : "Select date"}
        </Text>
      </Pressable>
      <Modal transparent animationType="slide" visible={open} onRequestClose={() => setOpen(false)}>
        <View className="flex-1 justify-end bg-black/30 px-4 py-6">
          <View className="rounded-[28px] bg-white p-5">
            <View className="flex-row items-center justify-between">
              <Pressable
                onPress={() =>
                  setVisibleMonth(
                    (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1),
                  )
                }
              >
                <Text className="text-base font-semibold text-teal">Prev</Text>
              </Pressable>
              <Text className="text-lg font-semibold text-ink">
                {formatCalendarMonth(visibleMonth)}
              </Text>
              <Pressable
                onPress={() =>
                  setVisibleMonth(
                    (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1),
                  )
                }
              >
                <Text className="text-base font-semibold text-teal">Next</Text>
              </Pressable>
            </View>
            <View className="mt-4 flex-row justify-between">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <Text key={day} className="w-10 text-center text-xs font-semibold uppercase text-slate">
                  {day}
                </Text>
              ))}
            </View>
            <View className="mt-3 flex-row flex-wrap">
              {days.map((day) => (
                <Pressable
                  key={day.key}
                  disabled={!day.value}
                  onPress={() => {
                    if (!day.value) return;
                    onChange(day.value);
                    setOpen(false);
                  }}
                  className="mb-2 h-10 w-10 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: day.value === value ? appColors.secondary : "transparent",
                  }}
                >
                  <Text
                    className="text-sm font-medium"
                    style={{ color: day.value === value ? "#FFFFFF" : appColors.text }}
                  >
                    {day.dayNumber ?? ""}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Pressable onPress={() => setOpen(false)} className="mt-3">
              <Text className="text-center text-base font-semibold text-teal">Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
};
