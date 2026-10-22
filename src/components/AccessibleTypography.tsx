import type { ComponentProps } from "react";
import { Typography as HeroTypography } from "heroui-native/text";
import { useTextStyle } from "../hooks/useTextStyle";
function Text(props: ComponentProps<typeof HeroTypography>) {
  const style = useTextStyle(props.style);
  return <HeroTypography {...props} style={style} />;
}
function Heading(props: ComponentProps<typeof HeroTypography.Heading>) {
  const style = useTextStyle(props.style, 20);
  return <HeroTypography.Heading {...props} style={style} />;
}
export const Typography = Object.assign(Text, { Heading, Paragraph: Text, Code: Text });
