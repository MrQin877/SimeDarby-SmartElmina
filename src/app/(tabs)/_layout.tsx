import { useEffect, useState } from "react";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Tabs } from "expo-router";
import { House, Map, MessagesSquare, type LucideIcon } from "lucide-react-native";
import { ExploreSheetContext } from "../../components/ExploreSheetContext";
import { colors, fonts } from "../../lib/theme";

function TabIcon({
  icon: Icon,
  color,
  focused,
}: {
  icon: LucideIcon;
  color: string;
  focused: boolean;
}) {
  const opacity = useSharedValue(focused ? 1 : 0.78);

  useEffect(() => {
    opacity.set(
      withTiming(focused ? 1 : 0.78, {
        duration: 200,
        easing: Easing.out(Easing.ease),
      }),
    );
  }, [focused, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.get(),
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Icon
        size={21}
        color={color}
        fill={focused ? color : "transparent"}
        strokeWidth={focused ? 2.1 : 1.8}
      />
    </Animated.View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const [sheetVisible, setSheetVisible] = useState(false);
  return (
    <ExploreSheetContext.Provider value={setSheetVisible}>
    <Tabs
      initialRouteName="home"
      screenOptions={{
        headerShown: false,
        animation: "fade",
        tabBarActiveTintColor: colors.red,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          display: sheetVisible ? "none" : "flex",
          backgroundColor: colors.white,
          borderTopColor: colors.border,
          paddingTop: 8,
          height: 68 + insets.bottom,
          shadowColor: "#09090B",
          shadowOpacity: 0.04,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: -3 },
          elevation: 6,
        },
        tabBarLabelStyle: {
          fontFamily: fonts.semibold,
          fontSize: 11,
          fontWeight: "600",
          letterSpacing: -0.1,
          paddingBottom: 4,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={House} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={Map} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: "Community",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={MessagesSquare} color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
    </ExploreSheetContext.Provider>
  );
}
