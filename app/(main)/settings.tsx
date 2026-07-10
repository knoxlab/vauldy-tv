import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { logout, updateUserProfile } from "@/api/client";
import FocusablePressable from "@/components/focus/FocusablePressable";
import { Screen } from "@/components/LoadingState";
import { colors, radius, spacing } from "@/constants/theme";
import { t } from "@/i18n";
import { useAuthStore } from "@/store/auth";
import { normalizeServerUrl, useConfigStore } from "@/store/config";

export default function SettingsScreen() {
  const router = useRouter();
  const username = useAuthStore((s) => s.username);
  const clearSession = useAuthStore((s) => s.clearSession);
  const setProfile = useAuthStore((s) => s.setProfile);
  const serverUrl = useConfigStore((s) => s.serverUrl);
  const setServerUrl = useConfigStore((s) => s.setServerUrl);
  const [locale, setLocale] = useState<"zh-CN" | "en">("zh-CN");

  async function saveLocale(next: "zh-CN" | "en") {
    setLocale(next);
    try {
      await updateUserProfile({ ui_locale: next });
      const role = useAuthStore.getState().role;
      if (username && role) setProfile(username, role, { uiLocale: next });
      Alert.alert(t("common.save"));
    } catch {
      Alert.alert(t("common.error"));
    }
  }

  async function onLogout() {
    await logout();
    clearSession();
    router.replace("/login");
  }

  function changeServer() {
    setServerUrl(null);
    router.replace("/setup");
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>{t("settings.title")}</Text>

        <View style={styles.section}>
          <Text style={styles.label}>{username || "—"}</Text>
          <Text style={styles.value}>{serverUrl ? normalizeServerUrl(serverUrl) : "—"}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("settings.language")}</Text>
          <View style={styles.row}>
            <FocusablePressable
              preferredFocus
              onPress={() => void saveLocale("zh-CN")}
              style={[styles.chip, locale === "zh-CN" ? styles.chipActive : undefined]}
            >
              <Text style={styles.chipText}>{t("settings.lang.zh-CN")}</Text>
            </FocusablePressable>
            <FocusablePressable onPress={() => void saveLocale("en")} style={[styles.chip, locale === "en" ? styles.chipActive : undefined]}>
              <Text style={styles.chipText}>{t("settings.lang.en")}</Text>
            </FocusablePressable>
          </View>
        </View>

        <FocusablePressable onPress={changeServer} style={styles.button} focusedStyle={styles.buttonFocused}>
          <Text style={styles.buttonText}>{t("settings.server")}</Text>
        </FocusablePressable>

        <FocusablePressable onPress={() => void onLogout()} style={[styles.button, styles.danger]} focusedStyle={styles.buttonFocused}>
          <Text style={styles.buttonText}>{t("settings.logout")}</Text>
        </FocusablePressable>

        <Text style={styles.version}>{t("settings.version")}</Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, gap: spacing.lg },
  title: { color: colors.text, fontSize: 32, fontWeight: "700" },
  section: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border },
  sectionTitle: { color: colors.text, fontSize: 20, fontWeight: "600", marginBottom: spacing.md },
  label: { color: colors.text, fontSize: 22, fontWeight: "600" },
  value: { color: colors.textSecondary, fontSize: 16, marginTop: 8 },
  row: { flexDirection: "row", gap: 12 },
  chip: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: radius.md, backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.border },
  chipActive: { borderColor: colors.brand, backgroundColor: "rgba(0,164,220,0.12)" },
  chipText: { color: colors.text, fontSize: 18 },
  button: { backgroundColor: colors.brand, borderRadius: radius.md, paddingVertical: 16, alignItems: "center" },
  buttonFocused: {},
  danger: { backgroundColor: colors.accent },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  version: { color: colors.textMuted, fontSize: 14, textAlign: "center", marginTop: spacing.md },
});
