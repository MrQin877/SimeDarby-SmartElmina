import { useEffect, useState } from "react";
import { Animated, ScrollView, View } from "react-native";
import { router } from "expo-router";
import { AlertTriangle, Bus, Car, Megaphone, MessageSquare, CheckCheck, Wrench } from "lucide-react-native";
import { Button, DemoNote, FilterChip, IconButton, Page, PressableFeedback, Surface, Typography } from "../components/Common";
import { colors, fonts, ui } from "../lib/theme";
import { useAppToast } from "../hooks/useAppToast";
import { useStore } from "../state/store";
import { initialAlerts } from "../lib/data";
import type { AlertItem } from "../lib/model";

const filters = ["All", "Alerts", "Mobility", "Official"] as const;
function matchesFilter(item: AlertItem, filter: string) {
  if (filter === "Alerts") return item.type === "urgent" || item.type === "maintenance";
  if (filter === "Mobility") return item.type === "mobility" || item.type === "shuttle";
  if (filter === "Official") return item.type === "official";
  return true;
}
const icons = { urgent: AlertTriangle, mobility: Car, shuttle: Bus, official: Megaphone, social: MessageSquare, maintenance: Wrench };

export default function AlertsScreen() {
  const { data, update } = useStore();
  const notify = useAppToast();
  const [filter, setFilter] = useState<string>("All");
  const [expanded, setExpanded] = useState<string | null>(null);
  const open = (id: string) => {
    setExpanded((previous) => previous === id ? null : id);
    update((d) => ({ ...d, readAlerts: Array.from(new Set([...d.readAlerts, id])) }));
  };
  return <Page title="Notifications" back right={<IconButton icon={CheckCheck} color={colors.red} label="Mark all read" onPress={() => { update((d) => ({ ...d, readAlerts: Array.from(new Set([...d.readAlerts, ...initialAlerts.map((alert) => alert.id)])) })); notify("All notifications marked as read.", "success"); }} />}>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>{filters.map((label) => <FilterChip key={label} label={label} selected={filter === label} onPress={() => setFilter(label)} />)}</ScrollView>
    <Surface style={[ui.card, { padding: 0, gap: 0, overflow: "hidden" }]}>
      {initialAlerts.filter((item) => matchesFilter(item, filter)).sort((a, b) => Number(b.type === "maintenance") - Number(a.type === "maintenance")).map((item, index) => {
        const Icon = icons[item.type];
        const isRead = item.isRead || data.readAlerts.includes(item.id);
        const isExpanded = expanded === item.id;
        return <View key={item.id} style={{ padding: 16, borderTopWidth: index ? 1 : 0, borderColor: colors.border }}>
          <PressableFeedback accessibilityLabel={item.title} accessibilityState={{ expanded: isExpanded }} onPress={() => open(item.id)} style={{ gap: 12 }}>
            <View style={{ flexDirection: "row", gap: 12, alignItems: "flex-start" }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: item.isImportant ? colors.redSoft : colors.surfaceSecondary, alignItems: "center", justifyContent: "center" }}>
              <Icon size={20} color={item.isImportant ? colors.red : colors.ink} />

            </View>
            <View style={{ flex: 1, gap: 5 }}>
              <Typography style={{ fontFamily: fonts.bold, fontSize: 14, lineHeight: 20, color: colors.ink }}>{item.title}</Typography>
              <Typography numberOfLines={2} style={[ui.muted, { fontSize: 13 }]}>{item.subtitle}</Typography>
              <Typography style={[ui.muted, { fontSize: 10 }]}>{item.timestamp}</Typography>
            </View>
            {!isRead && <View accessibilityLabel="Unread notification" style={{ width: 8, height: 8, marginTop: 6, borderRadius: 4, backgroundColor: colors.red }} />}
            </View>
          </PressableFeedback>
          <NotificationDetails expanded={isExpanded}>
            <Typography style={[ui.body, { fontSize: 13 }]}>{item.content}</Typography>
            {item.quote && <Typography style={[ui.muted, { fontStyle: "italic" }]}>{item.quote}</Typography>}
            <Typography style={ui.muted}>Impact area: {item.type === "mobility" ? "GCE Exit 3502 · Persiaran Atmosfera merge corridor" : item.type === "shuttle" ? "Valley & Central Park Circular · Route S1" : item.type === "maintenance" ? "Gate 3 sensor and access lanes" : item.type === "urgent" ? item.subtitle : item.source}</Typography>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {(item.type === "mobility" || item.type === "shuttle") && <Button isDisabled={!isExpanded} variant="ghost" size="sm" onPress={() => router.push(item.type === "shuttle" ? "/(tabs)/explore?sheet=shuttle" : "/(tabs)/explore?sheet=traffic_details")} style={{ minHeight: 40, paddingHorizontal: 10 }}><Button.Label style={{ color: colors.red, fontSize: 12 }}>View on Map</Button.Label></Button>}
            </View>
          </NotificationDetails>
        </View>;
      })}
    </Surface>
    <DemoNote />
  </Page>;
}

function NotificationDetails({ children, expanded }: { children: React.ReactNode; expanded: boolean }) {
  const [animation] = useState(() => new Animated.Value(0));
  const [contentHeight, setContentHeight] = useState(0);
  useEffect(() => {
    Animated.timing(animation, { toValue: expanded ? 1 : 0, duration: 220, useNativeDriver: false }).start();
  }, [animation, expanded]);
  return <Animated.View pointerEvents={expanded ? "auto" : "none"} aria-hidden={!expanded} accessibilityElementsHidden={!expanded} importantForAccessibility={expanded ? "auto" : "no-hide-descendants"} style={{ height: animation.interpolate({ inputRange: [0, 1], outputRange: [0, contentHeight] }), opacity: animation, overflow: "hidden" }}>
    <View onLayout={(event) => setContentHeight(event.nativeEvent.layout.height)} style={{ position: "absolute", top: 0, left: 0, right: 0, paddingTop: 14, gap: 12 }}>{children}</View>
  </Animated.View>;
}
