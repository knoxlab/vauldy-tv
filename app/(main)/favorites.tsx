import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { FlatList, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { fetchFavorites } from "@/api/client";
import type { MediaItem } from "@/api/types";
import EmptyState from "@/components/EmptyState";
import LoadingState, { Screen } from "@/components/LoadingState";
import MediaCard from "@/components/media/MediaCard";
import { colors, spacing } from "@/constants/theme";
import { SIDEBAR_WIDTH } from "@/constants/layout";
import { useTvRemoteNav } from "@/hooks/useTvRemoteNav";
import { useTvFocusStore } from "@/store/tvFocus";
import { t } from "@/i18n";

const GRID_COLUMNS = 4;
const GRID_GAP = 16;
const GRID_ROW_GAP = 16;

export default function FavoritesScreen() {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const listRef = useRef<FlatList<MediaItem[]>>(null);

  const itemWidth = useMemo(() => {
    const horizontalPadding = spacing.lg * 2;
    const availableWidth = Math.max(0, screenWidth - SIDEBAR_WIDTH - horizontalPadding);
    return Math.floor((availableWidth - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS);
  }, [screenWidth]);

  const gridRows = useMemo(() => {
    const rows: MediaItem[][] = [];
    for (let i = 0; i < items.length; i += GRID_COLUMNS) {
      rows.push(items.slice(i, i + GRID_COLUMNS));
    }
    return rows;
  }, [items]);

  const scrollToItem = useCallback((index: number) => {
    const row = Math.floor(index / GRID_COLUMNS);
    listRef.current?.scrollToIndex({ index: row, animated: true, viewPosition: 0.35 });
  }, []);

  const openItem = useCallback((item: MediaItem) => {
    router.push(`/media/${item.id}`);
  }, [router]);

  const zone = useTvFocusStore((s) => s.zone);
  const setZone = useTvFocusStore((s) => s.setZone);
  const exitContentUp = useTvFocusStore((s) => s.exitContentUp);
  const exitContentDown = useTvFocusStore((s) => s.exitContentDown);

  const { index: focusIndex } = useTvRemoteNav({
    mode: "grid",
    columns: GRID_COLUMNS,
    count: items.length,
    enabled: zone === "content",
    onSelect: (i) => {
      const item = items[i];
      if (item) openItem(item);
    },
    onIndexChange: scrollToItem,
    onExitLeft: () => setZone("sidebar"),
    onExitUp: () => {
      exitContentUp();
    },
    onExitDown: () => {
      exitContentDown();
    },
  });

  useEffect(() => {
    fetchFavorites()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;

  return (
    <Screen>
      <Text style={styles.title}>{t("favorites.title")}</Text>
      <FlatList
        ref={listRef}
        data={gridRows}
        keyExtractor={(_, rowIndex) => `row-${rowIndex}`}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState />}
        removeClippedSubviews={false}
        onScrollToIndexFailed={(info) => {
          listRef.current?.scrollToOffset({ offset: info.averageItemLength * info.index, animated: true });
        }}
        renderItem={({ item: row, index: rowIndex }) => (
          <View style={styles.row}>
            {row.map((item, colIndex) => {
              const itemIndex = rowIndex * GRID_COLUMNS + colIndex;
              return (
                <View
                  key={item.id}
                  style={[styles.cell, { width: itemWidth, marginRight: colIndex < row.length - 1 ? GRID_GAP : 0 }]}
                >
                  <MediaCard
                    item={item}
                    layout="grid"
                    tvSelected={focusIndex >= 0 && focusIndex === itemIndex}
                    onPress={() => openItem(item)}
                  />
                </View>
              );
            })}
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 32, fontWeight: "700", padding: spacing.lg },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 120 },
  row: { flexDirection: "row", marginBottom: GRID_ROW_GAP },
  cell: { flexShrink: 0 },
});
