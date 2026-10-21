import { useState } from "react";
import { View, StyleSheet } from "react-native";
import { router } from "expo-router";
import {
  Bell,
  MapPin,
  MessageSquarePlus,
  ClipboardList,
  Bookmark,
  Sun,
  Bus,
  Car,
  Route,
  QrCode,
  ChevronRight,
} from "lucide-react-native";
import {
  Avatar,
  Badge,
  Card,
  Description,
  Page,
  PressableFeedback,
  Section,
  Surface,
  Typography,
} from "../../components/Common";
import { VisitorPassModal } from "../../components/VisitorPassModal";
import { colors, fonts, radius, ui } from "../../lib/theme";
import { useStore } from "../../state/store";
import { initialAlerts } from "../../lib/data";

export default function Home() {
  const { data } = useStore();
  const [isVisitorPassOpen, setIsVisitorPassOpen] = useState(false);

  const unreadAlertsCount = initialAlerts.filter(
    (a) => !data.readAlerts.includes(a.id) && !a.isRead
  ).length;

  return (
    <Page>
      {/* Top Header: Resident Greeting + Alerts Bell */}
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
            <Description style={ui.muted}>Good morning,</Description>
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

        <View style={[ui.row, { gap: 6 }]}>
          <PressableFeedback
            onPress={() => router.push("/alerts")}
            accessibilityLabel="View alerts"
            style={s.alertBell}
          >
            <Bell size={20} color={colors.ink} strokeWidth={2} />
            {unreadAlertsCount > 0 && (
              <View style={s.badgeDot} />
            )}
          </PressableFeedback>
        </View>
      </View>

      {/* Township Context Banner */}
      <View style={{ gap: 4 }}>
        <View style={[ui.between, { alignItems: "center" }]}>
          <View style={[ui.row, { gap: 5 }]}>
            <MapPin size={13} color={colors.red} />
            <Typography style={[ui.label, { color: colors.red }]}>
              CITY OF ELMINA
            </Typography>
          </View>

          <Surface
            variant="secondary"
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: radius.sm,
              backgroundColor: colors.surfaceSecondary,
            }}
          >
            <Sun size={13} color={colors.amber} />
            <Typography style={{ fontSize: 11, fontFamily: fonts.semibold, color: colors.ink }}>
              Sunny 29°C
            </Typography>
          </Surface>
        </View>

        <Typography.Heading type="h1" style={[ui.title, { fontSize: 30 }]}>
          Smart Elmina
        </Typography.Heading>
        <Description style={ui.muted}>
          Smart mobility, road telemetry & connected resident services.
        </Description>
      </View>

      {/* 1. Smart Services: 3 Core Mobility Shortcuts */}
      <View style={{ gap: 8 }}>
        <Typography style={ui.label}>SMART SERVICES</Typography>
        <View style={{ flexDirection: "row", gap: 10 }}>
          {/* Traffic Map */}
          <PressableFeedback
            onPress={() => router.push("/(tabs)/explore?sheet=traffic_details")}
            style={{ flex: 1 }}
          >
            <Surface style={s.serviceCard}>
              <Surface style={[s.serviceIcon, { backgroundColor: colors.redSoft }]}>
                <Car size={20} color={colors.red} strokeWidth={2.2} />
              </Surface>
              <Typography style={s.serviceTitle}>
                Traffic Map
              </Typography>
            </Surface>
          </PressableFeedback>

          {/* Plan Journey */}
          <PressableFeedback
            onPress={() => router.push("/(tabs)/explore?sheet=plan_journey")}
            style={{ flex: 1 }}
          >
            <Surface style={s.serviceCard}>
              <Surface style={[s.serviceIcon, { backgroundColor: colors.surfaceSecondary }]}>
                <Route size={20} color={colors.ink} strokeWidth={2.2} />
              </Surface>
              <Typography style={s.serviceTitle}>
                Plan Journey
              </Typography>
            </Surface>
          </PressableFeedback>

          {/* Bus & Shuttle */}
          <PressableFeedback
            onPress={() => router.push("/(tabs)/explore?sheet=shuttle")}
            style={{ flex: 1 }}
          >
            <Surface style={s.serviceCard}>
              <Surface style={[s.serviceIcon, { backgroundColor: colors.surfaceSecondary }]}>
                <Bus size={20} color={colors.ink} strokeWidth={2.2} />
              </Surface>
              <Typography style={s.serviceTitle}>
                Bus & Shuttle
              </Typography>
            </Surface>
          </PressableFeedback>
        </View>
      </View>

      {/* 2. Visitor Quick-Pass Action Card */}
      <PressableFeedback onPress={() => setIsVisitorPassOpen(true)}>
        <Surface style={s.visitorCard}>
          <View style={[ui.row, { gap: 12, flex: 1 }]}>
            <Surface
              style={{
                width: 44,
                height: 44,
                borderRadius: radius.md,
                backgroundColor: colors.white,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <QrCode size={22} color={colors.red} />
            </Surface>
            <View style={{ flex: 1, gap: 2 }}>
              <View style={[ui.row, { gap: 6 }]}>
                <Typography style={{ fontSize: 14, fontFamily: fonts.bold, fontWeight: "700", color: colors.ink }}>
                  Issue Visitor Quick-Pass
                </Typography>
                <Badge tone="red">Gate 3</Badge>
              </View>
              <Description style={ui.muted}>
                Instant digital boom gate code with WhatsApp sharing
              </Description>
            </View>
          </View>
          <ChevronRight size={18} color={colors.muted} />
        </Surface>
      </PressableFeedback>

      {/* 3. Civic Reporting Tools */}
      <View style={{ flexDirection: "row", gap: 10 }}>
        {(
          [
            {
              title: "Report issue",
              icon: MessageSquarePlus,
              route: "/report" as const,
            },
            { title: "My reports", icon: ClipboardList, route: "/reports" as const },
            { title: "Saved places", icon: Bookmark, route: "/saved" as const },
          ] as const
        ).map(({ title, icon: Icon, route }) => (
          <PressableFeedback
            key={title}
            onPress={() => router.push(route)}
            style={{ flex: 1 }}
          >
            <Surface style={s.quickCard}>
              <Surface variant="secondary" style={s.quickIcon}>
                <Icon size={18} color={colors.ink} strokeWidth={2} />
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

      {/* 4. Latest Community Updates (Matching prototype updates feed) */}
      <View style={{ gap: 8 }}>
        <Section
          title="Latest Community Updates"
          action="See all (14)"
          onPress={() => router.push("/(tabs)/community")}
        />

        <View style={{ gap: 10 }}>
          {/* Update 1 */}
          <PressableFeedback
            onPress={() => router.push("/(tabs)/community?tab=forum")}
          >
            <Card style={{ padding: 14, gap: 8 }}>
              <View style={ui.between}>
                <Badge tone="red">WEEKEND TOUR</Badge>
                <Typography style={{ fontSize: 11, color: colors.muted }}>45 mins ago</Typography>
              </View>
              <Typography style={{ fontSize: 14, fontFamily: fonts.bold, fontWeight: "700", color: colors.ink, lineHeight: 20 }}>
                Weekend Community Cycling Tour: Route preview across 90km twin cycle track
              </Typography>
              <Description style={ui.muted}>
                Gathering at Rainbow Bridge this Saturday 7:00 AM • Families with cargo bikes welcome.
              </Description>
            </Card>
          </PressableFeedback>

          {/* Update 2 */}
          <PressableFeedback
            onPress={() => router.push("/announcement?id=ann-01")}
          >
            <Card style={{ padding: 14, gap: 8 }}>
              <View style={ui.between}>
                <Badge tone="amber">TRANSPORT ADVISORY</Badge>
                <Typography style={{ fontSize: 11, color: colors.muted }}>Today, 7:30 AM</Typography>
              </View>
              <Typography style={{ fontSize: 14, fontFamily: fonts.bold, fontWeight: "700", color: colors.ink, lineHeight: 20 }}>
                Persiaran Atmosfera Eastbound Closure & Feeder S1 Route Adjustment
              </Typography>
              <Description style={ui.muted}>
                Roadworks between Valley Gate and Central Park from Oct 24–28. Feeder Bus S1 rerouted to Lakeside Bay.
              </Description>
            </Card>
          </PressableFeedback>

          {/* Update 3 */}
          <PressableFeedback
            onPress={() => router.push("/(tabs)/community?tab=forum")}
          >
            <Card style={{ padding: 14, gap: 8 }}>
              <View style={ui.between}>
                <Badge tone="green">GARDENING CLUB</Badge>
                <Typography style={{ fontSize: 11, color: colors.muted }}>5 hours ago</Typography>
              </View>
              <Typography style={{ fontSize: 14, fontFamily: fonts.bold, fontWeight: "700", color: colors.ink, lineHeight: 20 }}>
                Elmina Lakeside Community Garden: Extra heirloom tomato & basil seedlings to share
              </Typography>
              <Description style={ui.muted}>
                Welcome to pick up from Lot 4B plots • Organic monsoon cuttings.
              </Description>
            </Card>
          </PressableFeedback>
        </View>
      </View>

      <Typography style={[ui.label, { textAlign: "center", fontSize: 9, marginTop: 10 }]}>
        SIME DARBY PROPERTY · TOWNSHIPCONNECT
      </Typography>

      {/* Visitor Pass Modal */}
      <VisitorPassModal
        isOpen={isVisitorPassOpen}
        onClose={() => setIsVisitorPassOpen(false)}
      />
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
  alertBell: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeDot: {
    position: "absolute",
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.red,
  },
  serviceCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.card,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 100,
  },
  serviceIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  serviceTitle: {
    fontFamily: fonts.bold,
    fontSize: 12,
    fontWeight: "700",
    color: colors.ink,
    textAlign: "center",
    lineHeight: 16,
  },
  visitorCard: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.card,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickCard: {
    backgroundColor: colors.white,
    borderRadius: radius.card,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceSecondary,
  },
});
