import { View } from "react-native";
import { PressableFeedback, Typography } from "./Common";
import { colors, fonts } from "../lib/theme";

export interface LineTabsProps {
  value: string;
  onChange: (value: string) => void;
  items: { value: string; label: string }[];
}

export default function LineTabs({ value, onChange, items }: LineTabsProps) {
  return (
    <View
      accessibilityRole="tablist"
      style={{
        flexDirection: "row",
        borderBottomWidth: 1,
        borderColor: colors.border,
      }}
    >
      {items.map((item) => {
        const isSelected = value === item.value;
        return (
          <PressableFeedback
            key={item.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            onPress={() => onChange(item.value)}
            style={{
              flex: 1,
              minHeight: 46,
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: 6,
              position: "relative",
            }}
          >
            <Typography
              style={{
                fontFamily: isSelected ? fonts.bold : fonts.semibold,
                fontWeight: isSelected ? "700" : "500",
                fontSize: 13,
                color: isSelected ? colors.red : colors.muted,
                textAlign: "center",
              }}
            >
              {item.label}
            </Typography>
            {isSelected && (
              <View
                style={{
                  position: "absolute",
                  bottom: -1,
                  left: 12,
                  right: 12,
                  height: 2.5,
                  borderRadius: 1.5,
                  backgroundColor: colors.red,
                }}
              />
            )}
          </PressableFeedback>
        );
      })}
    </View>
  );
}
