import { View } from "react-native";
import { Typography } from "./Common";
import { colors, fonts } from "../lib/theme";

export default function AnnouncementClusterBadge({ count, selected = false }: { count: number; selected?: boolean }) {
  return <View pointerEvents="none" style={{ width: 64, height: 64, alignItems: "center", justifyContent: "center" }}>
    <View style={{ position: "absolute", width: 60, height: 60, borderRadius: 30, backgroundColor: colors.redSoft }} />
    <View style={{ width: 46, height: 46, borderRadius: 23, borderWidth: 2, borderColor: colors.red, backgroundColor: selected ? colors.red : colors.white, alignItems: "center", justifyContent: "center", shadowColor: colors.ink, shadowOpacity: 0.16, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, elevation: 4 }}>
      <Typography style={{ fontFamily: fonts.semibold, fontSize: count > 99 ? 14 : 18, color: selected ? colors.white : colors.red }}>{count}</Typography>
    </View>
  </View>;
}
