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
import Providers from "../components/Providers";
import { Alert, Spinner } from "../components/Common";
import { StoreProvider, useStore } from "../state/store";
import { colors } from "../lib/theme";
export { ErrorBoundary } from "expo-router";
function Screens() {
  const { ready, storageError } = useStore();
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
      </Stack>
      <View pointerEvents="none">
        {storageError && (
          <Alert status="danger" style={{ margin: 8 }}>
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Description style={{ color: colors.red }}>
                {storageError}
              </Alert.Description>
            </Alert.Content>
          </Alert>
        )}
      </View>
    </>
  );
}
export default function RootLayout() {
  return (
    <Providers>
      <StoreProvider>
        <Screens />
      </StoreProvider>
    </Providers>
  );
}
