import { ReactNode } from "react";
import { Platform, ScrollViewProps, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export const ScreenContainer = ({
  children,
  contentContainerStyle,
  scroll = true,
  keyboardOffset = 96,
}: {
  children: ReactNode;
  contentContainerStyle?: ScrollViewProps["contentContainerStyle"];
  scroll?: boolean;
  keyboardOffset?: number;
}) => {
  const body = scroll ? (
    <KeyboardAwareScrollView
      className="flex-1 bg-sand"
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
      enableOnAndroid
      extraHeight={keyboardOffset}
      extraScrollHeight={24}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={contentContainerStyle}
    >
      {children}
    </KeyboardAwareScrollView>
  ) : (
    <View className="flex-1 bg-sand">{children}</View>
  );

  return <View className="flex-1 bg-sand">{body}</View>;
};
