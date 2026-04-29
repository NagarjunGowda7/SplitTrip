import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { FormMessage } from "@/components/FormMessage";
import { InputField } from "@/components/InputField";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useAuth } from "@/hooks/useAuth";

export const RegisterScreen = ({ navigation }: any) => {
  const { register, loading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();

  const handleRegister = async () => {
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    if (!email.trim()) {
      setError("Email is required.");
      return;
    }
    if (password.trim().length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setError(undefined);
    try {
      await register(name.trim(), email.trim(), password);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to create account.");
    }
  };

  return (
    <ScreenContainer contentContainerStyle={{ padding: 24, flexGrow: 1, justifyContent: "center" }}>
      <View className="gap-8">
        <View>
          <Text className="font-display text-4xl text-ink">Start Your Ledger</Text>
          <Text className="mt-3 text-base text-slate">
            Build a shared trip workspace with planning, budgeting, receipts, and settlements.
          </Text>
        </View>
        <View className="gap-4">
          <InputField label="Name" value={name} onChangeText={setName} placeholder="Avery" />
          <InputField label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" />
          <InputField
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Create a strong password"
            secureTextEntry
          />
          <FormMessage message={error} />
          <Button title="Create Account" onPress={handleRegister} loading={loading} />
        </View>
        <Pressable onPress={() => navigation.goBack()}>
          <Text className="text-center text-sm text-slate">
            Already have an account? <Text className="font-semibold text-teal">Sign in</Text>
          </Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
};
