import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import FocusablePressable from "@/components/focus/FocusablePressable";
import { colors, radius } from "@/constants/theme";
import { t } from "@/i18n";
import { usePlayerStore } from "@/store/player";

export default function MusicBar() {
  const router = useRouter();
  const { mediaId, title, poster, playing } = usePlayerStore();

  if (!mediaId) return null;

  return (
    <View style={styles.bar}>
      {poster ? <Image source={{ uri: poster }} style={styles.poster} contentFit="cover" /> : <View style={styles.poster} />}
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <FocusablePressable onPress={() => router.push(`/player/${mediaId}`)} style={styles.btn} focusedStyle={styles.btnFocused}>
        <Text style={styles.btnText}>{playing ? t("player.pause") : t("common.play")}</Text>
      </FocusablePressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: 72,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    gap: 16,
  },
  poster: { width: 52, height: 52, borderRadius: radius.sm, backgroundColor: colors.card },
  title: { flex: 1, color: colors.text, fontSize: 18, fontWeight: "600" },
  btn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: radius.md, backgroundColor: colors.accentBg },
  btnFocused: {},
  btnText: { color: colors.accent, fontSize: 16, fontWeight: "600" },
});
