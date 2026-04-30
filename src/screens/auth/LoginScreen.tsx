import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { BrandLockup } from "@/components/BrandLockup";
import { Button } from "@/components/Button";
import { FormMessage } from "@/components/FormMessage";
import { InputField } from "@/components/InputField";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useAuth } from "@/hooks/useAuth";

export const LoginScreen = ({ navigation }: any) => {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();

  const handleLogin = async () => {
    if (!email.trim()) {
      setError("Email is required.");
      return;
    }
    if (!password.trim()) {
      setError("Password is required.");
      return;
    }

    setError(undefined);
    try {
      await login(email.trim(), password);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to sign in.");
    }
  };

  return (
    <ScreenContainer contentContainerStyle={{ padding: 24, justifyContent: "center", flexGrow: 1 }}>
      <View className="gap-8">
        <View>
          <BrandLockup />
          <Text className="mt-3 text-base leading-6 text-slate">
            Plan trips, track expenses, manage the group wallet, and settle up without friction.
          </Text>
        </View>
        <View className="gap-4">
          <InputField label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" />
          <InputField
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
          />
          <FormMessage message={error} />
          <Button title="Sign In" onPress={handleLogin} loading={loading} />
        </View>
        <Pressable onPress={() => navigation.navigate("Register")}>
          <Text className="text-center text-sm text-slate">
            New here? <Text className="font-semibold text-teal">Create an account</Text>
          </Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
};
