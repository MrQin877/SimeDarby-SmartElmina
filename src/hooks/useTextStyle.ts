import { StyleSheet, type StyleProp, type TextStyle } from "react-native";
import { useStore } from "../state/store";
export function useTextStyle(style: StyleProp<TextStyle>, defaultSize = 14): StyleProp<TextStyle> {
  const { data } = useStore();
  if (data.textSize !== "large") return style;
  const resolved = StyleSheet.flatten(style) || {};
  const size = resolved.fontSize || defaultSize;
  return [style, { fontSize: size * 1.22, lineHeight: (resolved.lineHeight || size * 1.4) * 1.22 }];
}
