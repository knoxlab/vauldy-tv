import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { fetchFavorites } from "@/api/client";
import type { MediaItem } from "@/api/types";
import EmptyState from "@/components/EmptyState";
import LoadingState, { Screen } from "@/components/LoadingState";
import MediaCard from "@/components/media/MediaCard";
import { colors, spacing } from "@/constants/theme";
import { t } from "@/i18n";

export default function FavoritesScreen() {
  const router = useRouter();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

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
        data={items}
        keyExtractor={(item) => String(item.id)}
        numColumns={4}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState />}
        renderItem={({ item, index }) => (
          <View style={styles.cell}>
            <MediaCard
              item={item}
              preferredFocus={index === 0}
              onPress={() => router.push(`/media/${item.id}`)}
            />
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 32, fontWeight: "700", padding: spacing.lg },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 48 },
  row: { gap: 16, marginBottom: 16 },
  cell: { flex: 1, maxWidth: "25%" },
});
