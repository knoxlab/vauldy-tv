import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/constants/theme";
import { t } from "@/i18n";

export default function EmptyState() {
  return (
    <View style={styles.wrap}>
      <Text style={styles.text}>{t("common.empty")}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 48, alignItems: "center" },
  text: { color: colors.textSecondary, fontSize: 20 },
});
