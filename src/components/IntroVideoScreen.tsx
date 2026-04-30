import { useCallback, useEffect, useRef } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { BrandLockup } from "@/components/BrandLockup";

export const IntroVideoScreen = ({ onFinish }: { onFinish: () => void }) => {
  const finishedRef = useRef(false);
  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onFinish();
  }, [onFinish]);

  useEffect(() => {
    const fallback = setTimeout(finish, 7000);
    return () => clearTimeout(fallback);
  }, [finish]);

  return (
    <View className="flex-1 bg-[#06131F]">
      <View className="flex-1 items-center justify-center px-10">
        <Image source={require("../../assets/icon.png")} className="h-40 w-40" resizeMode="contain" />
      </View>
      <LinearGradient
        colors={["rgba(6,19,31,0.08)", "rgba(6,19,31,0.82)"]}
        className="absolute inset-0 justify-between px-8 pb-14 pt-20"
      >
        <BrandLockup centered showTagline={false} />
        <View className="items-center gap-4">
          <Text className="text-center text-sm leading-6 text-white/80">
            Plan together, track every rupee, and keep the whole trip in one shared ledger.
          </Text>
          <Pressable onPress={finish} className="rounded-full border border-white/25 bg-white/10 px-5 py-3">
            <Text className="text-sm font-semibold tracking-wide text-white">Skip Intro</Text>
          </Pressable>
        </View>
      </LinearGradient>
    </View>
  );
};
