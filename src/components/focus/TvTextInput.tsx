import { useState } from "react";
import {
  Platform,
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
import { colors, radius } from "@/constants/theme";

type Props = TextInputProps & {
  containerStyle?: StyleProp<ViewStyle>;
  preferredFocus?: boolean;
};

export default function TvTextInput({
  style,
  containerStyle,
  preferredFocus,
  secureTextEntry,
  onFocus,
  onBlur,
  keyboardType,
  ...rest
}: Props) {
  const [focused, setFocused] = useState(false);
  const useTvPasswordKeyboard = Platform.OS === "android" && Platform.isTV && secureTextEntry;

  return (
    <View style={[styles.wrap, containerStyle, focused && styles.wrapFocused]}>
      <TextInput
        {...rest}
        style={[styles.input, style]}
        focusable
        hasTVPreferredFocus={preferredFocus}
        showSoftInputOnFocus
        secureTextEntry={secureTextEntry}
        keyboardType={useTvPasswordKeyboard ? "visible-password" : keyboardType}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
      />
      {focused ? <View style={styles.focusRing} pointerEvents="none" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "relative",
    borderRadius: radius.md,
  },
  wrapFocused: {
    transform: [{ scale: Platform.isTV ? 1.02 : 1 }],
  },
  input: {
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.md,
    color: colors.text,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    width: "100%",
  },
  focusRing: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 3,
    borderColor: colors.brand,
    borderRadius: radius.md,
    zIndex: 2,
  },
});
