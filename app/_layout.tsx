import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { setUnauthorizedHandler } from "@/api/client";
import { useAuthStore } from "@/store/auth";
import { useConfigStore } from "@/store/config";

function useProtectedRoute() {
  const router = useRouter();
  const segments = useSegments();
  const token = useAuthStore((s) => s.token);
  const serverUrl = useConfigStore((s) => s.serverUrl);

  useEffect(() => {
    setUnauthorizedHandler(() => router.replace("/login"));
  }, [router]);

  useEffect(() => {
    const inAuth = segments[0] === "login" || segments[0] === "setup";
    if (!serverUrl) {
      if (segments[0] !== "setup") router.replace("/setup");
      return;
    }
    if (!token) {
      if (!inAuth) router.replace("/login");
      return;
    }
    if (inAuth) router.replace("/(main)");
  }, [token, serverUrl, segments, router]);
}

export default function RootLayout() {
  useProtectedRoute();
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#0f1419" },
          animation: "fade",
        }}
      >
        <Stack.Screen name="setup" />
        <Stack.Screen name="login" />
        <Stack.Screen name="(main)" />
        <Stack.Screen name="library/[id]" />
        <Stack.Screen name="media/[id]" />
        <Stack.Screen name="player/[id]" options={{ presentation: "fullScreenModal" }} />
        <Stack.Screen name="reader/[id]" />
        <Stack.Screen name="photo/[id]" options={{ presentation: "fullScreenModal" }} />
      </Stack>
    </>
  );
}
