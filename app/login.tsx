import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, View } from "react-native";
import { fetchUserInfo, login } from "@/api/client";
import FocusablePressable from "@/components/focus/FocusablePressable";
import { colors, radius, spacing } from "@/constants/theme";
import { t } from "@/i18n";
import { useAuthStore } from "@/store/auth";
import { useConfigStore } from "@/store/config";

export default function LoginScreen() {
  const router = useRouter();
  const appName = useConfigStore((s) => s.appName);
  const setToken = useAuthStore((s) => s.setToken);
  const setProfile = useAuthStore((s) => s.setProfile);
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    try {
      const token = await login(username, password);
      setToken(token);
      const info = await fetchUserInfo();
      setProfile(info.username, info.role, {
        canPlay: info.can_play,
        avatarUrl: info.avatar_url,
        uiLocale: info.ui_locale,
      });
      router.replace("/(main)");
    } catch {
      useAuthStore.getState().clearSession();
      Alert.alert(t("login.failure"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient colors={["#0f1419", "#1a2332"]} style={styles.gradient}>
      <View style={styles.wrap}>
        <View style={styles.card}>
          <Text style={styles.title}>{t("login.title", { appName })}</Text>
          <Text style={styles.subtitle}>{t("login.subtitle")}</Text>
          <Text style={styles.label}>{t("login.username")}</Text>
          <TextInput style={styles.input} value={username} onChangeText={setUsername} autoCapitalize="none" />
          <Text style={styles.label}>{t("login.password")}</Text>
          <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />
          <Text style={styles.hint}>{t("login.demo_hint")}</Text>
          <FocusablePressable preferredFocus onPress={() => void submit()} style={styles.button} focusedStyle={styles.buttonFocused}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{t("login.submit")}</Text>}
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
  subtitle: { color: colors.textSecondary, marginTop: 12, marginBottom: 28, fontSize: 18 },
  label: { color: colors.textSecondary, fontSize: 16, marginBottom: 10, marginTop: 12 },
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
  hint: { color: colors.textMuted, marginTop: 16, fontSize: 14 },
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
