import { useRef, useState, type ReactNode, type RefObject } from "react";
import { Animated, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, type Href } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useTextStyle } from "../hooks/useTextStyle";
import { colors, ui } from "../lib/theme";

export function Page({ children, title, subtitle, back = false, right, stickyTitle = title, floating, header, stickyHeader, scrollRef, onContentSizeChange, bottomInset = 100, backTo = "/home" }: {
  children?: ReactNode;
  title?: string;
  subtitle?: string;
  back?: boolean;
  backTo?: Href;
  right?: ReactNode;
  stickyTitle?: string;
  floating?: ReactNode;
  header?: ReactNode | ((scroll: Animated.Value, compact: boolean) => ReactNode);
  stickyHeader?: ReactNode;
  scrollRef?: RefObject<ScrollView | null>;
  bottomInset?: number;
  onContentSizeChange?: (width: number, height: number) => void;
}) {
  const titleStyle = useTextStyle(ui.title, 28);
  const subtitleStyle = useTextStyle(ui.muted, 12);
  const [compactHeader, setCompactHeader] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const scroll = useRef(new Animated.Value(0)).current;
  const opacity = scroll.interpolate({ inputRange: [40, 65], outputRange: [0, 1], extrapolate: "clamp" });
  return (
    <SafeAreaView style={ui.screen} edges={back ? ["top", "bottom"] : ["top"]}>
      {back && (
        <View style={[ui.between, { height: 56, paddingHorizontal: 18 }]}>
          <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={() => router.canGoBack() ? router.back() : router.replace(backTo)} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.white, alignItems: "center", justifyContent: "center" }}>
            <ArrowLeft size={22} color={colors.ink} />
          </Pressable>
          <Animated.Text style={[ui.heading, { opacity, flex: 1, textAlign: "center", fontSize: 16 }]} numberOfLines={1}>{stickyTitle}</Animated.Text>
          {right ?? <View style={{ width: 40 }} />}
        </View>
      )}
      {header && <View style={{ zIndex: 3, backgroundColor: colors.background }}>{typeof header === "function" ? header(scroll, compactHeader) : header}</View>}
      <View style={{ flex: 1 }}>
        <ScrollView ref={scrollRef} onContentSizeChange={onContentSizeChange} scrollEventThrottle={16} onScroll={(event) => { const y = event.nativeEvent.contentOffset.y; scroll.setValue(y); setCollapsed(y > 40); setCompactHeader(y > 35); }} contentContainerStyle={[ui.page, floating ? { paddingBottom: bottomInset } : null]} keyboardShouldPersistTaps="handled">
          {title && <View style={ui.between}>
            <View style={{ flex: 1, gap: 6 }}>
              <Text accessibilityRole="header" style={titleStyle}>{title}</Text>
              {subtitle && <Text style={subtitleStyle}>{subtitle}</Text>}
            </View>
            {!back && right}
          </View>}
          {children}
        </ScrollView>
        {!back && (stickyTitle || stickyHeader) && <Animated.View pointerEvents={collapsed && stickyHeader ? "auto" : "none"} aria-hidden={!collapsed} accessibilityElementsHidden={!collapsed} style={{ position: "absolute", top: 0, left: 0, right: 0, minHeight: stickyHeader ? 64 : 48, justifyContent: "center", paddingHorizontal: 22, backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.border, opacity }}>
          {stickyHeader || <Text style={[ui.heading, { fontSize: 16 }]}>{stickyTitle}</Text>}
        </Animated.View>}
        {floating}
      </View>
    </SafeAreaView>
  );
}
