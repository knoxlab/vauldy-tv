import { useRouter, useSegments, type Href } from "expo-router";
import { useEffect, useMemo } from "react";
import { Pressable, StyleSheet, Text, useTVEventHandler, View } from "react-native";
import { colors, radius, spacing } from "@/constants/theme";
import { t } from "@/i18n";
import { TV_NAV_ENABLED, useTvRemoteNav } from "@/hooks/useTvRemoteNav";
import { useConfigStore } from "@/store/config";
import { useTvFocusStore } from "@/store/tvFocus";

const NAV: { href: Href; labelKey: string }[] = [
  { href: "/(main)", labelKey: "tab.home" },
  { href: "/(main)/browse", labelKey: "tab.browse" },
  { href: "/(main)/favorites", labelKey: "tab.favorites" },
  { href: "/(main)/settings", labelKey: "tab.settings" },
];

function navIndexFromSegments(current: string): number {
  for (let i = 0; i < NAV.length; i++) {
    const path = String(NAV[i]!.href).replace("/(main)", "") || "index";
    if (path === "index" && (current === "(main)" || current.endsWith("index") || current === "(main)/index")) {
      return i;
    }
    if (path !== "index" && current.includes(path.replace("/", ""))) return i;
  }
  return 0;
}

export default function Sidebar() {
  const router = useRouter();
  const segments = useSegments();
  const appName = useConfigStore((s) => s.appName);
  const current = segments.join("/");
  const zone = useTvFocusStore((s) => s.zone);
  const setZone = useTvFocusStore((s) => s.setZone);

  const routeIndex = useMemo(() => navIndexFromSegments(current), [current]);
  const inMainShell = segments[0] === "(main)";

  const { index: focusIndex, setIndex } = useTvRemoteNav({
    mode: "vertical",
    count: NAV.length,
    initialIndex: routeIndex,
    // Sidebar lives in layout; gate by zone instead of screen focus.
    requireScreenFocus: false,
    enabled: TV_NAV_ENABLED && inMainShell && zone === "sidebar",
    onSelect: (i) => {
      const item = NAV[i];
      if (item) router.push(item.href);
    },
  });

  useEffect(() => {
    setIndex(routeIndex);
  }, [routeIndex, setIndex]);

  useTVEventHandler((evt) => {
    if (!TV_NAV_ENABLED || !inMainShell) return;
    if (zone !== "sidebar") return;
    if (evt.eventType === "right") {
      setZone("content");
    }
  });

  const selectedIndex = zone === "sidebar" ? focusIndex : -1;

  return (
    <View style={styles.sidebar}>
      <Text style={styles.brand}>{appName}</Text>
      <View style={styles.nav}>
        {NAV.map((item, index) => {
          const path = String(item.href).replace("/(main)", "") || "index";
          const routeActive =
            (path === "index" && (current === "(main)" || current.endsWith("index"))) ||
            current.includes(path.replace("/", ""));
          const selected = selectedIndex === index;
          return (
            <Pressable
              key={String(item.href)}
              focusable={!TV_NAV_ENABLED}
              onPress={() => {
                setZone("content");
                router.push(item.href);
              }}
              style={[
                styles.navItem,
                routeActive ? styles.navItemActive : undefined,
                selected ? styles.navItemSelected : undefined,
              ]}
            >
              <Text style={[styles.navText, routeActive || selected ? styles.navTextActive : undefined]}>
                {t(item.labelKey)}
              </Text>
            </Pressable>
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
  brand: {
    color: colors.text,
    fontSize: 26,
    fontWeight: "700",
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.sm,
  },
  nav: { gap: 8 },
  navItem: {
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    borderWidth: 2,
    borderColor: "transparent",
  },
  navItemActive: { backgroundColor: "rgba(0,164,220,0.15)" },
  navItemSelected: { borderColor: colors.brand, backgroundColor: "rgba(0,164,220,0.22)" },
  navText: { color: colors.textSecondary, fontSize: 20, fontWeight: "600" },
  navTextActive: { color: colors.brand },
});
