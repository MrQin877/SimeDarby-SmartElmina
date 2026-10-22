import { Button } from "heroui-native/button";
import { fonts, radius } from "../lib/theme";
export type ActionProps = {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
};
export default function Action({
  label,
  onPress,
  secondary,
  disabled,
}: ActionProps) {
  return (
    <Button
      onPress={onPress}
      isDisabled={disabled}
      variant={secondary ? "secondary" : "primary"}
      style={{ borderRadius: radius.field, minHeight: 48 }}
    >
      <Button.Label style={{ fontFamily: fonts.bold }}>{label}</Button.Label>
    </Button>
  );
}
