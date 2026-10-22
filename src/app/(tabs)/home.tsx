import { View } from "react-native";
import { router } from "expo-router";
import { MapPin, Sun, Car, Route, Bus } from "lucide-react-native";
import { Description, Page, PressableFeedback, Section, Surface, Typography } from "../../components/Common";
import ResidentHeader from "../../components/ResidentHeader";
import AnnouncementCard from "../../components/AnnouncementCard";
import { announcements } from "../../lib/data";
import { colors, fonts, ui } from "../../lib/theme";

export default function Home() {
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
  </Page>;
}
