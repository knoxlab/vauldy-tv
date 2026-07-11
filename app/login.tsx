import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { fetchUserInfo, login } from "@/api/client";
import FocusablePressable from "@/components/focus/FocusablePressable";
import TvOnScreenKeyboard from "@/components/focus/TvOnScreenKeyboard";
import TvTextInput from "@/components/focus/TvTextInput";
import { colors, radius, spacing } from "@/constants/theme";
import { t } from "@/i18n";
import { useAuthStore } from "@/store/auth";
import { useConfigStore } from "@/store/config";

// Android TV builds may not always set Platform.isTV in dev; this is a TV-only app.
const useScreenKeyboard = Platform.OS === "android" || Platform.isTV;

export default function LoginScreen() {
  const router = useRouter();
  const appName = useConfigStore((s) => s.appName);
  const setToken = useAuthStore((s) => s.setToken);
  const setProfile = useAuthStore((s) => s.setProfile);
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [passwordFocused, setPasswordFocused] = useState(false);
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
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="always">
        <View style={[styles.card, useScreenKeyboard && styles.cardWide]}>
          <Text style={styles.title}>{t("login.title", { appName })}</Text>
          <Text style={styles.subtitle}>{t("login.subtitle")}</Text>

          <Text style={styles.label}>{t("login.username")}</Text>
          <TvTextInput
            preferredFocus
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            showSoftInputOnFocus={!useScreenKeyboard}
          />

          <Text style={styles.label}>{t("login.password")}</Text>
          {useScreenKeyboard ? (
            <>
              <Pressable
                focusable
                onPress={() => setPasswordFocused(true)}
                style={[styles.passwordDisplay, passwordFocused && styles.passwordDisplayFocused]}
              >
                <Text style={styles.passwordText}>
                  {password ? "•".repeat(password.length) : t("login.password_placeholder")}
                </Text>
              </Pressable>
              <Pressable onPress={() => setPassword("admin123")} style={styles.demoFill}>
                <Text style={styles.demoFillText}>{t("login.fill_demo_password")}</Text>
              </Pressable>
              <TvOnScreenKeyboard value={password} onChangeText={setPassword} onDone={() => void submit()} />
            </>
          ) : (
            <TvTextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={() => void submit()}
            />
          )}

          <Text style={styles.hint}>{t("login.demo_hint")}</Text>
          <FocusablePressable onPress={() => void submit()} style={styles.button} focusedStyle={styles.buttonFocused}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{t("login.submit")}</Text>}
          </FocusablePressable>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  scroll: { padding: spacing.xl, paddingTop: 48 },
  card: {
    width: 560,
    alignSelf: "center",
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardWide: { width: 720 },
  title: { color: colors.text, fontSize: 32, fontWeight: "700" },
  subtitle: { color: colors.textSecondary, marginTop: 12, marginBottom: 28, fontSize: 18 },
  label: { color: colors.textSecondary, fontSize: 16, marginBottom: 10, marginTop: 12 },
  passwordDisplay: {
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 52,
    justifyContent: "center",
  },
  passwordDisplayFocused: {
    borderColor: colors.brand,
    borderWidth: 2,
  },
  passwordText: { color: colors.text, fontSize: 22, letterSpacing: 3 },
  demoFill: {
    marginTop: 10,
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
    backgroundColor: colors.accentBg,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  demoFillText: { color: colors.accent, fontSize: 15, fontWeight: "600" },
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
