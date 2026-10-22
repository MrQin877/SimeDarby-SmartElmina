import { View } from "react-native";
import { router } from "expo-router";
import { ChevronRight, MapPin } from "lucide-react-native";
import { Page, PressableFeedback, Surface, Typography } from "../components/Common";
import { useStore } from "../state/store";
import { places } from "../lib/data";
import { colors, fonts, ui } from "../lib/theme";
export default function Saved() {
  const { data } = useStore();
  const saved = places.filter((place) => data.saved.includes(place.id));
  return <Page title="Saved places" subtitle="Your favourites, one tap away." back>
    <Surface style={[ui.card, { padding: 0, gap: 0, overflow: "hidden" }]}>
      {saved.map((place, index) => <PressableFeedback key={place.id} accessibilityLabel={`Open ${place.name} on Explore`} onPress={() => router.push({ pathname: "/explore", params: { place: place.id } })} style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderBottomWidth: index === saved.length - 1 ? 0 : 1, borderColor: colors.border }}>
        <View style={{ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: colors.redSoft }}><MapPin size={19} color={colors.red} /></View>
        <View style={{ flex: 1, gap: 4 }}><Typography style={{ fontFamily: fonts.bold, color: colors.ink, fontSize: 15 }}>{place.name}</Typography><Typography style={[ui.muted, { fontSize: 13 }]}>{place.subtitle}</Typography></View><ChevronRight size={18} color={colors.muted} />
      </PressableFeedback>)}
      {!saved.length && <View style={{ padding: 16, gap: 8 }}><Typography style={ui.heading}>Your favourite places belong here.</Typography><Typography style={ui.muted}>Select a place on Explore, then tap the bookmark to save it.</Typography></View>}
    </Surface>
  </Page>;
}
