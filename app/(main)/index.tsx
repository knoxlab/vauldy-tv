import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { fetchLibraries, fetchMedia, fetchUserHistory } from "@/api/client";
import type { HistoryItem, Library, MediaItem } from "@/api/types";
import HorizontalShelf from "@/components/focus/HorizontalShelf";
import LoadingState, { Screen } from "@/components/LoadingState";
import LibraryCard from "@/components/media/LibraryCard";
import MediaCard from "@/components/media/MediaCard";
import { colors, spacing } from "@/constants/theme";
import { t } from "@/i18n";
import { useConfigStore } from "@/store/config";
import { useFocusEffect } from "@react-navigation/native";

export default function HomeScreen() {
  const router = useRouter();
  const appName = useConfigStore((s) => s.appName);
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [recent, setRecent] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const libs = await fetchLibraries();
    setLibraries(libs.filter((l) => l.enabled !== 0));
    setHistory(await fetchUserHistory(12));
    const recentItems: MediaItem[] = [];
    for (const lib of libs.slice(0, 3)) {
      recentItems.push(...(await fetchMedia(lib.id, { sort: "created_desc", limit: 8 })));
    }
    setRecent(recentItems.slice(0, 12));
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load()
        .catch(() => {})
        .finally(() => setLoading(false));
    }, [load]),
  );

  if (loading) return <LoadingState label={t("common.loading")} />;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.brand}>{appName}</Text>

        {history.length > 0 ? (
          <HorizontalShelf title={t("home.continue")}>
            {history.map((h, i) => (
              <MediaCard
                key={h.media_id}
                preferredFocus={i === 0}
                item={{
                  id: h.media_id,
                  library_id: h.library_id,
                  file_id: "",
                  title: h.title,
                  file_path: "",
                  file_type: h.file_type,
                  duration: h.duration,
                  width: 0,
                  height: 0,
                  format: "",
                  status: "",
                  poster_url: h.poster_url,
                  backdrop_url: h.backdrop_url,
                  encrypted_asset: h.encrypted_asset,
                }}
                aspect="landscape"
                progress={h.duration > 0 ? (h.position / h.duration) * 100 : 0}
                onPress={() => router.push(`/media/${h.media_id}`)}
              />
            ))}
          </HorizontalShelf>
        ) : null}

        <HorizontalShelf title={t("home.libraries")}>
          {libraries.map((lib, i) => (
            <LibraryCard
              key={lib.id}
              library={lib}
              preferredFocus={history.length === 0 && i === 0}
              onPress={() => router.push(`/library/${lib.id}`)}
            />
          ))}
        </HorizontalShelf>

        {recent.length > 0 ? (
          <HorizontalShelf title={t("home.recent")}>
            {recent.map((item) => (
              <MediaCard key={item.id} item={item} onPress={() => router.push(`/media/${item.id}`)} />
            ))}
          </HorizontalShelf>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 48, paddingTop: spacing.lg },
  brand: { color: colors.text, fontSize: 36, fontWeight: "700", paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
});
