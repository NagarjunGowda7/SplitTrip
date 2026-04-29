import { KeyboardTypeOptions, Text, TextInput, View } from "react-native";

import { appColors } from "@/constants/appColors";

interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: string;
  multiline?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  editable?: boolean;
}

export const InputField = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  error,
  multiline,
  keyboardType,
  autoCapitalize = "sentences",
  editable = true,
}: InputFieldProps) => (
  <View className="gap-2">
    <Text className="text-sm font-medium" style={{ color: appColors.text }}>
      {label}
    </Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      secureTextEntry={secureTextEntry}
      multiline={multiline}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      editable={editable}
      className="rounded-2xl px-4 py-4 text-base"
      placeholderTextColor={appColors.textMuted}
      style={{
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: error ? appColors.danger : appColors.border,
        minHeight: multiline ? 108 : undefined,
        textAlignVertical: multiline ? "top" : "center",
      }}
    />
    {error ? (
      <Text className="text-xs" style={{ color: appColors.danger }}>
        {error}
      </Text>
    ) : null}
  </View>
);
