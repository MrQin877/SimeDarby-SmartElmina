import { Image, View } from "react-native";
import { router } from "expo-router";
import { BadgeCheck, ChevronRight, Construction, HeartPulse, Zap } from "lucide-react-native";
import type { Announcement } from "../lib/data";
import { Badge, PressableFeedback, Surface, Typography } from "./Common";
import { colors, fonts, ui } from "../lib/theme";
import { useStore } from "../state/store";

export default function AnnouncementCard({ post, expanded = false, minimal = false }: { post: Announcement; expanded?: boolean; minimal?: boolean }) {
  const { data } = useStore();
  const acknowledged = data.acknowledgedNotices.includes(post.id);
  const Icon = post.icon === "road" ? Construction : post.icon === "light" ? Zap : HeartPulse;
  const category = post.category === "Roads" ? "TRANSPORT ADVISORY" : post.category === "Maintenance" ? "MAINTENANCE" : "COMMUNITY";
  const open = () => router.push({ pathname: "/announcement", params: { id: post.id } });
  if (minimal) return <PressableFeedback onPress={open} accessibilityLabel={`Read ${post.title}`} style={{ flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 16, borderBottomWidth: 1, borderColor: colors.border }}>
    <View style={{ flex: 1, gap: 6 }}><Typography style={{ fontFamily: fonts.bold, fontSize: 15, lineHeight: 21, color: colors.ink }}>{post.title}</Typography><Typography numberOfLines={2} style={ui.muted}>{post.summary || post.body}</Typography></View>
    {post.imageUrl ? <Image source={{ uri: post.imageUrl }} accessibilityLabel={post.title} style={{ width: 72, height: 72, borderRadius: 12 }} /> : <View style={{ width: 64, height: 64, borderRadius: 12, backgroundColor: colors.redSoft, alignItems: "center", justifyContent: "center" }}><Icon size={28} color={colors.red} strokeWidth={1.5} /></View>}
  </PressableFeedback>;
  return <Surface style={{ padding: 16, gap: 12, borderRadius: 0, borderBottomWidth: 1, borderColor: colors.border, shadowOpacity: 0, elevation: 0 }}>
    <View style={{ gap: 7 }}>
      <View style={[ui.row, { gap: 6, flexWrap: "wrap" }]}>
        <Badge>{category}</Badge>
        {acknowledged ? <Badge tone="green">✓ Ack’d</Badge> : post.priority === "high" ? <Badge tone="red">● Important</Badge> : null}
        <Typography style={[ui.muted, { fontSize: 10, marginLeft: "auto" }]}>{post.time}</Typography>
      </View>
    </View>
    <PressableFeedback onPress={open} accessibilityLabel={`Read ${post.title}`} style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
      <View style={{ flex: 1, gap: 5 }}>
        <Typography style={{ fontFamily: fonts.bold, fontSize: 15, lineHeight: 21, color: colors.ink }}>{post.title}</Typography>
        <Typography numberOfLines={expanded ? undefined : 2} style={ui.muted}>{post.summary || post.body}</Typography>
      </View>
      {post.imageUrl ? <Image source={{ uri: post.imageUrl }} accessibilityLabel={post.category} style={{ width: 64, height: 64, borderRadius: 12 }} /> : <View style={{ width: 64, height: 64, borderRadius: 12, backgroundColor: post.icon === "road" ? colors.redSoft : colors.surfaceSecondary, alignItems: "center", justifyContent: "center" }}><Icon size={30} color={post.icon === "road" ? colors.red : colors.muted} strokeWidth={1.5} /></View>}
    </PressableFeedback>
    <View style={[ui.between, { alignItems: "center", gap: 6 }]}>
      <View style={{ flexDirection: "row", gap: 4, alignItems: "center", flex: 1 }}>
        <BadgeCheck size={13} color={colors.red} />
        <Typography style={[ui.muted, { fontSize: 9, lineHeight: 13, flex: 1 }]}>{post.source || "Sime Darby Property Township Management"}</Typography>
      </View>
      <PressableFeedback onPress={open} style={{ minHeight: 44, flexDirection: "row", alignItems: "center", gap: 2 }}>
        <Typography style={{ fontFamily: fonts.semibold, color: colors.red, fontSize: 11 }}>View details</Typography>
        <ChevronRight size={14} color={colors.red} />
      </PressableFeedback>
    </View>
  </Surface>;
}
