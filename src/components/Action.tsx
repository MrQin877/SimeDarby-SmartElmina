import { Button } from "heroui-native/button";
import { fonts, radius } from "../lib/theme";
export type ActionProps = {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
  disableAnimation?: boolean;
};
export default function Action({
  label,
  onPress,
  secondary,
  disabled,
  disableAnimation = false,
}: ActionProps) {
  return (
    <Button
      animation={disableAnimation ? "disable-all" : undefined}
      onPress={onPress}
      isDisabled={disabled}
      variant={secondary ? "secondary" : "primary"}
      style={{ borderRadius: radius.field, minHeight: 48 }}
    >
      <Button.Label style={{ fontFamily: fonts.bold }}>{label}</Button.Label>
    </Button>
  );
}
