import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import {
  fetchDocumentDetail,
  fetchDocumentPreviewInfo,
  fetchMediaDetail,
  fetchReadProgress,
  saveReadProgress,
} from "@/api/client";
import LoadingState, { Screen } from "@/components/LoadingState";
import { colors, spacing } from "@/constants/theme";
import { t } from "@/i18n";
import { documentPreviewSrc, mediaPlaySrc } from "@/lib/mediaUrl";

export default function ReaderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const mediaId = Number(id);
  const [title, setTitle] = useState("");
  const [uri, setUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notReady, setNotReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [detail, media] = await Promise.all([fetchDocumentDetail(mediaId), fetchMediaDetail(mediaId)]);
        setTitle(detail.title || media.title);
        const ext = (media.format || media.file_path || "").toLowerCase();
        if (ext.endsWith(".pdf")) {
          setUri(mediaPlaySrc(mediaId));
          return;
        }
        if ([".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx"].some((s) => ext.endsWith(s))) {
          const info = await fetchDocumentPreviewInfo(mediaId);
          if (info.preview_ready) setUri(documentPreviewSrc(mediaId));
          else setNotReady(true);
          return;
        }
        setUri(mediaPlaySrc(mediaId));
      } catch {
        setNotReady(true);
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      fetchReadProgress(mediaId)
        .then((p) => {
          if (p) saveReadProgress(mediaId, p.position, p.percent).catch(() => {});
        })
        .catch(() => {});
    };
  }, [mediaId]);

  if (loading) return <LoadingState label={t("reader.loading")} />;

  if (notReady || !uri) {
    return (
      <Screen>
        <View style={styles.center}>
          <Text style={styles.text}>{t("reader.not_ready")}</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={styles.title}>{title}</Text>
      <WebView
        source={{ uri }}
        style={styles.webview}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loader}>
            <ActivityIndicator color={colors.brand} size="large" />
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 28, fontWeight: "700", padding: spacing.lg },
  webview: { flex: 1, backgroundColor: colors.background },
  loader: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  text: { color: colors.textSecondary, fontSize: 20 },
});
