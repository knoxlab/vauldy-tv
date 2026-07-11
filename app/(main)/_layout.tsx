import { Slot, usePathname } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Sidebar from "@/components/Sidebar";
import { colors } from "@/constants/theme";
import { useTvFocusStore } from "@/store/tvFocus";

export default function MainLayout() {
  const pathname = usePathname();
  const setZone = useTvFocusStore((s) => s.setZone);

  // Entering a main tab page: start focus in content.
  useEffect(() => {
    setZone("content");
  }, [pathname, setZone]);

  return (
    <View style={styles.root}>
      <Sidebar />
      <View style={styles.content}>
        <Slot />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: "row", backgroundColor: colors.background },
  content: { flex: 1 },
});
