import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { fetchContinueWatchingHistory, fetchLibraries, fetchMedia } from "@/api/client";
import type { HistoryItem, Library, MediaItem } from "@/api/types";
import HorizontalShelf from "@/components/focus/HorizontalShelf";
import LoadingState, { Screen } from "@/components/LoadingState";
import LibraryCard from "@/components/media/LibraryCard";
import MediaCard from "@/components/media/MediaCard";
import { colors, spacing } from "@/constants/theme";
import { t } from "@/i18n";
import { useConfigStore } from "@/store/config";
import { useTvFocusStore } from "@/store/tvFocus";

function historyToMediaItem(h: HistoryItem): MediaItem {
  return {
    id: h.media_id,
    library_id: h.library_id ?? 0,
    file_id: h.file_id ?? "",
    title: h.title,
    file_path: h.file_path ?? "",
    file_type: h.file_type || "video",
    duration: h.duration,
    width: 0,
    height: 0,
    format: "",
    status: "",
    poster_url: h.poster_url,
    backdrop_url: h.backdrop_url,
    encrypted_asset: h.encrypted_asset,
  };
}

export default function HomeScreen() {
  const router = useRouter();
  const appName = useConfigStore((s) => s.appName);
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [recent, setRecent] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const zone = useTvFocusStore((s) => s.zone);
  const exitContentUp = useTvFocusStore((s) => s.exitContentUp);
  const exitContentDown = useTvFocusStore((s) => s.exitContentDown);

  const load = useCallback(async () => {
    const [libR, histR] = await Promise.allSettled([
      fetchLibraries(),
      fetchContinueWatchingHistory(24),
    ]);

    const libs = libR.status === "fulfilled" ? libR.value : [];
    setLibraries(libs.filter((l) => l.enabled !== 0));
    setHistory(histR.status === "fulfilled" ? histR.value : []);

    if (libs.length === 0) {
      setRecent([]);
      return;
    }

    const recentItems: MediaItem[] = [];
    for (const lib of libs.slice(0, 3)) {
      try {
        recentItems.push(...(await fetchMedia(lib.id, { sort: "created_desc", limit: 8 })));
      } catch {
        /* keep partial recent list */
      }
    }
    setRecent(recentItems.slice(0, 12));
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load().finally(() => setLoading(false));
    }, [load]),
  );

  const shelfCount = (history.length > 0 ? 1 : 0) + 1 + (recent.length > 0 ? 1 : 0);
  const [activeShelf, setActiveShelf] = useState(0);
  const librariesShelfIndex = history.length > 0 ? 1 : 0;
  const recentShelfIndex = librariesShelfIndex + 1;

  if (loading) return <LoadingState label={t("common.loading")} />;

  const contentActive = zone === "content";
  const shelfDown = (shelfIndex: number) => {
    if (shelfIndex < shelfCount - 1) setActiveShelf(shelfIndex + 1);
    else exitContentDown();
  };
  const shelfUp = (shelfIndex: number) => {
    if (shelfIndex > 0) setActiveShelf(shelfIndex - 1);
    else exitContentUp();
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.brand}>{appName}</Text>

        {history.length > 0 ? (
          <HorizontalShelf
            title={t("home.continue")}
            data={history}
            enabled={contentActive && activeShelf === 0}
            keyExtractor={(h) => String(h.media_id)}
            empty={<Text style={styles.emptyHint}>{t("home.no_continue")}</Text>}
            onItemPress={(h) => router.push(`/player/${h.media_id}`)}
            onExitUp={() => shelfUp(0)}
            onExitDown={() => shelfDown(0)}
            renderItem={(h, _i, { selected }) => (
              <MediaCard
                tvSelected={selected}
                item={historyToMediaItem(h)}
                aspect="landscape"
                progress={h.duration > 0 ? (h.position / h.duration) * 100 : 0}
                onPress={() => router.push(`/player/${h.media_id}`)}
              />
            )}
          />
        ) : (
          <Text style={styles.emptyHint}>{t("home.no_continue")}</Text>
        )}

        <HorizontalShelf
          title={t("home.libraries")}
          data={libraries}
          enabled={contentActive && activeShelf === librariesShelfIndex}
          keyExtractor={(lib) => String(lib.id)}
          onItemPress={(lib) => router.push(`/library/${lib.id}`)}
          onExitUp={() => shelfUp(librariesShelfIndex)}
          onExitDown={() => shelfDown(librariesShelfIndex)}
          renderItem={(lib, _i, { selected }) => (
            <LibraryCard
              library={lib}
              tvSelected={selected}
              onPress={() => router.push(`/library/${lib.id}`)}
            />
          )}
        />

        {recent.length > 0 ? (
          <HorizontalShelf
            title={t("home.recent")}
            data={recent}
            enabled={contentActive && activeShelf === recentShelfIndex}
            keyExtractor={(item) => String(item.id)}
            onItemPress={(item) => router.push(`/media/${item.id}`)}
            onExitUp={() => shelfUp(recentShelfIndex)}
            onExitDown={() => shelfDown(recentShelfIndex)}
            renderItem={(item, _i, { selected }) => (
              <MediaCard tvSelected={selected} item={item} onPress={() => router.push(`/media/${item.id}`)} />
            )}
          />
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 120, paddingTop: spacing.lg },
  brand: {
    color: colors.text,
    fontSize: 36,
    fontWeight: "700",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  emptyHint: {
    color: colors.textSecondary,
    fontSize: 18,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
});
