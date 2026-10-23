import { useState, type ReactNode } from "react";
import { Alert, Image, Platform, Share, View } from "react-native";
import { router } from "expo-router";
import { BadgeCheck, Bookmark, BookmarkCheck, Calendar, Heart, MapPin, MessageCircle, MoreHorizontal, Trash2, Share2 } from "lucide-react-native";
import { Avatar, Badge, Card, IconButton, PressableFeedback, Typography } from "./Common";
import { useStore } from "../state/store";
import MenuSheet from "./MenuSheet";
import { useAppToast } from "../hooks/useAppToast";
import { isOwnDiscussion } from "../lib/community";
import { deleteDiscussionPost, toggleItem, type DiscussionPost } from "../lib/model";
import { colors, fonts, ui } from "../lib/theme";

export default function DiscussionCard({ post, expanded = false }: { post: DiscussionPost; expanded?: boolean }) {
  const { data, update } = useStore();
  const [optionsOpen, setOptionsOpen] = useState(false);
  const notify = useAppToast();
  const isMyPost = isOwnDiscussion(post, data.fullName, data.discussions.map(item => item.id));
  const storePost = () => {
    update(d => ({ ...d, saved: toggleItem(d.saved, post.id) }));
    setOptionsOpen(false);
    notify(saved ? "Post removed from Saved" : "Post stored in Saved Discussions", "success");
  };
  const confirmDelete = () => {
    setOptionsOpen(false);
    const remove = () => {
      update(d => deleteDiscussionPost(d, post.id));
      notify("Discussion deleted", "info");
      if (expanded) {
        if (router.canGoBack()) router.back();
        else router.replace({ pathname: "/community", params: { tab: "forum" } });
      }
    };
    const message = "This will permanently remove this discussion and its replies.";
    if (Platform.OS === "web") {
      if (window.confirm(`Delete Discussion?\n\n${message}`)) remove();
    } else Alert.alert("Delete Discussion?", message, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: remove },
    ]);
  };
  const liked = data.liked.includes(post.id);
  const saved = data.saved.includes(post.id);
  const open = () => { if (!expanded) router.push({ pathname: "/discussion", params: { id: post.id } }); };
  const replyCount = post.commentsCount + data.comments.filter((reply) => reply.postId === post.id).length;
  return <Card style={{ padding: 16, gap: 12 }}>
      <View style={[ui.row, { alignItems: "flex-start", gap: 10 }]}>
        <View>
          <Avatar style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.redSoft }}><Avatar.Fallback textProps={{ style: { color: colors.red, fontFamily: fonts.bold, fontSize: 12 } }}>{post.authorInitials}</Avatar.Fallback></Avatar>
          <View style={{ position: "absolute", right: -3, bottom: -2, backgroundColor: colors.white, borderRadius: 9 }}><BadgeCheck size={16} fill={colors.green} color={colors.white} /></View>
        </View>
        <View style={{ flex: 1, gap: 3 }}>
          <Typography style={{ fontFamily: fonts.bold, fontSize: 13, color: colors.ink }}>{post.authorName}</Typography>
          <Typography style={[ui.muted, { fontSize: 10 }]}>{post.authorNeighborhood} · {post.timestamp}</Typography>
        </View>
        {isMyPost && <View style={[ui.row, { gap: 4 }]}>
          <Badge tone="green">You</Badge>
          <IconButton icon={MoreHorizontal} label="Post options" onPress={() => setOptionsOpen(true)} style={{ width: 32, height: 32, borderWidth: 0 }} />
        </View>}
      </View>
    <PostContent expanded={expanded} label={`Open discussion: ${post.title}`} onPress={open}>
      <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}>
        {post.trending && <Badge tone="amber">🔥 Trending</Badge>}
        <Badge>{post.categoryLabel}</Badge>
      </View>
      <Typography style={[ui.heading, { fontSize: expanded ? 21 : 16, lineHeight: expanded ? 29 : 22 }]}>{post.title}</Typography>
      <Typography numberOfLines={expanded ? undefined : 3} style={[ui.body, { fontSize: 13 }]}>{post.content}</Typography>
      {post.imageUrl && <Image source={{ uri: post.imageUrl }} accessibilityLabel="Resident post attachment" style={{ width: "100%", height: expanded ? 220 : 160, borderRadius: 14 }} />}
      {post.highlightNote && <View style={{ padding: 10, borderRadius: 12, backgroundColor: colors.amberSoft }}><Typography style={[ui.muted, { color: colors.ink }]}>{post.highlightNote}</Typography></View>}
      {post.locationTag && <View style={{ flexDirection: "row", alignItems: "center", gap: 5, padding: 9, borderRadius: 12, backgroundColor: colors.greenSoft }}><MapPin size={14} color={colors.green} /><Typography style={[ui.muted, { flex: 1, color: colors.green }]}>{post.locationTag}</Typography></View>}
      {post.eventDate && <View style={[ui.row, { gap: 5 }]}><Calendar size={14} color={colors.red} /><Typography style={[ui.muted, { color: colors.red, flex: 1 }]}>{post.eventDate}</Typography></View>}
    </PostContent>
    <View style={[ui.between, { borderTopWidth: 1, borderColor: colors.border, paddingTop: 8, gap: 4 }]}>
      <PressableFeedback accessibilityLabel={liked ? "Unlike discussion" : "Like discussion"} accessibilityState={{ selected: liked }} onPress={() => update((d) => ({ ...d, liked: toggleItem(d.liked, post.id) }))} style={{ minHeight: 40, flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 4 }}>
        <Heart size={18} color={liked ? colors.red : colors.muted} fill={liked ? colors.red : "transparent"} /><Typography style={ui.muted}>{post.likes + (liked ? 1 : 0)}</Typography>
      </PressableFeedback>
      <PressableFeedback accessibilityLabel={`${replyCount} replies. Open discussion`} onPress={open} isDisabled={expanded} style={{ minHeight: 40, flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 4 }}><MessageCircle size={18} color={colors.muted} /><Typography style={ui.muted}>{replyCount}</Typography></PressableFeedback>
      <IconButton icon={Share2} label="Share discussion" onPress={() => { void Share.share({ message: `${post.title}\n\n${post.content}\n\nSmart Elmina · demo discussion` }).catch(() => {}); }} style={{ borderWidth: 0 }} />
      {!isMyPost && <IconButton icon={saved ? BookmarkCheck : Bookmark} label={saved ? "Unsave discussion" : "Save discussion"} color={saved ? colors.red : colors.muted} onPress={storePost} style={{ borderWidth: 0 }} />}
    </View>
    {isMyPost && <MenuSheet open={optionsOpen} onOpenChange={setOptionsOpen} label="Post options" showCloseButton={false}>
      <PressableFeedback accessibilityRole="button" accessibilityLabel={saved ? "Remove post from Saved" : "Store / Save Post"} onPress={storePost} style={[ui.row, { minHeight: 52, paddingHorizontal: 8 }]}>
        {saved ? <BookmarkCheck size={19} color={colors.ink} /> : <Bookmark size={19} color={colors.ink} />}<Typography style={ui.body}>{saved ? "Remove from Saved" : "Store / Save Post"}</Typography>
      </PressableFeedback>
      <PressableFeedback accessibilityRole="button" accessibilityLabel="Delete Post" onPress={confirmDelete} style={[ui.row, { minHeight: 52, paddingHorizontal: 8 }]}>
        <Trash2 size={19} color={colors.red} /><Typography style={[ui.body, { color: colors.red }]}>Delete Post</Typography>
      </PressableFeedback>
    </MenuSheet>}
  </Card>;
}

function PostContent({ expanded, label, onPress, children }: { expanded: boolean; label: string; onPress: () => void; children: ReactNode }) {
  return expanded ? <View style={{ gap: 12 }}>{children}</View> : <PressableFeedback accessibilityLabel={label} onPress={onPress} style={{ gap: 12 }}>{children}</PressableFeedback>;
}
