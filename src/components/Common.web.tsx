import { CloseButton as HeroCloseButton } from "heroui-native/close-button";
import { forwardRef, useEffect, useRef, type ReactNode, type ComponentProps } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  Pressable,
  Text as RNText,
  TextInput,
  View,
  type ImageProps,
  type PressableProps,
  type StyleProp,
  type TextInputProps,
  type TextProps,
  type ViewProps,
  type ViewStyle,
} from "react-native";
import {
  ArrowUpRight,
  Search,
  X,
  type LucideIcon,
} from "lucide-react-native";
import { useTextStyle } from "../hooks/useTextStyle";
import { colors, fonts, radius, ui } from "../lib/theme";

const HeroCardRoot = ({ children, style, ...props }: ViewProps) => (
  <View style={[ui.card, style]} {...props}>
    {children}
  </View>
);
export const HeroCard = Object.assign(HeroCardRoot, {
  Header: ({ children, style, ...props }: ViewProps) => (
    <View style={style} {...props}>
      {children}
    </View>
  ),
  Body: ({ children, style, ...props }: ViewProps) => (
    <View style={[{ flex: 1, gap: 8 }, style]} {...props}>
      {children}
    </View>
  ),
  Footer: ({ children, style, ...props }: ViewProps) => (
    <View style={style} {...props}>
      {children}
    </View>
  ),
  Title: ({ children, style, ...props }: TextProps) => (
    <RNText style={[ui.heading, style]} {...props}>
      {children}
    </RNText>
  ),
  Description: ({ children, style, ...props }: TextProps) => (
    <RNText style={[ui.muted, style]} {...props}>
      {children}
    </RNText>
  ),
});

export const Surface = Object.assign(
  ({
    children,
    style,
    ...props
  }: ViewProps & { variant?: string }) => (
    <View
      style={[{ backgroundColor: colors.white, borderRadius: radius.card }, style]}
      {...props}
    >
      {children}
    </View>
  ),
  {
    Background: ({ children, style, ...props }: ViewProps) => (
      <View style={style} {...props}>
        {children}
      </View>
    ),
  },
);

const webPressTransition = {
  transitionProperty: "transform, opacity, background-color",
  transitionDuration: "200ms",
  transitionTimingFunction: "ease-out",
} as unknown as ViewStyle;

export const PressableFeedback = Object.assign(
  ({ children, style, isDisabled, ...props }: PressableProps & { animation?: unknown; isDisabled?: boolean }) => (
    <Pressable
      accessibilityRole="button"
      style={(state) => [
        webPressTransition,
        typeof style === "function" ? style(state) : style,
        state.pressed
          ? { opacity: 0.92, transform: [{ scale: 0.985 }] }
          : { transform: [{ scale: 1 }] },
      ]}
      {...props}
      disabled={isDisabled || props.disabled}
    >
      {children}
    </Pressable>
  ),
  {
    Scale: ({ children, style, ...props }: ViewProps) => (
      <View style={style} {...props}>
        {children}
      </View>
    ),
    Highlight: () => null,
    Ripple: () => null,
  },
);

export const Button = Object.assign(
  ({
    children,
    onPress,
    isDisabled,
    disabled,
    isIconOnly,
    variant = "primary",
    style,
    ...props
  }: PressableProps & {
    isDisabled?: boolean;
    isIconOnly?: boolean;
    variant?: string;
    size?: string;
    animation?: unknown;
  }) => {
    const off = isDisabled || disabled;
    const bg =
      variant === "ghost" || variant === "tertiary"
        ? "transparent"
        : variant === "secondary"
          ? colors.cream
          : colors.red;
    return (
      <Pressable
        accessibilityRole="button"
        disabled={off}
        onPress={onPress}
        style={(state) => [
          webPressTransition,
          {
            backgroundColor: bg,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            borderRadius: radius.field,
            opacity: off ? 0.45 : state.pressed ? 0.9 : 1,
            transform: [{ scale: !off && state.pressed ? 0.985 : 1 }],
          },
          typeof style === "function" ? style(state) : style,
        ]}
        {...props}
      >
        {children}
      </Pressable>
    );
  },
  {
    Label: ({ children, style, ...props }: TextProps) => (
      <RNText
        style={[{ fontFamily: fonts.bold, fontSize: 14, fontWeight: "700" }, style]}
        {...props}
      >
        {children}
      </RNText>
    ),
    Background: () => null,
  },
);

export const CloseButton = (props: ComponentProps<typeof HeroCloseButton>) => <HeroCloseButton {...props} animation="disable-all" size="sm" iconProps={{ ...props.iconProps, size: 16 }} style={[props.style, { width: 28, height: 28, minWidth: 28, minHeight: 28, borderRadius: 14 }]} />;

