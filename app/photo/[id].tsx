import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { fetchMediaDetail } from "@/api/client";
import FocusablePressable from "@/components/focus/FocusablePressable";
import LoadingState from "@/components/LoadingState";
import { useMusicPreviewBar } from "@/hooks/useMusicPreviewBar";
import { colors } from "@/constants/theme";
import { photoMediumSrc } from "@/lib/mediaUrl";

export default function PhotoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const mediaId = Number(id);
  const router = useRouter();
  const [uri, setUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useMusicPreviewBar();

  useEffect(() => {
    fetchMediaDetail(mediaId)
      .then(() => setUri(photoMediumSrc(mediaId)))
      .catch(() => setUri(null))
      .finally(() => setLoading(false));
  }, [mediaId]);

  if (loading) return <LoadingState />;

  return (
    <View style={styles.container}>
      <FocusablePressable preferredFocus onPress={() => router.back()} style={styles.close}>
        <View />
      </FocusablePressable>
      {uri ? <Image source={{ uri }} style={styles.image} contentFit="contain" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundDeep, justifyContent: "center" },
  image: { width: "100%", height: "100%" },
  close: { position: "absolute", top: 24, right: 24, width: 48, height: 48, zIndex: 10 },
});
