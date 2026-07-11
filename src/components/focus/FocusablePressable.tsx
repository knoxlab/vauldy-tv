import { forwardRef, useState } from "react";
import { Platform, Pressable, type PressableProps, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { colors, radius } from "@/constants/theme";

type Props = PressableProps & {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  focusedStyle?: StyleProp<ViewStyle>;
  focusRingStyle?: StyleProp<ViewStyle>;
  preferredFocus?: boolean;
};

const FocusablePressable = forwardRef<View, Props>(function FocusablePressable(
  { children, style, focusedStyle, focusRingStyle, preferredFocus, onPress, onFocus, onBlur, ...rest },
  ref,
) {
  const [focused, setFocused] = useState(false);

  return (
    <Pressable
      ref={ref}
      focusable={rest.focusable !== false}
      hasTVPreferredFocus={preferredFocus}
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
      onPress={onPress}
      style={[styles.base, style, focused && (focusedStyle || styles.focused)]}
      {...rest}
    >
      {focused ? <View style={[styles.focusRing, focusRingStyle]} pointerEvents="none" /> : null}
      {children}
    </Pressable>
  );
});

export default FocusablePressable;

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
