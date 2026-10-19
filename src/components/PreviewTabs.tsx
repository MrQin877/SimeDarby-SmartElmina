import { router } from "expo-router";
import { House, Map, MessagesSquare } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PressableFeedback, Surface, Typography } from "./Common";
import { colors, fonts } from "../lib/theme";
// Keep the three destinations visible during route preview; journey mode intentionally omits this.
export default function PreviewTabs() {
  const insets = useSafeAreaInsets();
  return (
    <Surface
      accessibilityRole="tablist"
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        flexDirection: "row",
        height: 68 + insets.bottom,
        paddingBottom: insets.bottom,
      }}
    >
      {(
        [
          { title: "Home", path: "/home", Icon: House },
          { title: "Explore", path: "/explore", Icon: Map },
          { title: "Community", path: "/community", Icon: MessagesSquare },
        ] as const
      ).map(({ title, path, Icon }) => {
        const active = title === "Explore";
        return (
          <PressableFeedback
            key={path}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => router.replace(path)}
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Icon
              size={21}
              color={active ? colors.red : colors.muted}
              fill={active ? colors.red : "transparent"}
              strokeWidth={active ? 2.1 : 1.8}
            />
            <Typography
              style={{
                fontFamily: fonts.semibold,
                color: active ? colors.red : colors.muted,
                fontSize: 11,
                fontWeight: "600",
                letterSpacing: -0.1,
              }}
            >
              {title}
            </Typography>
          </PressableFeedback>
        );
      })}
    </Surface>
  );
}
