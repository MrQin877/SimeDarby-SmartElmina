import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { MapPin, Sun, Car, Route, Bus, ScanLine } from "lucide-react-native";
import { Button, Description, Page, PressableFeedback, Section, Surface, Typography } from "../../components/Common";
import BoardingQrModal from "../../components/BoardingQrModal";
import { useStore } from "../../state/store";
import ResidentHeader from "../../components/ResidentHeader";
import AnnouncementCard from "../../components/AnnouncementCard";
import ScenarioShowcaseBar from "../../components/ScenarioShowcaseBar";
import { announcements } from "../../lib/data";
import { colors, fonts, ui } from "../../lib/theme";

export default function Home() {
  const { data } = useStore();
  const [bannerSize, setBannerSize] = useState({ width: 0, height: 0 });
  const [qrOpen, setQrOpen] = useState(false);
  return <Page stickyHeader={<ResidentHeader compact />}>
    <ResidentHeader />
    <View style={{ gap: 6 }}>
      <View style={ui.between}>
        <View style={[ui.row, { gap: 4 }]}><MapPin size={13} color={colors.red} /><Typography style={[ui.label, { color: colors.red }]}>CITY OF ELMINA</Typography></View>
        <View style={[ui.row, { gap: 4 }]}><Sun size={14} color={colors.amber} /><Typography style={ui.muted}>Demo · 29°C</Typography></View>
      </View>
      <Typography.Heading style={[ui.title, { fontSize: 30 }]}>Smart Elmina</Typography.Heading>
      <Description style={ui.muted}>Your daily connection to City of Elmina.</Description>
    </View>
    <Surface onLayout={event => { const { width, height } = event.nativeEvent.layout; setBannerSize(previous => previous.width === width && previous.height === height ? previous : { width, height }); }} style={{ paddingHorizontal: 16, paddingVertical: 14, backgroundColor: colors.red, flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 20, overflow: "hidden" }}>
      <Svg pointerEvents="none" width={bannerSize.width} height={bannerSize.height} style={StyleSheet.absoluteFillObject}><Defs><LinearGradient id="homePassSunrise" x1="0%" y1="0%" x2="100%" y2="100%"><Stop offset="0%" stopColor="#DE372B" /><Stop offset="48%" stopColor="#EA580C" /><Stop offset="100%" stopColor="#F59E0B" /></LinearGradient></Defs><Rect width="100%" height="100%" fill="url(#homePassSunrise)" /></Svg>
      <PressableFeedback accessibilityLabel="Open Eco-Pass rewards" onPress={() => router.push("/rewards")} style={{ flex: 1, minWidth: 0, gap: 3 }}><Typography style={{ fontFamily: fonts.bold, fontSize: 9, lineHeight: 14, color: colors.white, backgroundColor: "#FFFFFF26", borderRadius: 8, alignSelf: "flex-start", paddingHorizontal: 6, paddingVertical: 2 }}>★ GOLD TIER</Typography><Typography style={{ fontFamily: fonts.bold, fontSize: 24, lineHeight: 32, color: colors.white }}>{data.rewardPoints} PTS</Typography><Typography style={{ color: colors.white, fontSize: 10, lineHeight: 15 }}>Feeder Bus & Temu Merchant Pass</Typography></PressableFeedback>
      <Button size="sm" onPress={() => setQrOpen(true)} style={{ borderRadius: 24, paddingHorizontal: 14, backgroundColor: colors.white }}><ScanLine size={16} color={colors.red} /><Button.Label style={{ fontSize: 12, color: colors.red }}>Pass QR</Button.Label></Button>
    </Surface>
    <ScenarioShowcaseBar />
    <View style={{ gap: 10 }}>
      <Typography style={ui.label}>SMART MOBILITY</Typography>
      <View style={{ flexDirection: "row", gap: 10 }}>
        {[
          { label: "Traffic Map", sheet: "traffic_details", Icon: Car },
          { label: "Plan Journey", sheet: "plan_journey", Icon: Route },
          { label: "Bus & Shuttle", sheet: "shuttle", Icon: Bus },
        ].map(({ label, sheet, Icon }) => <PressableFeedback key={sheet} onPress={() => router.push({ pathname: "/explore", params: { sheet } })} style={{ flex: 1 }}>
          <Surface style={[ui.card, { alignItems: "center", justifyContent: "center", minHeight: 116, paddingHorizontal: 8 }]}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.redSoft, alignItems: "center", justifyContent: "center" }}><Icon size={21} color={colors.red} /></View>
            <Typography style={{ fontFamily: fonts.bold, fontSize: 12, textAlign: "center", color: colors.ink }}>{label}</Typography>
          </Surface>
        </PressableFeedback>)}
      </View>
    </View>
    <View style={{ gap: 10 }}>
      <Section title="Latest Community Updates" action="See all" onPress={() => router.push("/community")} />
      <Surface style={[ui.card, { padding: 0, gap: 0, overflow: "hidden" }]}>
        {announcements.slice(0, 3).map((post) => <AnnouncementCard key={post.id} post={post} minimal />)}
      </Surface>
    </View>
    <Typography style={[ui.label, { textAlign: "center", fontSize: 9 }]}>SIME DARBY PROPERTY · SMART ELMINA</Typography>
    <BoardingQrModal open={qrOpen} onClose={() => setQrOpen(false)} />
  </Page>;
}
