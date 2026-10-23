import type { ReactNode } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, type Href } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { IconButton, Typography } from "./Common";
import { colors, fonts, ui } from "../lib/theme";
export default function RewardScreen({ title, children, right, footer, backTo = "/rewards" }: { title: string; children: ReactNode; right?: ReactNode; footer?: ReactNode; backTo?: Href }) {
  return <SafeAreaView style={ui.screen} edges={["top", "bottom"]}>
    <View collapsable={false} style={{ height: 56, flexDirection: "row", alignItems: "center", paddingHorizontal: 18, gap: 8, borderBottomWidth: 1, borderColor: colors.border }}>
      <IconButton icon={ArrowLeft} label="Go back" onPress={() => router.canGoBack() ? router.back() : router.replace(backTo)} style={{ borderWidth: 0, backgroundColor: "transparent" }} />
      <Typography.Heading numberOfLines={1} style={{ flex: 1, textAlign: "center", fontFamily: fonts.semibold, fontSize: 17, color: colors.ink }}>{title}</Typography.Heading>
      {right || <View style={{ width: 40 }} />}
    </View>
    <View style={{ flex: 1 }}>{children}</View>
    {footer && <View style={{ borderTopWidth: 1, borderColor: colors.border, backgroundColor: colors.white, padding: 16 }}>{footer}</View>}
  </SafeAreaView>;
}
