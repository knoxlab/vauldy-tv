import type { ReactNode } from "react";
import { useState } from "react";
import { Platform, Pressable, type PressableProps, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { colors, radius } from "@/constants/theme";

type Props = PressableProps & {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  focusedStyle?: StyleProp<ViewStyle>;
  preferredFocus?: boolean;
};

export default function FocusablePressable({
  children,
  style,
  focusedStyle,
  preferredFocus,
  ...rest
}: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <Pressable
      focusable
      hasTVPreferredFocus={preferredFocus}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={[styles.base, style, focused && (focusedStyle || styles.focused)]}
      {...rest}
    >
      {focused ? <View style={styles.focusRing} pointerEvents="none" /> : null}
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    position: "relative",
  },
  focused: {
    transform: [{ scale: Platform.isTV ? 1.06 : 1.02 }],
  },
  focusRing: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 3,
    borderColor: colors.brand,
    borderRadius: radius.md,
    zIndex: 2,
  },
});
