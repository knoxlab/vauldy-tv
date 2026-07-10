import { Slot } from "expo-router";
import { StyleSheet, View } from "react-native";
import MusicBar from "@/components/MusicBar";
import Sidebar from "@/components/Sidebar";
import { colors } from "@/constants/theme";
import { usePlayerStore } from "@/store/player";

export default function MainLayout() {
  const fileType = usePlayerStore((s) => s.fileType);
  const showMusicBar = fileType === "audio";

  return (
    <View style={styles.root}>
      <Sidebar />
      <View style={styles.content}>
        <View style={styles.page}>
          <Slot />
        </View>
        {showMusicBar ? <MusicBar /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: "row", backgroundColor: colors.background },
  content: { flex: 1 },
  page: { flex: 1 },
});
