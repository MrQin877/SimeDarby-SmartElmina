import { Text, View } from "react-native";
import { colors, fonts } from "../lib/theme";

export default function AnnouncementClusterBadge({ count, selected = false }: { count: number; selected?: boolean }) {
  return <View pointerEvents="none" style={{ width: 48, height: 48, alignItems: "center", justifyContent: "center" }}>
    {selected && <View style={{ position: "absolute", width: 46, height: 46, borderRadius: 23, borderWidth: 2, borderColor: colors.ink }} />}
    <View style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 2.5, borderColor: colors.white, backgroundColor: colors.red, alignItems: "center", justifyContent: "center", shadowColor: "#09090B", shadowOpacity: 0.16, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 4 }}>
      <Text style={{ fontFamily: fonts.bold, fontSize: 14, color: colors.white }}>{count}</Text>
    </View>
  </View>;
}
