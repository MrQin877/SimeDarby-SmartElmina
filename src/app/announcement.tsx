import { useState } from "react";
import { View, Share, Image } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  Clock,
  MapPin,
  Share2,
} from "lucide-react-native";
import { announcements } from "../lib/data";
import { getAnnouncementImageSource } from "../lib/announcement-images";
import {
  Badge,
  Button,
  Card,
  Description,
  IconButton,
  Label,
  Page,
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

        {(() => {
          const imageSource = getAnnouncementImageSource(post.imageUrl, post.id);
          return imageSource ? (
            <Image
              source={imageSource}
              accessibilityLabel={post.title}
              style={{ width: "100%", height: 210, borderRadius: radius.card, marginVertical: 4 }}
              resizeMode="cover"
            />
          ) : null;
        })()}

        <Typography style={[ui.body, { fontSize: 14, color: colors.ink, lineHeight: 22 }]}>
          {post.content || post.body}
        </Typography>

        {/* Impact Area Box */}
        {post.impactArea ? (
          <Surface
            variant="secondary"
            style={{
              padding: 14,
              borderRadius: radius.card,
              backgroundColor: colors.surfaceSecondary,
              gap: 8,
            }}
          >
            <View style={[ui.row, { gap: 6 }]}>
              <MapPin size={15} color={colors.red} />
              <Typography style={{ fontSize: 12, fontFamily: fonts.bold, fontWeight: "700", color: colors.ink }}>
                Impact Area & Closure Period
              </Typography>
            </View>
            <Typography style={{ fontSize: 13, color: colors.ink, lineHeight: 19 }}>
              {post.impactArea}
            </Typography>
            {post.dateStr && (
              <View style={[ui.row, { gap: 6, alignItems: "center" }]}>
                <Clock size={13} color={colors.muted} />
                <Typography style={{ fontSize: 12, color: colors.muted, lineHeight: 17 }}>
                  {post.dateStr}
                </Typography>
              </View>
            )}
            <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
              <Button
                size="sm"
                variant="primary"
                onPress={() => router.push(post.actionLink ? (post.actionLink as any) : "/(tabs)/explore?sheet=plan_journey&origin=elmina-valley&destination=elmina-city-centre")}
                style={{ flex: 1, height: 38, minHeight: 38, backgroundColor: colors.red, borderRadius: radius.md, justifyContent: "center", alignItems: "center", paddingHorizontal: 6 }}
              >
                <Button.Label numberOfLines={1} style={{ color: colors.white, fontSize: 12, fontFamily: fonts.semibold, fontWeight: "600" }}>
                  {post.actionText === "Open Journey Planner" ? "Journey Planner" : (post.actionText || "Journey Planner")}
                </Button.Label>
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onPress={() => router.push("/(tabs)/explore?place=closure-persiaran-elmina&sheet=traffic_details&corridor=persiaran-elmina")}
                style={{ flex: 1, height: 38, minHeight: 38, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, justifyContent: "center", alignItems: "center", paddingHorizontal: 6 }}
              >
                <Button.Label numberOfLines={1} style={{ color: colors.ink, fontSize: 12, fontFamily: fonts.medium, fontWeight: "500" }}>
                  View Detour
                </Button.Label>
              </Button>
            </View>
          </Surface>
        ) : null}

        {/* Resident Advisory Details Checklist */}
        {post.residentSteps && post.residentSteps.length > 0 ? (
          <View style={{ gap: 8, paddingTop: 4 }}>
            <Typography style={{ fontSize: 13, fontFamily: fonts.bold, fontWeight: "700", color: colors.ink }}>
              Important Notice Details
            </Typography>
            {post.residentSteps.map((step, idx) => (
              <View key={idx} style={[ui.row, { alignItems: "flex-start", gap: 10 }]}>
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: colors.red,
                    marginTop: 6,
                  }}
                />
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
