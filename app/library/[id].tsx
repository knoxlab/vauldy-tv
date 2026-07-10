import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { fetchLibraries, fetchMedia } from "@/api/client";
import type { Library, MediaItem } from "@/api/types";
import EmptyState from "@/components/EmptyState";
import LoadingState, { Screen } from "@/components/LoadingState";
import MediaCard from "@/components/media/MediaCard";
import { colors, spacing } from "@/constants/theme";
import { isPhotoLibraryType, libraryFileType } from "@/lib/library";
import { t } from "@/i18n";

export default function LibraryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const libraryId = Number(id);
  const router = useRouter();
  const [library, setLibrary] = useState<Library | null>(null);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const libs = await fetchLibraries();
    const lib = libs.find((l) => l.id === libraryId) || null;
    setLibrary(lib);
    const fileType = lib ? libraryFileType(lib.type) : undefined;
    const sort = lib && isPhotoLibraryType(lib.type) ? "taken_desc" : "created_desc";
    const media = await fetchMedia(libraryId, {
      file_type: fileType,
      sort,
      limit: isPhotoLibraryType(lib?.type || "") ? 500 : 200,
    });
    setItems(media);
  }, [libraryId]);

  useEffect(() => {
    setLoading(true);
    load()
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [load]);

  if (loading) return <LoadingState />;

  const openItem = (item: MediaItem) => {
    if (item.file_type === "image") {
      router.push(`/photo/${item.id}`);
      return;
    }
    router.push(`/media/${item.id}`);
  };

  return (
    <Screen>
      <Text style={styles.title}>{library?.name || t("browse.title")}</Text>
      {library ? (
        <Text style={styles.subtitle}>{t("library.media_count", { count: library.media_count ?? items.length })}</Text>
      ) : null}
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        numColumns={5}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState />}
        renderItem={({ item, index }) => (
          <View style={styles.cell}>
            <MediaCard
              item={item}
              preferredFocus={index === 0}
              aspect={item.file_type === "video" ? "landscape" : "poster"}
              onPress={() => openItem(item)}
            />
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 32, fontWeight: "700", paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  subtitle: { color: colors.textSecondary, marginBottom: spacing.md, paddingHorizontal: spacing.lg, fontSize: 16 },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 48 },
  row: { gap: 16, marginBottom: 16 },
  cell: { flex: 1, maxWidth: "20%" },
});
