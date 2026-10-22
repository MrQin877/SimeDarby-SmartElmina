import { useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { BadgeCheck, Send } from "lucide-react-native";
import { Avatar, DemoNote, Input, Page, PressableFeedback, Surface, Typography } from "../components/Common";
import DiscussionCard from "../components/DiscussionCard";
import { createDiscussionReply, discussionReplies, mergeDiscussions } from "../lib/community";
import { useAppToast } from "../hooks/useAppToast";
import { useStore } from "../state/store";
import { colors, fonts, ui } from "../lib/theme";

export default function Discussion() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { data, update } = useStore();
  const [text, setText] = useState("");
  const notify = useAppToast();
  const scrollRef = useRef<ScrollView>(null);
  const scrollAfterPost = useRef(false);
  const post = mergeDiscussions(data.discussions).find((item) => item.id === id);
  if (!post) return <Page title="Discussion unavailable" back backTo={{ pathname: "/community", params: { tab: "forum" } }}><Typography style={ui.body}>This discussion could not be found. Return to Community to choose another.</Typography></Page>;
  const replies = discussionReplies(post.id, data.comments);
  const submit = () => {
    const reply = createDiscussionReply(post.id, text, data);
    if (!reply) return;
    scrollAfterPost.current = true;
    update((d) => ({ ...d, comments: [...d.comments, reply] }));
    setText(""); notify("Reply posted on this device.", "success");
  };
  return <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
    <Page title="Discussion" back backTo={{ pathname: "/community", params: { tab: "forum" } }} bottomInset={160} scrollRef={scrollRef} onContentSizeChange={() => { if (scrollAfterPost.current) { scrollRef.current?.scrollToEnd({ animated: true }); scrollAfterPost.current = false; } }} floating={<View style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 12, gap: 4, backgroundColor: colors.white, borderTopWidth: 1, borderColor: colors.border }}>
      <View style={[ui.row, { gap: 8, alignItems: "flex-end" }]}>
        <Input accessibilityLabel="Write a reply" value={text} onChangeText={(value) => { setText(value); }} placeholder="Reply to your neighbours…" multiline maxLength={1000} style={[ui.input, { flex: 1, maxHeight: 96, minHeight: 44, paddingVertical: 10 }]} />
        <PressableFeedback accessibilityLabel="Post reply" isDisabled={!text.trim()} onPress={submit} style={[ui.iconButton, { alignItems: "center", justifyContent: "center", backgroundColor: colors.red, opacity: text.trim() ? 1 : 0.4 }]}><Send size={18} color={colors.white} /></PressableFeedback>
      </View>
    </View>}>
      <DiscussionCard post={post} expanded />
      <Typography style={ui.heading}>Resident discussion</Typography>
      <Surface style={{ padding: 16, gap: 18, borderWidth: 1, borderColor: colors.border }}>
        {replies.map((reply) => <View key={reply.id} style={{ gap: 10, borderBottomWidth: 1, borderColor: colors.border, paddingBottom: 16 }}>
          <View style={[ui.row, { gap: 8, alignItems: "flex-start" }]}>
            <Avatar style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: colors.redSoft }}><Avatar.Fallback textProps={{ style: { color: colors.red, fontSize: 11, fontFamily: fonts.bold } }}>{(reply.authorName || "Neighbour").split(" ").filter(Boolean).slice(0, 2).map((word) => word[0]).join("")}</Avatar.Fallback></Avatar>
            <View style={{ flex: 1, gap: 3 }}><View style={[ui.row, { gap: 4, flexWrap: "wrap" }]}><Typography style={[ui.body, { fontFamily: fonts.bold, fontSize: 13 }]}>{reply.authorName || "Neighbour"}</Typography>{reply.isVerified && <BadgeCheck size={14} color={colors.green} />}</View><Typography style={[ui.muted, { fontSize: 10 }]}>{reply.authorNeighborhood || "City of Elmina"} · {new Date(reply.createdAt).toLocaleString("en-MY", { timeZone: "Asia/Kuala_Lumpur", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</Typography></View>
          </View>
          <Typography style={ui.body}>{reply.text}</Typography>
        </View>)}
        {!replies.length && <Typography style={ui.muted}>Be the first neighbour to reply.</Typography>}
      </Surface>
      <DemoNote text="Sample neighbour replies and verification badges · new replies are saved locally" />
    </Page>
  </KeyboardAvoidingView>;
}
