import { Image, View } from "react-native";
import { router } from "expo-router";
import { Construction, LampCeiling, Leaf, MapPin } from "lucide-react-native";
import { Badge, DemoNote, Page, Surface, Typography } from "../components/Common";
import Action from "../components/Action";
import { useStore } from "../state/store";
import { colors, fonts, ui } from "../lib/theme";
export default function Reports() {
  const { data } = useStore();
  return <Page title="My reports" subtitle="Every issue, followed through." back>
    <Action label="Report an issue" onPress={() => router.push("/report")} />
    <Surface style={[ui.card, { padding: 0, gap: 0, overflow: "hidden" }]}>
      {!data.reports.length && <View style={{ padding: 16, gap: 8 }}><Typography style={ui.heading}>Nothing reported yet</Typography><Typography style={ui.muted}>Your issues, attached photos and progress will appear here.</Typography></View>}
      {data.reports.map((report, index) => {
        const Icon = /light/i.test(report.category) ? LampCeiling : /clean|environment/i.test(report.category) ? Leaf : Construction;
        const resolved = report.status === "Resolved";
        return <View key={report.id} style={{ padding: 16, gap: 12, borderBottomWidth: index === data.reports.length - 1 ? 0 : 1, borderColor: colors.border }}>
          <View style={ui.between}><Typography style={[ui.label, { flex: 1, fontSize: 10 }]}>{report.category}</Typography><Badge tone={resolved ? "green" : "amber"}>{resolved ? "Resolved" : report.status === "In progress" ? "In Progress" : "Under Review"}</Badge></View>
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceSecondary, alignItems: "center", justifyContent: "center" }}><Icon size={19} color={colors.ink} /></View>
            <View style={{ flex: 1, gap: 6 }}><Typography style={{ fontFamily: fonts.semibold, color: colors.ink, fontSize: 14, lineHeight: 21 }}>{report.description}</Typography><View style={{ flexDirection: "row", gap: 4 }}><MapPin size={13} color={colors.muted} /><Typography style={[ui.muted, { flex: 1 }]}>{report.location}</Typography></View></View>
            {report.photos[0] && <Image source={{ uri: report.photos[0] }} accessibilityLabel="Attached report photo" style={{ width: 60, height: 60, borderRadius: 9 }} />}
          </View>
          {report.photos.length > 1 && <View style={{ flexDirection: "row", gap: 8 }}>{report.photos.slice(1).map((uri, i) => <Image key={`${uri}-${i}`} source={{ uri }} accessibilityLabel={`Attached report photo ${i + 2}`} style={{ width: 54, height: 54, borderRadius: 9 }} />)}</View>}
          <Typography style={ui.muted}>{new Date(report.createdAt).toLocaleString()}</Typography>
        </View>;
      })}
    </Surface>
    <DemoNote text="Saved locally · report statuses are demo labels, not live management updates" />
  </Page>;
}
