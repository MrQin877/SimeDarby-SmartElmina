import type { ComponentProps, ReactNode } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import Animated, {
  Easing,
  LinearTransition,
  SlideInDown,
  SlideOutDown,
} from "react-native-reanimated";
import { ArrowUpRight, type LucideIcon } from "lucide-react-native";
import { Alert } from "heroui-native/alert";
import { Avatar } from "heroui-native/avatar";
import { Button } from "heroui-native/button";
import { Card as HeroCard } from "heroui-native/card";
import { Chip } from "heroui-native/chip";
import { CloseButton as HeroCloseButton } from "heroui-native/close-button";
import { Description } from "heroui-native/description";
import { FieldError } from "heroui-native/field-error";
import { Input } from "heroui-native/input";
import { Label } from "heroui-native/label";
import { PressableFeedback } from "heroui-native/pressable-feedback";
import { SearchField } from "heroui-native/search-field";
import { Separator } from "heroui-native/separator";
import { Spinner } from "heroui-native/spinner";
import { Surface } from "heroui-native/surface";
import { Typography } from "./AccessibleTypography";
import { TextArea } from "heroui-native/text-area";
import { TextField } from "heroui-native/text-field";
import { colors, fonts, radius, ui } from "../lib/theme";

export {
  Alert,
  Avatar,
  Button,
  HeroCard,
  Chip,
  Description,
  FieldError,
  Input,
  Label,
  PressableFeedback,
  SearchField,
  Separator,
  Spinner,
  Surface,
  Typography,
  TextArea,
  TextField,
};

export function CloseButton(props: ComponentProps<typeof HeroCloseButton>) {
  return <HeroCloseButton {...props} size="sm" iconProps={{ ...props.iconProps, size: 16 }} style={[props.style, { width: 28, height: 28, minWidth: 28, minHeight: 28, borderRadius: 14 }]} />;
}

export function IconButton({
  icon: Icon,
  label,
  onPress,
  color = colors.ink,
  style,
}: {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  color?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Button
      isIconOnly
      variant="tertiary"
      size="md"
      accessibilityLabel={label}
      onPress={onPress}
      style={[
        {
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: colors.white,
          borderWidth: 1,
          borderColor: colors.border,
        },
        style,
        ui.iconButton,
      ]}
    >
      <Icon size={20} color={color} strokeWidth={1.9} />
    </Button>
  );
}

export function FilterChip({
  label,
  selected,
  onPress,
  icon: Icon,
  activeColor = colors.red,
  inactiveBg = colors.surfaceSecondary,
  elevated = false,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: LucideIcon;
  activeColor?: string;
  inactiveBg?: string;
  elevated?: boolean;
}) {
  const chipRadius = radius.field;
  return (
    <PressableFeedback
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[
        { borderRadius: chipRadius },
        elevated
          ? {
              shadowColor: "#09090B",
              shadowOpacity: selected ? 0.16 : 0.08,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 3 },
              elevation: 4,
            }
          : null,
      ]}
    >
      <Chip
        variant={selected ? "primary" : "secondary"}
        color={selected ? "accent" : "default"}
        size="lg"
        pointerEvents="none"
        style={{
          borderRadius: chipRadius,
          paddingHorizontal: elevated ? 16 : 14,
          paddingVertical: elevated ? 10 : 9,
          backgroundColor: selected ? activeColor : inactiveBg,
          borderWidth: selected ? 0 : 1,
          borderColor: elevated ? "rgba(24,24,27,0.06)" : colors.border,
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
        }}
      >
        {Icon && (
          <Icon
            size={15}
            color={selected ? colors.white : colors.ink}
            fill={selected ? colors.white : "transparent"}
            strokeWidth={2}
          />
        )}
        <Chip.Label
          style={{
            fontFamily: fonts.semibold,
            fontSize: 12,
            fontWeight: "600",
            letterSpacing: -0.1,
            color: selected ? colors.white : colors.ink,
          }}
        >
          {label}
        </Chip.Label>
      </Chip>
    </PressableFeedback>
  );
}

export function AnimatedSheet({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Animated.View
      entering={SlideInDown.duration(200).easing(Easing.out(Easing.ease))}
      exiting={SlideOutDown.duration(150).easing(Easing.in(Easing.ease))}
      layout={LinearTransition.duration(200)}
      style={style}
    >
      {children}
    </Animated.View>
  );
}

export { Page } from "./PageFrame";

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "green" | "amber" | "red";
}) {
  const bg = {
    neutral: colors.surfaceSecondary,
    green: colors.greenSoft,
    amber: colors.amberSoft,
    red: colors.redSoft,
  }[tone];
  const fg = {
    neutral: colors.muted,
    green: colors.green,
    amber: colors.amber,
    red: colors.red,
  }[tone];
  const chipColor = {
    neutral: "default" as const,
    green: "success" as const,
    amber: "warning" as const,
    red: "danger" as const,
  }[tone];
  return (
    <Chip
      variant="soft"
      color={chipColor}
      size="sm"
      style={{
        alignSelf: "flex-start",
        backgroundColor: bg,
        paddingHorizontal: 9,
        paddingVertical: 5,
        borderRadius: radius.sm,
      }}
    >
      <Chip.Label
        style={{
          fontFamily: fonts.bold,
          color: fg,
          fontSize: 10,
          fontWeight: "700",
          letterSpacing: 0.5,
        }}
      >
        {children}
      </Chip.Label>
    </Chip>
  );
}

export function Card({
  children,
  style,
}: {
  children: ReactNode;
  style?: ViewStyle;
}) {
  return <HeroCard style={[ui.card, style]}>{children}</HeroCard>;
}

export function Section({
  title,
  action,
  onPress,
}: {
  title: string;
  action?: string;
  onPress?: () => void;
}) {
  return (
    <View style={ui.between}>
      <Typography.Heading type="h3" style={ui.heading}>
        {title}
      </Typography.Heading>
      {action && (
        <Button
          variant="ghost"
          size="sm"
          onPress={onPress}
          style={[ui.row, { gap: 4, minHeight: 44, paddingHorizontal: 4 }]}
        >
          <Button.Label
            style={{
              fontFamily: fonts.semibold,
              color: colors.red,
              fontSize: 12,
              fontWeight: "600",
            }}
          >
            {action}
          </Button.Label>
          <ArrowUpRight size={14} color={colors.red} />
        </Button>
      )}
    </View>
  );
}

export function DemoNote({
  text = "Demo township data · not live conditions",
}: {
  text?: string;
}) {
  return (
    <Description
      style={{
        fontFamily: fonts.regular,
        color: colors.muted,
        fontSize: 10,
        lineHeight: 16,
        letterSpacing: 0.2,
      }}
    >
      {text}
    </Description>
  );
}

