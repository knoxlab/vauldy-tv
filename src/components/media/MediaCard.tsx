import { StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import FocusablePressable from "@/components/focus/FocusablePressable";
import { colors, radius } from "@/constants/theme";
import { formatDuration, mediaPosterSrc, mediaReleaseYear } from "@/lib/mediaUrl";
import type { MediaItem } from "@/api/types";

type Props = {
  item: MediaItem;
  onPress: () => void;
  aspect?: "poster" | "landscape";
  progress?: number;
  preferredFocus?: boolean;
};

export default function MediaCard({ item, onPress, aspect = "poster", progress, preferredFocus }: Props) {
  const poster = mediaPosterSrc(item);
  const year = mediaReleaseYear(item);
  const landscape = aspect === "landscape";

  return (
    <FocusablePressable
      onPress={onPress}
      preferredFocus={preferredFocus}
      style={[styles.card, landscape ? styles.cardLandscape : undefined]}
      focusedStyle={styles.cardFocused}
    >
      <View style={[styles.posterWrap, landscape ? styles.posterLandscape : undefined]}>
        {poster ? (
          <Image source={{ uri: poster }} style={styles.poster} contentFit="cover" transition={200} />
        ) : (
          <View style={[styles.poster, styles.placeholder]}>
            <Ionicons name="film-outline" size={36} color={colors.textMuted} />
          </View>
        )}
        {item.file_type === "video" && item.duration > 0 ? (
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{formatDuration(item.duration)}</Text>
          </View>
        ) : null}
        {typeof progress === "number" && progress > 0 ? (
          <View style={styles.progressTrack}>
            <View style={[styles.progressBar, { width: `${Math.min(progress, 100)}%` }]} />
          </View>
        ) : null}
      </View>
      <Text style={styles.title} numberOfLines={2}>
        {item.title || item.file_path}
      </Text>
      {year ? <Text style={styles.meta}>{year}</Text> : null}
    </FocusablePressable>
  );
}

const styles = StyleSheet.create({
  card: { width: 160 },
  cardLandscape: { width: 260 },
  cardFocused: {},
  posterWrap: {
    width: "100%",
    aspectRatio: 2 / 3,
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  posterLandscape: { aspectRatio: 16 / 9 },
  poster: { width: "100%", height: "100%" },
  placeholder: { alignItems: "center", justifyContent: "center" },
  durationBadge: {
    position: "absolute",
    right: 8,
    bottom: 8,
    backgroundColor: colors.overlay,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  durationText: { color: colors.text, fontSize: 12, fontWeight: "600" },
  progressTrack: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  progressBar: { height: "100%", backgroundColor: colors.accent },
  title: { color: colors.text, fontSize: 16, marginTop: 10, lineHeight: 22 },
  meta: { color: colors.textSecondary, fontSize: 13, marginTop: 4 },
});