export const Chip = Object.assign(
  ({
    children,
    onPress,
    style,
    ...props
  }: Omit<PressableProps, "children"> & {
    children?: ReactNode;
    variant?: string;
    color?: string;
    size?: string;
  }) =>
    onPress ? (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={(state) => [
          webPressTransition,
          typeof style === "function" ? style(state) : style,
          state.pressed
            ? { opacity: 0.9, transform: [{ scale: 0.985 }] }
            : { transform: [{ scale: 1 }] },
        ]}
        {...props}
      >
        {children}
      </Pressable>
    ) : (
      <View style={style as ViewStyle} {...(props as ViewProps)}>
        {children}
      </View>
    ),
  {
    Label: ({ children, style, ...props }: TextProps) => (
      <RNText style={style} {...props}>
        {children}
      </RNText>
    ),
    Background: () => null,
  },
);

export const Avatar = Object.assign(
  ({
    children,
    style,
    ...props
  }: ViewProps & { size?: string; color?: string; variant?: string }) => (
    <View
      style={[
        {
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: colors.redSoft,
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  ),
  {
    Image: (props: ImageProps) => <Image {...props} />,
    Fallback: ({
      children,
      style,
      textProps,
    }: ViewProps & { textProps?: TextProps }) => (
      <View style={[{ alignItems: "center", justifyContent: "center", overflow: "visible" }, style]}>
        {typeof children === "string" ? (
          <RNText
            {...textProps}
            style={[{ color: colors.red, fontWeight: "700", includeFontPadding: false, lineHeight: 28, textAlign: "center", textAlignVertical: "center" }, textProps?.style]}
          >
            {children}
          </RNText>
        ) : (
          children
        )}
      </View>
    ),
    Background: () => null,
  },
);

export const Alert = Object.assign(
  ({
    children,
    style,
    status = "default",
    ...props
  }: ViewProps & { status?: "default" | "accent" | "success" | "warning" | "danger" }) => {
    const bg =
      status === "danger"
        ? colors.redSoft
        : status === "warning"
          ? colors.amberSoft
          : status === "success"
            ? colors.greenSoft
            : colors.white;
    return (
      <View
        accessibilityRole="alert"
        style={[
          {
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            padding: 13,
            borderRadius: radius.card,
            backgroundColor: bg,
          },
          style,
        ]}
        {...props}
      >
        {children}
      </View>
    );
  },
  {
    Indicator: ({ children }: ViewProps) => <>{children}</>,
    Content: ({ children, style, ...props }: ViewProps) => (
      <View style={[{ flex: 1, gap: 2 }, style]} {...props}>
        {children}
      </View>
    ),
    Title: ({ children, style, ...props }: TextProps) => (
      <RNText style={[{ fontSize: 13, fontWeight: "600", color: colors.ink }, style]} {...props}>
        {children}
      </RNText>
    ),
    Description: ({ children, style, ...props }: TextProps) => (
      <RNText style={[ui.muted, style]} {...props}>
        {children}
      </RNText>
    ),
  },
);

export const Spinner = ({
  color = colors.red,
  size = "md",
}: {
  color?: string;
  size?: "sm" | "md" | "lg";
}) => (
  <ActivityIndicator
    color={color === "danger" ? colors.red : color}
    size={size === "lg" ? "large" : "small"}
  />
);

export const Separator = ({ style, ...props }: ViewProps) => (
  <View
    style={[{ height: 1, backgroundColor: colors.border }, style]}
    {...props}
  />
);

export const TextField = ({
  children,
  style,
  ...props
}: ViewProps & { isInvalid?: boolean; isDisabled?: boolean; isRequired?: boolean }) => (
  <View style={[{ gap: 8 }, style]} {...props}>
    {children}
  </View>
);

export const Label = Object.assign(
  ({ children, style, ...props }: TextProps) => (
    <RNText style={[ui.body, style]} {...props}>
      {children}
    </RNText>
  ),
  {
    Text: ({ children, style, ...props }: TextProps) => (
      <RNText style={[ui.body, style]} {...props}>
        {children}
      </RNText>
    ),
  },
);

export const Input = forwardRef<TextInput, TextInputProps>(function WebInput(
  { style, ...props },
  ref,
) {
  return <TextInput ref={ref} style={[ui.input, style]} {...props} />;
});

export const TextArea = forwardRef<TextInput, TextInputProps>(
  function WebTextArea({ style, ...props }, ref) {
    return (
      <TextInput
        ref={ref}
        multiline
        style={[ui.input, { minHeight: 110, textAlignVertical: "top" }, style]}
        {...props}
      />
    );
  },
);

export const Description = ({ children, style, ...props }: TextProps) => (
  <RNText style={[ui.muted, style]} {...props}>
    {children}
  </RNText>
);

export const FieldError = ({ children, style, ...props }: TextProps) => (
  <RNText
    accessibilityRole="alert"
    style={[{ color: colors.red, fontSize: 13 }, style]}
    {...props}
  >
    {children}
  </RNText>
);

export const SearchField = Object.assign(
  ({
    children,
    style,
  }: ViewProps & { value?: string; onChange?: (v: string) => void }) => (
    <View style={style}>{children}</View>
  ),
  {
    Group: ({ children, style }: ViewProps) => (
      <View
        style={[
          ui.row,
          ui.input,
          { padding: 7, paddingLeft: 15, flex: 1 },
          style,
        ]}
      >
        {children}
      </View>
    ),
    SearchIcon: () => <Search size={18} color={colors.muted} />,
    Input: (props: TextInputProps) => (
      <TextInput
        style={{
          flex: 1,
          minWidth: 0,
          paddingVertical: 10,
          fontSize: 16,
          color: colors.ink,
        }}
        {...props}
      />
    ),
    ClearButton: ({ onPress }: { onPress?: () => void }) => (
      <Pressable onPress={onPress} style={{ padding: 6 }}>
        <X size={16} color={colors.muted} />
      </Pressable>
    ),
  },
);

const TypographyBase = ({ children, style, ...props }: TextProps & { type?: string; weight?: string; color?: string; align?: string }) => {
  const scaled = useTextStyle([ui.body, style]);
  return <RNText style={scaled} {...props}>{children}</RNText>;
};
function Heading({ children, style, ...props }: TextProps & { type?: string }) {
  const scaled = useTextStyle([ui.heading, style], 18);
  return <RNText accessibilityRole="header" style={scaled} {...props}>{children}</RNText>;
}
export const Typography = Object.assign(TypographyBase, { Heading, Paragraph: TypographyBase, Code: TypographyBase });

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
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        webPressTransition,
        {
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: colors.white,
          borderWidth: 1,
          borderColor: colors.border,
          alignItems: "center",
          justifyContent: "center",
          opacity: pressed ? 0.88 : 1,
          transform: [{ scale: pressed ? 0.985 : 1 }],
        },
        style,
        ui.iconButton,
      ]}
    >
      <Icon size={20} color={color} strokeWidth={1.9} />
    </Pressable>
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
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        webPressTransition,
        {
          borderRadius: chipRadius,
          paddingHorizontal: elevated ? 16 : 14,
          paddingVertical: elevated ? 10 : 9,
          backgroundColor: selected ? activeColor : inactiveBg,
          borderWidth: selected ? 0 : 1,
          borderColor: elevated ? "rgba(24,24,27,0.06)" : colors.border,
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          opacity: pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.985 : 1 }],
        },
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
      {Icon && (
        <Icon
          size={15}
          color={selected ? colors.white : colors.ink}
          fill={selected ? colors.white : "transparent"}
          strokeWidth={2}
        />
      )}
      <RNText
        style={{
          fontFamily: fonts.semibold,
          fontSize: 12,
          fontWeight: "600",
          letterSpacing: -0.1,
          color: selected ? colors.white : colors.ink,
        }}
      >
        {label}
      </RNText>
    </Pressable>
  );
}

