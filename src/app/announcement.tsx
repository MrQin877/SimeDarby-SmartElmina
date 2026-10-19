import { useState } from "react";
import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { announcements } from "../lib/data";
import {
  Card,
  DemoNote,
  Description,
  HeroCard,
  Label,
  Page,
  TextArea,
  TextField,
  Typography,
} from "../components/Common";
import AnnouncementCard from "../components/AnnouncementCard";
import Action from "../components/Action";
import { useStore } from "../state/store";
import { ui } from "../lib/theme";
export default function Announcement() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const post = announcements.find((p) => p.id === id);
  const { data, update } = useStore();
  const [text, setText] = useState("");
  if (!post) return <Page title="Announcement unavailable" back />;
  const comments = data.comments.filter((c) => c.postId === id);
  return (
    <Page title="Township update" back>
      <AnnouncementCard post={post} expanded />
      <Typography.Heading type="h3" style={ui.heading}>
        Conversation · {comments.length}
      </Typography.Heading>
      {comments.map((c) => (
        <Card key={c.id}>
          <HeroCard.Header>
            <HeroCard.Title style={{ fontWeight: "700", fontSize: 14 }}>
              {data.name} · Resident
            </HeroCard.Title>
          </HeroCard.Header>
          <HeroCard.Body>
            <Typography style={ui.body}>{c.text}</Typography>
          </HeroCard.Body>
          <HeroCard.Footer>
            <Description style={ui.muted}>
              {new Date(c.createdAt).toLocaleDateString()}
            </Description>
          </HeroCard.Footer>
        </Card>
      ))}
      {!comments.length && (
        <Description style={ui.muted}>
          Be the first neighbour to comment.
        </Description>
      )}
      <View style={{ gap: 12 }}>
        <TextField>
          <Label>Your comment</Label>
          <TextArea
            accessibilityLabel="Your comment"
            style={[ui.input, { minHeight: 95, textAlignVertical: "top" }]}
            value={text}
            onChangeText={setText}
            placeholder="Add a helpful comment…"
            maxLength={500}
          />
        </TextField>
        <Action
          label="Post comment"
          disabled={!text.trim()}
          onPress={() => {
            update((d) => ({
              ...d,
              comments: [
                ...d.comments,
                {
                  id: `comment-${Date.now()}`,
                  postId: post.id,
                  text: text.trim(),
                  createdAt: new Date().toISOString(),
                },
              ],
            }));
            setText("");
          }}
        />
        <DemoNote text="Demo comment · stored on this device, not published to residents" />
      </View>
    </Page>
  );
}
