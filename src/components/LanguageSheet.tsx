import { BottomSheet } from "heroui-native/bottom-sheet";
import { RadioGroup } from "heroui-native/radio-group";
import { colors } from "../lib/theme";
import type { LocalData } from "../lib/model";
export const languages: LocalData["language"][] = ["English (UK)", "Bahasa Melayu", "中文 (Simplified)"];
export interface LanguageSheetProps { open: boolean; value: LocalData["language"]; onClose: () => void; onSelect: (value: LocalData["language"]) => void }
export default function LanguageSheet({ open, value, onClose, onSelect }: LanguageSheetProps) {
  return <BottomSheet isOpen={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
    <BottomSheet.Portal>
      <BottomSheet.Overlay />
      <BottomSheet.Content backgroundStyle={{ backgroundColor: colors.white }}>
        <BottomSheet.Title>Language preference</BottomSheet.Title>
        <BottomSheet.Description>Your preference is saved on this device. Translation is a preview feature.</BottomSheet.Description>
        <RadioGroup value={value} onValueChange={(next) => { if (languages.includes(next as LocalData["language"])) onSelect(next as LocalData["language"]); }} style={{ paddingVertical: 18, gap: 14 }}>
          {languages.map((language) => <RadioGroup.Item key={language} value={language} style={{ minHeight: 48 }}>{language}</RadioGroup.Item>)}
        </RadioGroup>
      </BottomSheet.Content>
    </BottomSheet.Portal>
  </BottomSheet>;
}
