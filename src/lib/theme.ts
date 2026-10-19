import { StyleSheet } from "react-native";

export const fonts = {
  regular: "DMSans_400Regular",
  medium: "DMSans_500Medium",
  semibold: "DMSans_600SemiBold",
  bold: "DMSans_700Bold",
};

/**
 * Matches HeroUI theme tokens:
 * --radius: 0.25rem (4px base -> xl: 6px, 2xl: 8px, 3xl: 12px, 4xl: 16px)
 * --field-radius: 0.75rem (12px)
 */
export const radius = {
  sm: 6,
  md: 8,
  field: 12,
  card: 12,
  lg: 16,
};

export const colors = {
  red: "#DE372B",
  redSoft: "#FDECEB",
  ink: "#18181B",
  muted: "#71717A",
  background: "#F5F5F6",
  surfaceSecondary: "#EFEFF1",
  surfaceTertiary: "#EAEAEB",
  white: "#FFFFFF",
  border: "#E6E6E9",
  cream: "#FDECEB",
  green: "#16803C",
  greenSoft: "#EAF8EF",
  amber: "#B45309",
  amberSoft: "#FEF3C7",
  blue: "#2563EB",
};
export const ui = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  page: { padding: 22, paddingBottom: 38, gap: 20 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  between: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 28,
    fontWeight: "700",
    color: colors.ink,
    letterSpacing: -0.8,
  },
  heading: {
    fontFamily: fonts.bold,
    fontSize: 18,
    fontWeight: "700",
    color: colors.ink,
    letterSpacing: -0.4,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    color: colors.ink,
  },
  muted: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    color: colors.muted,
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.1,
    color: colors.muted,
  },
  card: {
    padding: 18,
    borderRadius: radius.card,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
    shadowColor: "#09090B",
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  input: {
    fontFamily: fonts.regular,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.field,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.ink,
    shadowColor: "#09090B",
    shadowOpacity: 0.02,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  shadow: {
    shadowColor: "#09090B",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
});
