import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "@/constants/theme";
import { t } from "@/i18n";

type Props = {
  visible: boolean;
  secondsLeft: number;
  onPlayNow: () => void;
  onCancel: () => void;
  /** 0 = play now, 1 = cancel */
  focusIndex?: number;
};

export default function NextEpisodeOverlay({
  visible,
  secondsLeft,
  onPlayNow,
  onCancel,
  focusIndex = 0,
}: Props) {
  if (!visible) return null;

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <View style={styles.card}>
        <Text style={styles.title}>{t("series.next_episode")}</Text>
        <Text style={styles.subtitle}>{t("series.next_episode_in", { n: secondsLeft })}</Text>
        <View style={styles.actions}>
          <Pressable
            focusable={false}
            onPress={onPlayNow}
            style={[styles.btn, focusIndex === 0 && styles.btnSelected]}
          >
            <Text style={styles.btnText}>{t("series.play_now")}</Text>
          </Pressable>
          <Pressable
            focusable={false}
            onPress={onCancel}
            style={[styles.btn, focusIndex === 1 && styles.btnSelected]}
          >
            <Text style={styles.btnText}>{t("series.cancel")}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 40,
  },
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    minWidth: 420,
    maxWidth: "80%",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 18,
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  btn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    borderRadius: radius.md,
    backgroundColor: colors.overlay,
    borderWidth: 2,
    borderColor: "transparent",
    minWidth: 140,
    alignItems: "center",
  },
  btnSelected: {
    borderColor: colors.brand,
    backgroundColor: colors.accentBgStrong,
  },
  btnText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "600",
  },
});
