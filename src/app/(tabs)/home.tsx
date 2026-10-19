import { View, StyleSheet } from "react-native";
import { router } from "expo-router";
import {
  Bell,
  MapPin,
  MessageSquarePlus,
  ClipboardList,
  Bookmark,
  ArrowUpRight,
  Construction,
  TreePine,
} from "lucide-react-native";
import {
  Avatar,
  Badge,
  Card,
  DemoNote,
  Description,
  HeroCard,
  IconButton,
  Page,
  PressableFeedback,
  Section,
  Surface,
  Typography,
} from "../../components/Common";
import { colors, fonts, radius, ui } from "../../lib/theme";
import { useStore } from "../../state/store";
export default function Home() {
  const { data } = useStore();
  const latest = data.reports[0];
  return (
    <Page>
      <View style={ui.between}>
        <PressableFeedback
          accessibilityLabel="Open profile"
          onPress={() => router.push("/profile")}
          style={ui.row}
        >
          <Avatar size="md" variant="soft" style={s.avatar}>
            <Avatar.Fallback
              textProps={{
                style: {
                  fontFamily: fonts.bold,
                  color: colors.red,
                  fontWeight: "700",
                },
              }}
            >
              {data.name.slice(0, 2).toUpperCase()}
            </Avatar.Fallback>
          </Avatar>
          <View>
            <Description style={ui.muted}>Good to see you,</Description>
            <Typography
              style={{
                fontFamily: fonts.bold,
                fontSize: 16,
                color: colors.ink,
                fontWeight: "700",
              }}
            >
              {data.name}
            </Typography>
          </View>
        </PressableFeedback>
        <IconButton
          icon={Bell}
          label="View announcements"
          onPress={() => router.push("/community")}
        />
      </View>
      <View style={{ gap: 6 }}>
        <View style={[ui.row, { gap: 6 }]}>
          <MapPin size={13} color={colors.red} />
          <Typography style={[ui.label, { color: colors.red }]}>
            CITY OF ELMINA
          </Typography>
        </View>
        <Typography.Heading type="h1" style={[ui.title, { fontSize: 32 }]}>
          A better everyday.
        </Typography.Heading>
        <Description style={ui.muted}>
          Your neighbourhood, a little more connected.
        </Description>
      </View>
      <View style={{ flexDirection: "row", gap: 10 }}>
        {(
          [
            {
              title: "Report issue",
              icon: MessageSquarePlus,
              route: "/report",
            },
            { title: "My reports", icon: ClipboardList, route: "/reports" },
            { title: "Saved places", icon: Bookmark, route: "/saved" },
          ] as const
        ).map(({ title, icon: Icon, route }) => (
          <PressableFeedback
            key={title}
            onPress={() => router.push(route)}
            style={{ flex: 1 }}
          >
            <Surface style={s.quickCard}>
              <Surface variant="secondary" style={s.quickIcon}>
                <Icon size={20} color={colors.red} strokeWidth={2} />
              </Surface>
              <Typography
                style={{
                  fontFamily: fonts.semibold,
                  fontSize: 12,
                  fontWeight: "600",
                  color: colors.ink,
                  letterSpacing: -0.2,
                }}
              >
                {title}
              </Typography>
            </Surface>
          </PressableFeedback>
        ))}
      </View>
      <Card>
        <Section
          title="Roads at a glance"
          action="Explore"
          onPress={() => router.push("/explore")}
        />
        <View style={{ flexDirection: "row", gap: 10 }}>
          {[
            {
              n: "12",
              label: "Clear",
              color: colors.green,
              bg: colors.greenSoft,
            },
            {
              n: "2",
              label: "Moderate",
              color: colors.amber,
              bg: colors.amberSoft,
            },
            {
              n: "1",
              label: "Hazard",
              color: colors.red,
              bg: colors.redSoft,
            },
          ].map((item) => (
            <Surface
              key={item.label}
              style={{
                backgroundColor: item.bg,
                padding: 14,
                borderRadius: radius.md,
                flex: 1,
                gap: 2,
              }}
            >
              <Typography
                style={{
                  fontFamily: fonts.bold,
                  fontSize: 26,
                  fontWeight: "700",
                  color: item.color,
                  letterSpacing: -0.5,
                }}
              >
                {item.n}
              </Typography>
              <Typography
                style={{
                  fontFamily: fonts.semibold,
                  color: item.color,
                  fontSize: 11,
                  fontWeight: "600",
                }}
              >
                {item.label}
              </Typography>
            </Surface>
          ))}
        </View>
        <DemoNote />
      </Card>
      <Section
        title="Around your township"
        action="View all"
        onPress={() => router.push("/community")}
      />
      <PressableFeedback
        onPress={() => router.push("/announcement?id=roadworks")}
      >
        <Surface style={s.feature}>
          <View style={{ flex: 1, gap: 10 }}>
            <Badge tone="red">OFFICIAL · SAMPLE</Badge>
            <Typography.Heading
              type="h2"
              style={[ui.heading, { fontSize: 22, color: colors.white }]}
            >
              A smoother road{`\n`}starts here.
            </Typography.Heading>
            <Description
              style={{
                fontFamily: fonts.regular,
                color: "#A1A1AA",
                fontSize: 12,
              }}
            >
              Upcoming road maintenance
            </Description>
            <View
              style={{
                width: 34,
                height: 34,
                borderRadius: radius.md,
                backgroundColor: colors.red,
                alignItems: "center",
                justifyContent: "center",
                marginTop: 2,
              }}
            >
              <ArrowUpRight size={18} color={colors.white} />
            </View>
          </View>
          <Construction size={74} strokeWidth={1.2} color="#3F3F46" />
        </Surface>
      </PressableFeedback>
      <Section
        title="Your latest report"
        action="View all"
        onPress={() => router.push("/reports")}
      />
      <Card>
        {latest ? (
          <>
            <HeroCard.Header>
              <Badge tone="amber">{latest.status}</Badge>
            </HeroCard.Header>
            <HeroCard.Body>
              <HeroCard.Title style={ui.body}>
                {latest.description}
              </HeroCard.Title>
              <HeroCard.Description style={ui.muted}>
                {latest.location}
              </HeroCard.Description>
            </HeroCard.Body>
          </>
        ) : (
          <View style={ui.row}>
            <Surface
              style={{
                width: 44,
                height: 44,
                borderRadius: radius.md,
                backgroundColor: colors.greenSoft,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TreePine size={22} color={colors.green} />
            </Surface>
            <View style={{ flex: 1 }}>
              <HeroCard.Title
                style={{
                  fontFamily: fonts.semibold,
                  fontWeight: "600",
                  color: colors.ink,
                }}
              >
                All quiet here
              </HeroCard.Title>
              <HeroCard.Description style={ui.muted}>
                Your submitted reports will appear here.
              </HeroCard.Description>
            </View>
          </View>
        )}
      </Card>
      <Typography style={[ui.label, { textAlign: "center", fontSize: 9 }]}>
        SIME DARBY PROPERTY · TOWNSHIPCONNECT
      </Typography>
    </Page>
  );
}
const s = StyleSheet.create({
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.redSoft,
  },
  quickCard: {
    backgroundColor: colors.white,
    borderRadius: radius.card,
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#09090B",
    shadowOpacity: 0.03,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  quickIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.redSoft,
  },
  feature: {
    borderRadius: radius.card,
    padding: 22,
    minHeight: 176,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.ink,
    shadowColor: "#09090B",
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
});
