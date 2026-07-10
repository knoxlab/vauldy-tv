import type { ReactNode } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { colors } from "@/constants/theme";

type Props = {
  label?: string;
};

export default function LoadingState({ label }: Props) {
  return (
    <View style={styles.wrap}>
      <ActivityIndicator color={colors.brand} size="large" />
      {label ? <Text style={styles.text}>{label}</Text> : null}
    </View>
  );
}

export function Screen({ children }: { children: ReactNode }) {
  return <View style={styles.screen}>{children}</View>;
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 },
  text: { color: colors.textSecondary, fontSize: 18 },
  screen: { flex: 1, backgroundColor: colors.background },
});
