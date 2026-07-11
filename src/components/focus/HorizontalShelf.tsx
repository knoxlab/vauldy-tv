import { useCallback, useRef } from "react";
import { FlatList, StyleSheet, Text, View, type ListRenderItemInfo } from "react-native";
import { colors, spacing } from "@/constants/theme";
import { useTvRemoteNav } from "@/hooks/useTvRemoteNav";
import { useTvFocusStore } from "@/store/tvFocus";

export type ShelfRenderCtx = {
  selected: boolean;
  scrollIntoView: () => void;
};

type Props<T> = {
  title: string;
  data: readonly T[];
  keyExtractor: (item: T, index: number) => string;
  renderItem: (item: T, index: number, ctx: ShelfRenderCtx) => React.ReactNode;
  onItemPress?: (item: T, index: number) => void;
  empty?: React.ReactNode;
  enabled?: boolean;
  onExitLeft?: () => void;
  onExitUp?: () => void;
  onExitDown?: () => void;
};

export default function HorizontalShelf<T>({
  title,
  data,
  keyExtractor,
  renderItem,
  onItemPress,
  empty,
  enabled = true,
  onExitLeft,
  onExitUp,
  onExitDown,
}: Props<T>) {
  const listRef = useRef<FlatList<T>>(null);
  const zone = useTvFocusStore((s) => s.zone);
  const setZone = useTvFocusStore((s) => s.setZone);
  const exitContentUp = useTvFocusStore((s) => s.exitContentUp);
  const exitContentDown = useTvFocusStore((s) => s.exitContentDown);

  const scrollToIndex = useCallback(
    (index: number) => {
      if (index < 0 || index >= data.length) return;
      listRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
    },
    [data.length],
  );

  const { index: focusIndex } = useTvRemoteNav({
    mode: "horizontal",
    count: data.length,
    enabled: enabled && data.length > 0 && zone === "content",
    onSelect: (i) => {
      const item = data[i];
      if (item !== undefined) onItemPress?.(item, i);
    },
    onIndexChange: scrollToIndex,
    onExitLeft: onExitLeft ?? (() => setZone("sidebar")),
    onExitUp: onExitUp ?? (() => {
      exitContentUp();
    }),
    onExitDown: onExitDown ?? (() => {
      exitContentDown();
    }),
  });

  const renderListItem = useCallback(
    ({ item, index }: ListRenderItemInfo<T>) => (
      <View style={styles.item}>
        {renderItem(item, index, {
          selected: focusIndex >= 0 && focusIndex === index,
          scrollIntoView: () => scrollToIndex(index),
        })}
      </View>
    ),
    [focusIndex, renderItem, scrollToIndex],
  );

  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title}</Text>
      {data.length === 0 && empty ? (
        <View style={styles.empty}>{empty}</View>
      ) : (
        <FlatList
          ref={listRef}
          horizontal
          data={data as T[]}
          keyExtractor={keyExtractor}
          renderItem={renderListItem}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
          removeClippedSubviews={false}
          onScrollToIndexFailed={(info) => {
            listRef.current?.scrollToOffset({ offset: info.averageItemLength * info.index, animated: true });
            setTimeout(() => scrollToIndex(info.index), 80);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: spacing.xl },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "700",
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  row: { paddingHorizontal: spacing.lg },
  item: { flexShrink: 0, marginRight: 16 },
  empty: { paddingHorizontal: spacing.lg },
});
