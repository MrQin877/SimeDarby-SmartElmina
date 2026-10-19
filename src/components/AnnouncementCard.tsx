import { Share, View } from "react-native";
import { router } from "expo-router";
import {
  BadgeCheck,
  Heart,
  MessageCircle,
  Share2,
  Construction,
  TreePine,
  Lamp,
  ArrowUpRight,
} from "lucide-react-native";
import { type Announcement } from "../lib/data";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Description,
  HeroCard,
  PressableFeedback,
  Separator,
  Surface,
  Typography,
} from "./Common";
import { colors, fonts, radius, ui } from "../lib/theme";
import { useStore } from "../state/store";
import { toggleItem } from "../lib/model";
export default function AnnouncementCard({
  post,
  expanded = false,
}: {
  post: Announcement;
  expanded?: boolean;
}) {
  const { data, update } = useStore();
  const liked = data.liked.includes(post.id);
  const Icon =
    post.icon === "road"
      ? Construction
      : post.icon === "tree"
        ? TreePine
        : Lamp;
  return (
    <Card style={{ padding: 18 }}>
      <HeroCard.Header style={ui.row}>
        <Avatar
          size="sm"
          style={{
            width: 38,
            height: 38,
            borderRadius: radius.md,
            backgroundColor: colors.redSoft,
          }}
        >
          <Avatar.Fallback>
            <TreePine size={20} color={colors.red} />
          </Avatar.Fallback>
        </Avatar>
        <View>
          <View style={[ui.row, { gap: 5 }]}>
            <Typography
              style={{
                fontFamily: fonts.bold,
                fontSize: 13,
                fontWeight: "700",
                color: colors.ink,
              }}
            >
              Township Management
            </Typography>
            <BadgeCheck size={14} color={colors.red} />
          </View>
          <Description style={ui.muted}>{post.time}</Description>
        </View>
      </HeroCard.Header>
      <HeroCard.Body>
        <PressableFeedback
          onPress={() =>
            !expanded &&
            router.push({ pathname: "/announcement", params: { id: post.id } })
          }
          accessibilityLabel={`Read ${post.title}`}
        >
          <Surface
            style={{
              backgroundColor:
                post.icon === "road"
                  ? colors.redSoft
                  : post.icon === "tree"
                    ? colors.greenSoft
                    : colors.surfaceSecondary,
              height: 134,
              borderRadius: radius.card,
              padding: 18,
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <Badge
              tone={
                post.icon === "road"
                  ? "red"
                  : post.icon === "tree"
                    ? "green"
                    : "neutral"
              }
            >
              {post.category.toUpperCase()}
            </Badge>
            <View style={ui.between}>
              <Typography
                style={{
                  fontFamily: fonts.bold,
                  fontSize: 10,
                  fontWeight: "700",
                  color: colors.muted,
                  letterSpacing: 1.1,
                }}
              >
                CITY OF ELMINA
              </Typography>
              <Icon
                color={
                  post.icon === "road"
                    ? colors.red
                    : post.icon === "tree"
                      ? colors.green
                      : colors.ink
                }
                size={48}
                strokeWidth={1.3}
              />
            </View>
          </Surface>
          <HeroCard.Title style={[ui.heading, { marginBottom: 6 }]}>
            {post.title}
          </HeroCard.Title>
          <HeroCard.Description
            numberOfLines={expanded ? undefined : 3}
            style={[ui.body, { color: colors.muted, fontSize: 13 }]}
          >
            {post.body}
          </HeroCard.Description>
        </PressableFeedback>
        {post.placeId && (
          <Button
            variant="ghost"
            size="sm"
            onPress={() =>
              router.push({
                pathname: "/explore",
                params: { place: post.placeId },
              })
            }
            style={[
              ui.row,
              {
                minHeight: 36,
                gap: 5,
                alignSelf: "flex-start",
                paddingHorizontal: 0,
              },
            ]}
          >
            <Button.Label
              style={{ color: colors.red, fontSize: 12, fontWeight: "600" }}
            >
              View on map
            </Button.Label>
            <ArrowUpRight size={14} color={colors.red} />
          </Button>
        )}
      </HeroCard.Body>
      <Separator />
      <HeroCard.Footer style={[ui.between, { paddingTop: 4 }]}>
        <Button
          variant="ghost"
          size="sm"
          accessibilityLabel={
            liked ? "Remove reaction" : "React to announcement"
          }
          accessibilityState={{ selected: liked }}
          onPress={() =>
            update((d) => ({ ...d, liked: toggleItem(d.liked, post.id) }))
          }
          style={[ui.row, { minHeight: 44, gap: 6, paddingHorizontal: 4 }]}
        >
          <Heart
            size={19}
            color={liked ? colors.red : colors.muted}
            fill={liked ? colors.red : "transparent"}
          />
          <Button.Label style={ui.muted}>
            {post.reactions + (liked ? 1 : 0)}
          </Button.Label>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onPress={() =>
            router.push({ pathname: "/announcement", params: { id: post.id } })
          }
          accessibilityLabel="Read comments"
          style={[ui.row, { minHeight: 44, gap: 6, paddingHorizontal: 4 }]}
        >
          <MessageCircle size={19} color={colors.muted} />
          <Button.Label style={ui.muted}>
            {data.comments.filter((c) => c.postId === post.id).length}
          </Button.Label>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onPress={() => {
            void Share.share({
              message: `${post.title}\n\n${post.body}\n\nTownshipConnect — sample announcement`,
            }).catch(() => {});
          }}
          style={[ui.row, { minHeight: 44, gap: 6, paddingHorizontal: 4 }]}
        >
          <Share2 size={18} color={colors.muted} />
          <Button.Label style={ui.muted}>Share</Button.Label>
        </Button>
      </HeroCard.Footer>
    </Card>
  );
}
