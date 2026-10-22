import { Pressable, Text, type ViewStyle } from "react-native";
import { colors, fonts, radius } from "../lib/theme";
type Props = {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
};
const webPressTransition = {
  transitionProperty: "transform, opacity, background-color",
  transitionDuration: "160ms",
  transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
} as unknown as ViewStyle;

export default function Action({ label, onPress, secondary, disabled }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        webPressTransition,
        {
          backgroundColor: secondary ? colors.cream : colors.red,
          minHeight: 48,
          borderRadius: radius.field,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 18,
          opacity: disabled ? 0.45 : pressed ? 0.85 : 1,
          transform: [{ scale: !disabled && pressed ? 0.96 : 1 }],
        },
      ]}
    >
      <Text
        style={{
          fontFamily: fonts.bold,
          color: secondary ? colors.red : "#fff",
          fontSize: 14,
          fontWeight: "700",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
