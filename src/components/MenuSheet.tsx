import type { ReactNode } from "react";
import { View } from "react-native";
import { BottomSheet } from "heroui-native/bottom-sheet";
import { PressableFeedback } from "./Common";
import { colors, fonts, ui } from "../lib/theme";

export default function MenuSheet({ open, onOpenChange, trigger, children, label, scrollable = false, showCloseButton = true, snapPoint = "70%", showHeader = true }: { open: boolean; onOpenChange: (open: boolean) => void; trigger?: ReactNode; children: ReactNode; label: string; scrollable?: boolean; showCloseButton?: boolean; snapPoint?: string; showHeader?: boolean }) {
  return <>
    {trigger && <PressableFeedback accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ expanded: open }} onPress={() => onOpenChange(true)}><View pointerEvents="none" aria-hidden importantForAccessibility="no-hide-descendants">{trigger}</View></PressableFeedback>}
    <BottomSheet isOpen={open} onOpenChange={onOpenChange}>
      <BottomSheet.Portal><BottomSheet.Overlay style={{ backgroundColor: `${colors.ink}66` }} /><BottomSheet.Content keyboardBehavior="extend" backgroundStyle={{ backgroundColor: colors.white }} {...(scrollable ? { snapPoints: [snapPoint], enableDynamicSizing: false, enableOverDrag: false, contentContainerClassName: "h-full" } : {})}>
        <View style={{ gap: 12, paddingBottom: 12, ...(scrollable ? { flex: 1 } : {}) }}>
          {showHeader && <View collapsable={false} collapsableChildren={false} style={ui.between}><BottomSheet.Title style={{ flex: 1, fontFamily: fonts.bold, fontSize: 18, color: colors.ink }}>{label}</BottomSheet.Title>{showCloseButton && <BottomSheet.Close animation="disable-all" accessibilityLabel={`Close ${label.toLowerCase()}`} size="sm" iconProps={{ size: 16, color: colors.muted }} />}</View>}
          <View style={{ borderTopWidth: showHeader ? 1 : 0, borderColor: colors.border, ...(scrollable ? { flex: 1 } : {}) }}>{children}</View>
        </View>
      </BottomSheet.Content></BottomSheet.Portal>
    </BottomSheet>
  </>;
}
