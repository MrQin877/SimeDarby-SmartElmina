import type { ReactNode } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
// HeroUI Native targets iOS/Android. The web review uses matching RN primitives.
export default function Providers({ children }: { children: ReactNode }) {
  return <SafeAreaProvider>{children}</SafeAreaProvider>;
}
