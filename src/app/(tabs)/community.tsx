import { useState, useEffect } from "react";
import { ScrollView, Share, StyleSheet, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import {
  Heart,
  MessageCircle,
  MessageSquarePlus,
  Share2,
  MapPin,
  Calendar,
} from "lucide-react-native";
import { announcements, initialDiscussions } from "../../lib/data";
import {
  Avatar,
  Badge,
  Card,
  DemoNote,
  Description,
  FilterChip,
  IconButton,
  Page,
  PressableFeedback,
  Surface,
  Typography,
} from "../../components/Common";
import AnnouncementCard from "../../components/AnnouncementCard";
import { CreatePostModal } from "../../components/CreatePostModal";
import { colors, fonts, radius, ui } from "../../lib/theme";
import { useStore } from "../../state/store";
import type { DiscussionPost } from "../../lib/model";

export default function Community() {
  const params = useLocalSearchParams<{ tab?: string }>();
  const { data, update } = useStore();
  const [activeTab, setActiveTab] = useState<"announcements" | "forum">(
    params.tab === "forum" ? "forum" : "announcements"
  );
  const [announcementFilter, setAnnouncementFilter] = useState("All");
  const [forumCategory, setForumCategory] = useState("All");
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);

  useEffect(() => {
    if (params.tab === "forum") {
      setActiveTab("forum");
    }
  }, [params.tab]);

  // Combine store discussions with initial discussions
  const allDiscussions: DiscussionPost[] = [
    ...data.discussions,
    ...initialDiscussions.filter(
      (init) => !data.discussions.some((d) => d.id === init.id)
    ),
  ];

  const handleToggleLike = (postId: string) => {
    update((d) => {
      const isCurrentlyLiked = d.liked.includes(postId);
      const newLiked = isCurrentlyLiked
        ? d.liked.filter((id) => id !== postId)
        : [...d.liked, postId];

      // Update in custom discussions if present
      const updatedDiscussions = d.discussions.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            isLiked: !isCurrentlyLiked,
            likes: isCurrentlyLiked ? post.likes - 1 : post.likes + 1,
          };
        }
        return post;
      });

      return {
        ...d,
        liked: newLiked,
        discussions: updatedDiscussions,
      };
    });
  };

  const handleSharePost = async (post: DiscussionPost) => {
    try {
      await Share.share({
        message: `*${post.title}*\n${post.content}\n\n— Posted by ${post.authorName} (${post.authorNeighborhood}) on Smart Elmina Community Forum`,
      });
    } catch {
      // ignore
    }
  };

  const filteredDiscussions = allDiscussions.filter((post) => {
    if (forumCategory === "All") return true;
    if (forumCategory === "Neighbourhood") return post.category === "neighbourhood";
    if (forumCategory === "Transportation") return post.category === "transport";
    if (forumCategory === "Events") return post.category === "events";
    if (forumCategory === "General") return post.category === "general";
    return true;
  });

  return (
    <Page
      title="Community"
      subtitle="The latest verified notices & resident discussions."
      right={
        <IconButton
          icon={MessageSquarePlus}
          color={colors.red}
          label="New topic"
          onPress={() => setIsCreatePostOpen(true)}
        />
      }
    >
      {/* Segmented Control Switcher (Announcements vs Forum) */}
      <View style={s.segmentContainer}>
        <PressableFeedback
          onPress={() => setActiveTab("announcements")}
          style={[
            s.segmentTab,
            activeTab === "announcements" ? s.segmentTabActive : null,
          ]}
        >
          <Typography
            style={[
              s.segmentLabel,
              activeTab === "announcements" ? s.segmentLabelActive : null,
            ]}
          >
            Announcements ({announcements.length})
          </Typography>
        </PressableFeedback>

        <PressableFeedback
          onPress={() => setActiveTab("forum")}
          style={[
            s.segmentTab,
            activeTab === "forum" ? s.segmentTabActive : null,
          ]}
        >
          <Typography
            style={[
              s.segmentLabel,
              activeTab === "forum" ? s.segmentLabelActive : null,
            ]}
          >
            Resident Forum ({allDiscussions.length})
          </Typography>
        </PressableFeedback>
      </View>

      {/* ================================================================= */}
      {/* 1. ANNOUNCEMENTS TAB CONTENT                                      */}
      {/* ================================================================= */}
      {activeTab === "announcements" && (
        <View style={{ gap: 14 }}>
          {/* Category Filter Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {["All", "Roads", "Maintenance", "Community"].map((item) => (
              <FilterChip
                key={item}
                label={item}
                selected={item === announcementFilter}
                activeColor={colors.red}
                onPress={() => setAnnouncementFilter(item)}
              />
            ))}
          </ScrollView>

          {/* Announcements Feed */}
          <View style={{ gap: 14 }}>
            {announcements
              .filter(
                (p) =>
                  announcementFilter === "All" ||
                  p.category === announcementFilter
              )
              .map((post) => (
                <AnnouncementCard key={post.id} post={post} />
              ))}
          </View>
        </View>
      )}

      {/* ================================================================= */}
      {/* 2. FORUM (DISCUSSIONS) TAB CONTENT                                */}
      {/* ================================================================= */}
      {activeTab === "forum" && (
        <View style={{ gap: 14 }}>
          {/* Category Filter Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {["All", "Neighbourhood", "Transportation", "Events", "General"].map((cat) => (
              <FilterChip
                key={cat}
                label={cat}
                selected={cat === forumCategory}
                activeColor={colors.red}
                onPress={() => setForumCategory(cat)}
              />
            ))}
          </ScrollView>

          {/* Discussions Feed */}
          <View style={{ gap: 14 }}>
            {filteredDiscussions.map((post) => {
              const isLiked =
                data.liked.includes(post.id) || post.isLiked;

              return (
                <Card key={post.id} style={{ padding: 16, gap: 10 }}>
                  {/* Author Header */}
                  <View style={ui.between}>
                    <View style={[ui.row, { gap: 10 }]}>
                      <Avatar size="sm" style={s.authorAvatar}>
                        <Avatar.Fallback
                          textProps={{
                            style: {
                              fontFamily: fonts.bold,
                              color: colors.red,
                              fontSize: 12,
                            },
                          }}
                        >
                          {post.authorInitials}
                        </Avatar.Fallback>
                      </Avatar>
                      <View>
                        <View style={[ui.row, { gap: 5 }]}>
                          <Typography style={{ fontSize: 13, fontFamily: fonts.bold, fontWeight: "700", color: colors.ink }}>
                            {post.authorName}
                          </Typography>
                          <Badge tone="neutral">{post.authorNeighborhood}</Badge>
                        </View>
                        <Description style={ui.muted}>{post.timestamp}</Description>
                      </View>
                    </View>

                    {post.badgeLabel && (
                      <Badge tone={post.trending ? "red" : "amber"}>
                        {post.badgeLabel}
                      </Badge>
                    )}
                  </View>

                  {/* Post Title & Content */}
                  <View style={{ gap: 4 }}>
                    <Typography.Heading
                      type="h3"
                      style={{ fontSize: 15, fontWeight: "700", color: colors.ink, lineHeight: 21 }}
                    >
                      {post.title}
                    </Typography.Heading>
                    <Typography style={[ui.body, { fontSize: 13, color: colors.ink, lineHeight: 19 }]}>
                      {post.content}
                    </Typography>
                  </View>

                  {/* Highlight Quote if present */}
                  {post.highlightNote ? (
                    <Surface
                      variant="secondary"
                      style={{
                        padding: 10,
                        borderRadius: radius.card,
                        backgroundColor: colors.surfaceSecondary,
                        gap: 2,
                      }}
                    >
                      <Typography style={{ fontSize: 12, color: colors.ink, fontStyle: "italic" }}>
                        {post.highlightNote}
                      </Typography>
                    </Surface>
                  ) : null}

                  {/* Event or Location Tag */}
                  {post.eventDate || post.locationTag ? (
                    <View style={[ui.row, { gap: 6 }]}>
                      {post.eventDate ? (
                        <View style={[ui.row, { gap: 4 }]}>
                          <Calendar size={13} color={colors.red} />
                          <Typography style={{ fontSize: 11, fontFamily: fonts.semibold, color: colors.red }}>
                            {post.eventDate}
                          </Typography>
                        </View>
                      ) : null}
                      {post.locationTag ? (
                        <View style={[ui.row, { gap: 4 }]}>
                          <MapPin size={13} color={colors.muted} />
                          <Typography style={{ fontSize: 11, color: colors.muted }}>
                            {post.locationTag}
                          </Typography>
                        </View>
                      ) : null}
                    </View>
                  ) : null}

                  <View style={{ height: 1, backgroundColor: colors.border }} />

                  {/* Footer Actions: Like, Comment count, Share */}
                  <View style={ui.between}>
                    <PressableFeedback
                      onPress={() => handleToggleLike(post.id)}
                      style={[ui.row, { gap: 6, paddingVertical: 4, paddingHorizontal: 6 }]}
                    >
                      <Heart
                        size={17}
                        color={isLiked ? colors.red : colors.muted}
                        fill={isLiked ? colors.red : "transparent"}
                      />
                      <Typography
                        style={{
                          fontSize: 12,
                          fontFamily: fonts.bold,
                          fontWeight: "700",
                          color: isLiked ? colors.red : colors.muted,
                        }}
                      >
                        {post.likes + (isLiked && !post.isLiked ? 1 : 0)}
                      </Typography>
                    </PressableFeedback>

                    <View style={[ui.row, { gap: 4 }]}>
                      <MessageCircle size={16} color={colors.muted} />
                      <Typography style={{ fontSize: 12, color: colors.muted }}>
                        {post.commentsCount} comments
                      </Typography>
                    </View>

                    <IconButton
                      icon={Share2}
                      label="Share post"
                      onPress={() => handleSharePost(post)}
                      style={{ width: 34, height: 34 }}
                    />
                  </View>
                </Card>
              );
            })}
          </View>
        </View>
      )}

      <DemoNote text="Community forum and announcements for City of Elmina residents" />

      {/* Create Discussion Modal */}
      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
      />
    </Page>
  );
}

const s = StyleSheet.create({
  segmentContainer: {
    flexDirection: "row",
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.card,
    padding: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  segmentTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentTabActive: {
    backgroundColor: colors.white,
    shadowColor: "#09090B",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  segmentLabel: {
    fontSize: 13,
    fontFamily: fonts.semibold,
    fontWeight: "600",
    color: colors.muted,
  },
  segmentLabelActive: {
    color: colors.ink,
    fontFamily: fonts.bold,
    fontWeight: "700",
  },
  authorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.redSoft,
  },
});