export function AnimatedSheet({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const translateY = useRef(new Animated.Value(20)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [translateY, opacity]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
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
  return (
    <View
      style={{
        alignSelf: "flex-start",
        backgroundColor: bg,
        paddingHorizontal: 9,
        paddingVertical: 5,
        borderRadius: radius.sm,
      }}
    >
      <RNText
        style={{
          fontFamily: fonts.bold,
          color: fg,
          fontSize: 10,
          fontWeight: "700",
          letterSpacing: 0.5,
        }}
      >
        {children}
      </RNText>
    </View>
  );
}

export function Card({
  children,
  style,
}: {
  children: ReactNode;
  style?: ViewStyle;
}) {
  return <View style={[ui.card, style]}>{children}</View>;
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
      <RNText style={ui.heading}>{title}</RNText>
      {action && (
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          style={[ui.row, { gap: 4, minHeight: 44 }]}
        >
          <RNText
            style={{
              fontFamily: fonts.semibold,
              color: colors.red,
              fontSize: 12,
              fontWeight: "600",
            }}
          >
            {action}
          </RNText>
          <ArrowUpRight size={14} color={colors.red} />
        </Pressable>
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
    <RNText
      style={{
        fontFamily: fonts.regular,
        color: colors.muted,
        fontSize: 10,
        lineHeight: 16,
        letterSpacing: 0.2,
      }}
    >
      {text}
    </RNText>
  );
}
