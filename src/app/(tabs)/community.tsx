import { useEffect, useState } from "react";
import { Animated, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Plus, Bookmark, Flame, Bus, House, Construction, Zap, HeartPulse, SlidersHorizontal, UserCheck } from "lucide-react-native";
import { announcements } from "../../lib/data";
import { announcementFilters, filterAnnouncements, discussionFilterPills, discussionFilters, filterDiscussions, mergeDiscussions, type AnnouncementFilter, type DiscussionFilter } from "../../lib/community";
import { Button, DemoNote, Page, PressableFeedback, Surface, Typography } from "../../components/Common";
import MenuSheet from "../../components/MenuSheet";
import CommunityFilterButton from "../../components/CommunityFilterButton";
import LineTabs from "../../components/LineTabs";
import AnnouncementCard from "../../components/AnnouncementCard";
import DiscussionCard from "../../components/DiscussionCard";
import { CreatePostModal } from "../../components/CreatePostModal";
import { colors, fonts, ui } from "../../lib/theme";
import { useStore } from "../../state/store";

export default function Community() {
  const params = useLocalSearchParams<{ tab?: string }>();
  const { data } = useStore();
  const [activeTab, setActiveTab] = useState(params.tab === "forum" ? "forum" : "announcements");
  const [filter, setFilter] = useState<DiscussionFilter>("all");
  const [announcementFilter, setAnnouncementFilter] = useState<AnnouncementFilter>("all");
  const [menuOpen, setMenuOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  useEffect(() => { if (params.tab === "forum" || params.tab === "announcements") setActiveTab(params.tab); }, [params.tab]);
  const posts = mergeDiscussions(data.discussions);
  const visible = filterDiscussions(posts, filter, data.saved, data.fullName, data.discussions.map(post => post.id));
  const isForum = activeTab === "forum";
  const activeFilter = isForum ? filter : announcementFilter;
  const menuItems = (isForum ? discussionFilters : announcementFilters).filter((item) => item.value !== "all");
  const pill = isForum ? discussionFilterPills[filter] : announcementFilters.find((item) => item.value === announcementFilter)!;
  const filterIcons = { all: SlidersHorizontal, my_posts: UserCheck, saved: Bookmark, trending: Flame, transport: Bus, neighbourhood: House, roads: Construction, maintenance: Zap, wellness: HeartPulse };
  const visibleAnnouncements = filterAnnouncements(announcements, announcementFilter);
  return <Page header={(scroll, compact) => <View style={{ paddingHorizontal: 22, backgroundColor: colors.background }}>
    <Animated.View style={[ui.between, { minHeight: 44, paddingVertical: scroll.interpolate({ inputRange: [0, 35], outputRange: [12, 2], extrapolate: "clamp" }) }]}>
      <Animated.View style={{ width: scroll.interpolate({ inputRange: [0, 35], outputRange: [0, 40], extrapolate: "clamp" }), marginRight: scroll.interpolate({ inputRange: [0, 35], outputRange: [-12, 0], extrapolate: "clamp" }) }} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Animated.Text accessibilityRole="header" numberOfLines={1} style={{ fontFamily: fonts.bold, fontWeight: "700", color: colors.ink, textAlign: compact ? "center" : "left", fontSize: scroll.interpolate({ inputRange: [0, 35], outputRange: [24, 17], extrapolate: "clamp" }) }}>Community</Animated.Text>
        <Animated.View style={{ height: scroll.interpolate({ inputRange: [0, 35], outputRange: [42, 0], extrapolate: "clamp" }), opacity: scroll.interpolate({ inputRange: [0, 25], outputRange: [1, 0], extrapolate: "clamp" }), overflow: "hidden" }} accessibilityElementsHidden={compact} aria-hidden={compact}><Typography style={[ui.muted, { fontSize: 13, paddingTop: 3 }]}>Township updates and neighbour conversations.</Typography></Animated.View>
      </View>
      {activeFilter !== "all" ? <CommunityFilterButton active label={pill.short} icon={filterIcons[activeFilter]} onPress={() => isForum ? setFilter("all") : setAnnouncementFilter("all")} /> : <MenuSheet showCloseButton={false} open={menuOpen} onOpenChange={setMenuOpen} label="Filter community" trigger={<CommunityFilterButton active={false} label="" icon={SlidersHorizontal} onPress={() => setMenuOpen(true)} />}>
        {menuItems.map((item) => <PressableFeedback key={item.value} accessibilityRole="radio" accessibilityState={{ checked: activeFilter === item.value }} onPress={() => { if (isForum) setFilter(item.value as DiscussionFilter); else setAnnouncementFilter(item.value as AnnouncementFilter); setMenuOpen(false); }} style={{ minHeight: 46, justifyContent: "center", paddingHorizontal: 8 }}><Typography style={ui.body}>{item.label}</Typography></PressableFeedback>)}
      </MenuSheet>}

    </Animated.View>
    <LineTabs value={activeTab} onChange={setActiveTab} items={[{ value: "announcements", label: `Announcements (${announcements.length})` }, { value: "forum", label: `Resident Forum (${posts.length})` }]} />
  </View>} floating={activeTab === "forum" ? <PressableFeedback accessibilityLabel="Create community post" onPress={() => setCreateOpen(true)} style={[ui.shadow, { position: "absolute", right: 22, bottom: 18, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.red, alignItems: "center", justifyContent: "center" }]}><Plus size={26} color={colors.white} /></PressableFeedback> : undefined}>
    {activeTab === "announcements" ? <Surface style={[ui.card, { padding: 0, gap: 0, overflow: "hidden" }]}>{visibleAnnouncements.map((post) => <AnnouncementCard key={post.id} post={post} />)}</Surface> : <View style={{ gap: 14 }}>
      {visible.map((post) => <DiscussionCard key={post.id} post={post} />)}
      {!visible.length && <Surface style={[ui.card, { gap: 12 }]}><Typography style={ui.heading}>No discussions here yet</Typography><Typography style={ui.muted}>{filter === "my_posts" ? "You haven’t posted any discussions yet. Tap + to share an update or question with neighbours." : filter === "saved" ? "Bookmark a forum post to find it here." : "Try another filter or start a discussion."}</Typography><Button variant="secondary" onPress={() => setFilter("all")} style={{ minHeight: 44 }}><Button.Label>Show all discussions</Button.Label></Button></Surface>}
    </View>}
    <DemoNote text="Demo community content · verification badges and reply counts are illustrative" />
    <CreatePostModal isOpen={createOpen} onClose={() => setCreateOpen(false)} onPublished={() => { setActiveTab("forum"); setFilter("all"); }} />
  </Page>;
}
