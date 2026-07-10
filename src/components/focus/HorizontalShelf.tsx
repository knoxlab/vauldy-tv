import type { ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "@/constants/theme";

type Props = {
  title: string;
  children: ReactNode;
};

export default function HorizontalShelf({ title, children }: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: spacing.xl },
  title: { color: colors.text, fontSize: 28, fontWeight: "700", marginBottom: spacing.md, paddingHorizontal: spacing.lg },
  row: { paddingHorizontal: spacing.lg, gap: 16 },
});
