import { HeroUINativeProvider } from "heroui-native/provider";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Uniwind } from "uniwind";
import type { ReactNode } from "react";
Uniwind.setTheme("light");
export default function Providers({ children }: { children: ReactNode }) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <HeroUINativeProvider>{children}</HeroUINativeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
