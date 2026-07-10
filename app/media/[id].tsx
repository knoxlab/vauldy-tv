import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import {
  addFavorite,
  fetchFavoriteStatus,
  fetchMediaDetail,
  removeFavorite,
} from "@/api/client";
import FocusablePressable from "@/components/focus/FocusablePressable";
import LoadingState, { Screen } from "@/components/LoadingState";
import { colors, radius, spacing } from "@/constants/theme";
import { t } from "@/i18n";
import { formatDuration, mediaPosterSrc, mediaReleaseYear } from "@/lib/mediaUrl";

export default function MediaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const mediaId = Number(id);
  const router = useRouter();
  const [item, setItem] = useState<Awaited<ReturnType<typeof fetchMediaDetail>> | null>(null);
  const [favorited, setFavorited] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchMediaDetail(mediaId), fetchFavoriteStatus(mediaId)])
      .then(([detail, fav]) => {
        setItem(detail);
        setFavorited(fav);
      })
      .catch(() => setItem(null))
      .finally(() => setLoading(false));
  }, [mediaId]);

  if (loading || !item) return <LoadingState />;

  const poster = mediaPosterSrc(item);
  const year = mediaReleaseYear(item);

  const primaryAction = () => {
    if (item.file_type === "video" || item.file_type === "audio") return router.push(`/player/${item.id}`);
    if (item.file_type === "image") return router.push(`/photo/${item.id}`);
    if (item.file_type === "document") return router.push(`/reader/${item.id}`);
  };

  const actionLabel =
    item.file_type === "video"
      ? t("media.play_video")
      : item.file_type === "audio"
        ? t("media.play_audio")
        : item.file_type === "image"
          ? t("media.view_photo")
          : t("media.read_document");

  async function toggleFavorite() {
    try {
      if (favorited) {
        await removeFavorite(item!.id);
        setFavorited(false);
      } else {
        await addFavorite(item!.id);
        setFavorited(true);
      }
    } catch {
      Alert.alert(t("common.error"));
    }
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.hero}>
          {poster ? (
            <Image source={{ uri: poster }} style={styles.poster} contentFit="cover" />
          ) : (
            <View style={[styles.poster, styles.placeholder]}>
              <Ionicons name="film-outline" size={64} color={colors.textMuted} />
            </View>
          )}
          <View style={styles.body}>
            <Text style={styles.title}>{item.title || item.file_path}</Text>
            <View style={styles.metaRow}>
              {year ? <Text style={styles.meta}>{t("media.year")}: {year}</Text> : null}
              {item.duration > 0 ? <Text style={styles.meta}>{formatDuration(item.duration)}</Text> : null}
            </View>
            {item.overview ? <Text style={styles.overview}>{item.overview}</Text> : null}
            <View style={styles.actions}>
              <FocusablePressable preferredFocus onPress={primaryAction} style={styles.primaryBtn} focusedStyle={styles.btnFocused}>
                <Text style={styles.primaryText}>{actionLabel}</Text>
              </FocusablePressable>
              <FocusablePressable onPress={() => void toggleFavorite()} style={styles.secondaryBtn} focusedStyle={styles.btnFocused}>
                <Text style={styles.secondaryText}>{favorited ? t("common.unfavorite") : t("common.favorite")}</Text>
              </FocusablePressable>
              <FocusablePressable onPress={() => router.back()} style={styles.secondaryBtn} focusedStyle={styles.btnFocused}>
                <Text style={styles.secondaryText}>{t("common.back")}</Text>
              </FocusablePressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg },
  hero: { flexDirection: "row", gap: spacing.xl },
  poster: {
    width: 280,
    aspectRatio: 2 / 3,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  placeholder: { alignItems: "center", justifyContent: "center" },
  body: { flex: 1, paddingTop: spacing.md },
  title: { color: colors.text, fontSize: 36, fontWeight: "700", marginBottom: 12 },
  metaRow: { flexDirection: "row", gap: 20, marginBottom: spacing.md },
  meta: { color: colors.textSecondary, fontSize: 18 },
  overview: { color: colors.textSecondary, lineHeight: 28, fontSize: 18, marginBottom: spacing.lg },
  actions: { flexDirection: "row", gap: 16, flexWrap: "wrap" },
  primaryBtn: { backgroundColor: colors.brand, borderRadius: radius.md, paddingVertical: 16, paddingHorizontal: 28 },
  primaryText: { color: "#fff", fontSize: 20, fontWeight: "600" },
  secondaryBtn: {
    backgroundColor: colors.accentBg,
    borderRadius: radius.md,
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderWidth: 1,
    borderColor: "rgba(237,109,0,0.25)",
  },
  secondaryText: { color: colors.accent, fontSize: 18, fontWeight: "600" },
  btnFocused: {},
});
