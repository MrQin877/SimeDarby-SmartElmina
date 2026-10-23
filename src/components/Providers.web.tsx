import { HeroUINativeProvider } from "heroui-native/provider";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { Uniwind } from "uniwind";
import type { ReactNode } from "react";
Uniwind.setTheme("light");
function HeroUIWithDynamicInsets({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <HeroUINativeProvider
      config={{
        toast: {
          defaultProps: { placement: "top" },
          insets: { top: Math.max(60, insets.top + 8), bottom: Math.max(24, insets.bottom + 8), left: Math.max(16, insets.left + 8), right: Math.max(16, insets.right + 8) },
          maxVisibleToasts: 2,
        },
      }}
    >
      {children}
    </HeroUINativeProvider>
  );
}

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <HeroUIWithDynamicInsets>{children}</HeroUIWithDynamicInsets>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
