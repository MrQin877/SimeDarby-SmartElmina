import { View } from "react-native";
import { BusFront, MapPin, Megaphone, TriangleAlert, Video } from "lucide-react-native";
import { Badge, PressableFeedback, Surface, Typography } from "./Common";
import type { Place } from "../lib/data";
import { isAnnouncementMarker, markerKind } from "../lib/map-layers";
import { colors, ui } from "../lib/theme";

export default function ColocatedFacilities({ places, onSelect }: { places: Place[]; onSelect: (place: Place) => void }) {
  return <Surface style={{ padding: 0, gap: 0 }}>
    {places.map(place => {
      const kind = markerKind(place), advisory = isAnnouncementMarker(place);
      const Icon = advisory ? Megaphone : kind === "camera" ? Video : kind === "shuttle" ? BusFront : kind === "hazard" ? TriangleAlert : MapPin;
      const label = advisory ? "Advisory" : kind === "camera" ? "CCTV" : kind === "shuttle" ? "Bus stop" : kind === "hazard" ? "Traffic" : "Place";
      return <PressableFeedback key={place.id} accessibilityRole="button" accessibilityLabel={`Open ${label}: ${place.name}`} onPress={() => onSelect(place)} style={[ui.row, { paddingVertical: 14, borderBottomWidth: 1, borderColor: colors.border, gap: 10 }]}>
        <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceSecondary, alignItems: "center", justifyContent: "center" }}><Icon size={18} color={kind === "camera" ? colors.blue : colors.red} /></View>
        <View style={{ flex: 1, minWidth: 0, gap: 4 }}><Typography style={[ui.heading, { fontSize: 14 }]}>{place.name}</Typography><Typography numberOfLines={2} style={ui.muted}>{place.subtitle}</Typography></View>
        <Badge tone={kind === "camera" ? "blue" : advisory ? "red" : "neutral"}>{label}</Badge>
      </PressableFeedback>;
    })}
  </Surface>;
}
