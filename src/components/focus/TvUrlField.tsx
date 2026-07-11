import { Platform, StyleSheet, Text, View } from "react-native";
import TvOnScreenKeyboard from "@/components/focus/TvOnScreenKeyboard";
import TvTextInput from "@/components/focus/TvTextInput";
import { colors, radius } from "@/constants/theme";

const useScreenKeyboard = Platform.OS === "android" || Platform.isTV;

type Props = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  preferredFocus?: boolean;
  onSubmit?: () => void;
};

export default function TvUrlField({ value, onChangeText, placeholder, preferredFocus, onSubmit }: Props) {
  if (useScreenKeyboard) {
    return (
      <View style={styles.wrap}>
        <View style={styles.display}>
          <Text style={[styles.displayText, !value && styles.placeholder]} numberOfLines={2}>
            {value || placeholder || ""}
          </Text>
        </View>
        <TvOnScreenKeyboard
          variant="url"
          value={value}
          onChangeText={onChangeText}
          onDone={onSubmit}
          preferredFocus={preferredFocus}
        />
      </View>
    );
  }

  return (
    <TvTextInput
      preferredFocus={preferredFocus}
      value={value}
      onChangeText={onChangeText}
      autoCapitalize="none"
      autoCorrect={false}
      placeholder={placeholder}
      keyboardType="url"
      returnKeyType="done"
      onSubmitEditing={onSubmit}
    />
  );
}

const styles = StyleSheet.create({
  wrap: { width: "100%" },
  display: {
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 52,
    justifyContent: "center",
  },
  displayText: { color: colors.text, fontSize: 18 },
  placeholder: { color: colors.textMuted },
});
