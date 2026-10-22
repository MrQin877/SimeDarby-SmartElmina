import { useState } from "react";
import { View, Share } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  ChevronRight,
  MapPin,
  Share2,
} from "lucide-react-native";
import { announcements } from "../lib/data";
import {
  Badge,
  Button,
  Card,
  Description,
  IconButton,
  Label,
  Page,
  PressableFeedback,
  Surface,
  TextArea,
  TextField,
  Typography,
} from "../components/Common";
import Action from "../components/Action";
import { useStore } from "../state/store";
import { colors, fonts, radius, ui } from "../lib/theme";

export default function AnnouncementScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const post = announcements.find((p) => p.id === id);
  const { data, update } = useStore();
  const [text, setText] = useState("");

  if (!post) return <Page title="Announcement unavailable" back backTo="/community" />;

  const isAcknowledged = data.acknowledgedNotices.includes(post.id);
  const comments = data.comments.filter((c) => c.postId === id);

  const handleAcknowledge = () => {
    update((d) => ({
      ...d,
      acknowledgedNotices: d.acknowledgedNotices.includes(post.id)
        ? d.acknowledgedNotices
        : [...d.acknowledgedNotices, post.id],
    }));
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `*${post.title}*\n\n${post.body}\n\nOfficial notice from Sime Darby Property Township Management.`,
      });
    } catch {
      // ignore
    }
  };

  return (
    <Page
      title="Township Advisory"
      subtitle={post.source || "Official Sime Darby Property Circular"}
      back
      backTo="/community"
      right={
        <IconButton
          icon={Share2}
          label="Share notice"
          onPress={handleShare}
        />
      }
    >
      {/* Primary Card */}
      <Card style={{ padding: 18, gap: 14 }}>
        <View style={ui.between}>
          <Badge tone={post.priority === "high" ? "red" : "neutral"}>
            {post.category.toUpperCase()} NOTICE
          </Badge>
          <Typography style={{ fontSize: 11, color: colors.muted }}>
            {post.time}
          </Typography>
        </View>

        <Typography.Heading type="h1" style={[ui.heading, { fontSize: 20, lineHeight: 28 }]}>
          {post.title}
        </Typography.Heading>

        <Typography style={[ui.body, { fontSize: 14, color: colors.ink, lineHeight: 22 }]}>
          {post.content || post.body}
        </Typography>

        {/* Impact Area Box */}
        {post.impactArea ? (
          <Surface
            variant="secondary"
            style={{
              padding: 12,
              borderRadius: radius.card,
              backgroundColor: colors.surfaceSecondary,
              gap: 4,
            }}
          >
            <View style={[ui.row, { gap: 6 }]}>
              <MapPin size={15} color={colors.red} />
              <Typography style={{ fontSize: 12, fontFamily: fonts.bold, fontWeight: "700", color: colors.ink }}>
                Impact Area
              </Typography>
            </View>
            <Typography style={{ fontSize: 12, color: colors.ink, lineHeight: 18 }}>
              {post.impactArea}
            </Typography>
            <PressableFeedback
              onPress={() => router.push("/(tabs)/explore?sheet=traffic_details")}
              style={[ui.row, { gap: 4, marginTop: 4 }]}
            >
              <Typography style={{ fontSize: 12, fontFamily: fonts.bold, fontWeight: "700", color: colors.red }}>
                View Detour on Map
              </Typography>
              <ChevronRight size={14} color={colors.red} />
            </PressableFeedback>
          </Surface>
        ) : null}

        {/* Resident Action Steps Checklist */}
        {post.residentSteps && post.residentSteps.length > 0 ? (
          <View style={{ gap: 8, paddingTop: 4 }}>
            <Typography style={{ fontSize: 12, fontFamily: fonts.bold, fontWeight: "700", color: colors.ink }}>
              Action Steps for Residents
            </Typography>
            {post.residentSteps.map((step, idx) => (
              <View key={idx} style={[ui.row, { alignItems: "flex-start", gap: 8 }]}>
                <Surface
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: colors.redSoft,
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: 1,
                  }}
                >
                  <Typography style={{ fontSize: 11, fontFamily: fonts.bold, fontWeight: "700", color: colors.red }}>
                    {idx + 1}
                  </Typography>
                </Surface>
                <Typography style={{ flex: 1, fontSize: 13, color: colors.ink, lineHeight: 19 }}>
                  {step}
                </Typography>
              </View>
            ))}
          </View>
        ) : null}

        {/* Acknowledge Button */}
        <Button
          variant={isAcknowledged ? "secondary" : "primary"}
          onPress={handleAcknowledge}
          style={{
            height: 46,
            borderRadius: radius.md,
            backgroundColor: isAcknowledged ? colors.greenSoft : colors.red,
            borderWidth: isAcknowledged ? 1 : 0,
            borderColor: colors.green,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography
            style={{
              fontFamily: fonts.bold,
              fontSize: 14,
              fontWeight: "700",
              color: isAcknowledged ? colors.green : colors.white,
            }}
          >
            {isAcknowledged ? "Notice Acknowledged" : "Tap to Acknowledge"}
          </Typography>
        </Button>
      </Card>

      {/* Conversation Thread */}
      <View style={{ gap: 10, marginTop: 10 }}>
        <Typography.Heading type="h3" style={ui.heading}>
          Resident Discussion ({comments.length})
        </Typography.Heading>

        {comments.map((c) => (
          <Card key={c.id} style={{ padding: 14, gap: 6 }}>
            <View style={ui.between}>
              <Typography style={{ fontWeight: "700", fontSize: 13, color: colors.ink }}>
                {data.name} · Resident
              </Typography>
              <Description style={ui.muted}>
                {new Date(c.createdAt).toLocaleDateString()}
              </Description>
            </View>
            <Typography style={ui.body}>{c.text}</Typography>
          </Card>
        ))}

        {!comments.length && (
          <Description style={ui.muted}>
            Be the first neighbour to leave a note.
          </Description>
        )}

        <View style={{ gap: 10 }}>
          <TextField>
            <Label>Your response</Label>
            <TextArea
              accessibilityLabel="Your response"
              style={[ui.input, { minHeight: 85, textAlignVertical: "top" }]}
              value={text}
              onChangeText={setText}
              placeholder="Add a helpful note or question for the township management…"
              maxLength={500}
            />
          </TextField>

          <Action
            label="Post Response"
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
        </View>
      </View>
    </Page>
  );
}
