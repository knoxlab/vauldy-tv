import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { fetchLibraries } from "@/api/client";
import type { Library } from "@/api/types";
import EmptyState from "@/components/EmptyState";
import HorizontalShelf from "@/components/focus/HorizontalShelf";
import LoadingState, { Screen } from "@/components/LoadingState";
import LibraryCard from "@/components/media/LibraryCard";
import { colors, spacing } from "@/constants/theme";
import { t } from "@/i18n";

export default function BrowseScreen() {
  const router = useRouter();
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLibraries()
      .then((libs) => setLibraries(libs.filter((l) => l.enabled !== 0)))
      .catch(() => setLibraries([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>{t("browse.title")}</Text>
        {libraries.length === 0 ? (
          <EmptyState />
        ) : (
          <HorizontalShelf title={t("home.libraries")}>
            {libraries.map((lib, i) => (
              <LibraryCard
                key={lib.id}
                library={lib}
                preferredFocus={i === 0}
                onPress={() => router.push(`/library/${lib.id}`)}
              />
            ))}
          </HorizontalShelf>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingTop: spacing.lg, paddingBottom: 48 },
  title: { color: colors.text, fontSize: 32, fontWeight: "700", paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
});
