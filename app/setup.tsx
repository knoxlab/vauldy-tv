import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, View } from "react-native";
import { checkHealth, fetchBranding } from "@/api/client";
import FocusablePressable from "@/components/focus/FocusablePressable";
import { colors, radius, spacing } from "@/constants/theme";
import { t } from "@/i18n";
import { normalizeServerUrl, useConfigStore } from "@/store/config";

export default function SetupScreen() {
  const router = useRouter();
  const serverUrl = useConfigStore((s) => s.serverUrl);
  const setServerUrl = useConfigStore((s) => s.setServerUrl);
  const setAppName = useConfigStore((s) => s.setAppName);
  const [url, setUrl] = useState(serverUrl || "http://127.0.0.1:8200");
  const [loading, setLoading] = useState(false);

  async function connect() {
    const normalized = normalizeServerUrl(url);
    if (!normalized) return;
    setLoading(true);
    try {
      setServerUrl(normalized);
      const ok = await checkHealth();
      if (!ok) throw new Error("health");
      try {
        const branding = await fetchBranding();
        if (branding.app_name) setAppName(branding.app_name);
      } catch {
        /* optional */
      }
      Alert.alert(t("setup.success"));
      router.replace("/login");
    } catch {
      setServerUrl(null);
      Alert.alert(t("setup.failure"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient colors={["#0f1419", "#1a2332"]} style={styles.gradient}>
      <View style={styles.wrap}>
        <View style={styles.card}>
          <Text style={styles.title}>{t("setup.title")}</Text>
          <Text style={styles.subtitle}>{t("setup.subtitle")}</Text>
          <Text style={styles.label}>{t("setup.url")}</Text>
          <TextInput
            style={styles.input}
            value={url}
            onChangeText={setUrl}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder={t("setup.url_placeholder")}
            placeholderTextColor={colors.textMuted}
          />
          <FocusablePressable preferredFocus onPress={() => void connect()} style={styles.button} focusedStyle={styles.buttonFocused}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{t("setup.continue")}</Text>}
          </FocusablePressable>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  wrap: { flex: 1, justifyContent: "center", alignItems: "center", padding: spacing.xl },
  card: {
    width: 560,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: { color: colors.text, fontSize: 32, fontWeight: "700" },
  subtitle: { color: colors.textSecondary, marginTop: 12, marginBottom: 28, lineHeight: 24, fontSize: 18 },
  label: { color: colors.textSecondary, fontSize: 16, marginBottom: 10 },
  input: {
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.md,
    color: colors.text,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
  },
  button: {
    marginTop: 24,
    backgroundColor: colors.brand,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonFocused: {},
  buttonText: { color: "#fff", fontSize: 20, fontWeight: "600" },
});
