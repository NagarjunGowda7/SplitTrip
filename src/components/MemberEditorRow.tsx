import { View } from "react-native";

import { Button } from "@/components/Button";
import { InputField } from "@/components/InputField";

export interface EditableMember {
  id: string;
  name: string;
  email: string;
}

export const MemberEditorRow = ({
  member,
  index,
  onChange,
  onRemove,
  disableRemove,
}: {
  member: EditableMember;
  index: number;
  onChange: (patch: Partial<EditableMember>) => void;
  onRemove: () => void;
  disableRemove?: boolean;
}) => (
  <View className="gap-3 rounded-3xl border border-slate-200 bg-white p-4">
    <InputField
      label={`Member ${index + 1} Name`}
      value={member.name}
      onChangeText={(value) => onChange({ name: value })}
      placeholder="Riya"
    />
    <InputField
      label="Email"
      value={member.email}
      onChangeText={(value) => onChange({ email: value })}
      placeholder="Optional"
      autoCapitalize="none"
      keyboardType="email-address"
    />
    <Button
      title="Remove Member"
      variant="danger"
      disabled={disableRemove}
      onPress={onRemove}
    />
  </View>
);
