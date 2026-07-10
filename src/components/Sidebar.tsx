import { useRouter, useSegments, type Href } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import FocusablePressable from "@/components/focus/FocusablePressable";
import { colors, radius, spacing } from "@/constants/theme";
import { t } from "@/i18n";
import { useConfigStore } from "@/store/config";

const NAV: { href: Href; labelKey: string }[] = [
  { href: "/(main)", labelKey: "tab.home" },
  { href: "/(main)/browse", labelKey: "tab.browse" },
  { href: "/(main)/favorites", labelKey: "tab.favorites" },
  { href: "/(main)/settings", labelKey: "tab.settings" },
];

export default function Sidebar() {
  const router = useRouter();
  const segments = useSegments();
  const appName = useConfigStore((s) => s.appName);
  const current = segments.join("/");

  return (
    <View style={styles.sidebar}>
      <Text style={styles.brand}>{appName}</Text>
      <View style={styles.nav}>
        {NAV.map((item, index) => {
          const path = String(item.href).replace("/(main)", "") || "index";
          const active =
            (path === "index" && (current === "(main)" || current.endsWith("index"))) ||
            current.includes(path.replace("/", ""));
          return (
            <FocusablePressable
              key={String(item.href)}
              preferredFocus={index === 0}
              onPress={() => router.push(item.href)}
              style={[styles.navItem, active ? styles.navItemActive : undefined]}
              focusedStyle={styles.navItemFocused}
            >
              <Text style={[styles.navText, active ? styles.navTextActive : undefined]}>{t(item.labelKey)}</Text>
            </FocusablePressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 240,
    backgroundColor: colors.header,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  brand: { color: colors.text, fontSize: 26, fontWeight: "700", marginBottom: spacing.xl, paddingHorizontal: spacing.sm },
  nav: { gap: 8 },
  navItem: {
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
  },
  navItemActive: { backgroundColor: "rgba(0,164,220,0.15)" },
  navItemFocused: {},
  navText: { color: colors.textSecondary, fontSize: 20, fontWeight: "600" },
  navTextActive: { color: colors.brand },
});
