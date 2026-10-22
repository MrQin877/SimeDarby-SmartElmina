import { useEffect } from "react";
import "../../global.css";
import {
  useFonts,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from "@expo-google-fonts/dm-sans";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import BusReminderAlerts from "../components/BusReminderAlerts";
import Providers from "../components/Providers";
import { Spinner } from "../components/Common";
import { useAppToast } from "../hooks/useAppToast";
import { StoreProvider, useStore } from "../state/store";
import { colors } from "../lib/theme";
export { ErrorBoundary } from "expo-router";
function Screens() {
  const { ready, storageError } = useStore();
  const notify = useAppToast();
  useEffect(() => { if (storageError) notify(storageError, "error", "persistent"); }, [storageError, notify]);
  const [fontsLoaded, fontError] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  });
  if (!ready || (!fontsLoaded && !fontError))
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.background,
        }}
      >
        <Spinner color="danger" size="lg" />
      </View>
    );
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="(tabs)" options={{ animation: "fade" }} />
        <Stack.Screen name="search" options={{ animation: "fade" }} />
        <Stack.Screen name="route" options={{ animation: "fade" }} />
        <Stack.Screen name="journey" options={{ animation: "fade" }} />
        <Stack.Screen name="rewards" />
        <Stack.Screen name="my-rewards" />
        <Stack.Screen name="point-history" />
        <Stack.Screen name="perks" />
        <Stack.Screen name="voucher/[id]" />
        <Stack.Screen name="alerts" options={{ animation: "slide_from_right" }} />
      </Stack>
      <BusReminderAlerts />
    </>
  );
}
export default function RootLayout() {
  return (
    <StoreProvider>
      <Providers>
        <Screens />
      </Providers>
    </StoreProvider>
  );
}
