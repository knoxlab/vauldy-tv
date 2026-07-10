import { ResizeMode, Video, type AVPlaybackStatus } from "expo-av";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import {
  fetchMediaDetail,
  fetchPlaybackPlan,
  playbackEnd,
  playbackStart,
  saveProgress,
} from "@/api/client";
import FocusablePressable from "@/components/focus/FocusablePressable";
import { colors } from "@/constants/theme";
import { t } from "@/i18n";
import { mediaPlaySrc, mediaPosterSrc, withAccessToken } from "@/lib/mediaUrl";
import { usePlayerStore } from "@/store/player";

export default function PlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const mediaId = Number(id);
  const router = useRouter();
  const videoRef = useRef<Video>(null);
  const [uri, setUri] = useState<string | null>(null);
  const [audioOnly, setAudioOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastPosition = useRef(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const detail = await fetchMediaDetail(mediaId);
        const poster = mediaPosterSrc(detail);
        setAudioOnly(detail.file_type === "audio");
        usePlayerStore.getState().setNowPlaying(detail, poster || null);
        await playbackStart(mediaId);
        if (detail.file_type === "audio") {
          setUri(mediaPlaySrc(mediaId));
          return;
        }
        const plan = await fetchPlaybackPlan(mediaId);
        if (plan.hls_master) setUri(withAccessToken(plan.hls_master));
        else if (plan.fallback) setUri(withAccessToken(plan.fallback));
        else setUri(mediaPlaySrc(mediaId));
      } catch {
        if (mounted) setError(t("player.error"));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
      playbackEnd(mediaId).catch(() => {});
      if (lastPosition.current > 0) {
        saveProgress(mediaId, Math.floor(lastPosition.current)).catch(() => {});
      }
      if (!audioOnly) usePlayerStore.getState().clear();
    };
  }, [mediaId, audioOnly]);

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      if (status.error) setError(t("player.error"));
      return;
    }
    lastPosition.current = status.positionMillis / 1000;
    usePlayerStore.getState().setPlaying(status.isPlaying);
    if (status.didJustFinish) {
      saveProgress(mediaId, Math.floor(lastPosition.current), true).catch(() => {});
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.brand} size="large" />
        <Text style={styles.loadingText}>{t("player.loading")}</Text>
      </View>
    );
  }

  if (error || !uri) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error || t("player.error")}</Text>
        <FocusablePressable preferredFocus onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>{t("common.back")}</Text>
        </FocusablePressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <FocusablePressable preferredFocus onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>{t("common.back")}</Text>
        </FocusablePressable>
      </View>
      <Video
        ref={videoRef}
        source={{ uri }}
        style={audioOnly ? styles.audio : styles.video}
        resizeMode={ResizeMode.CONTAIN}
        useNativeControls
        shouldPlay
        onPlaybackStatusUpdate={onPlaybackStatusUpdate}
        onError={() => setError(t("player.error"))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  video: { flex: 1, width: "100%" },
  audio: { width: 1, height: 1 },
  toolbar: { position: "absolute", top: 24, left: 24, zIndex: 10 },
  center: { flex: 1, backgroundColor: "#000", alignItems: "center", justifyContent: "center", gap: 16 },
  loadingText: { color: colors.textSecondary, fontSize: 18 },
  errorText: { color: colors.error, fontSize: 20 },
  backBtn: { backgroundColor: colors.overlay, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
  backText: { color: colors.brand, fontSize: 18 },
});
