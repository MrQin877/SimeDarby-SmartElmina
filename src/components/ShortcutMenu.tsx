import { useBottomSheetAwareHandlers } from "heroui-native/hooks";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Keyboard, View } from "react-native";
import { BriefcaseBusiness, Dumbbell, GraduationCap, House, Landmark, MapPin, ShoppingBasket, type LucideIcon } from "lucide-react-native";
import { Button, Input, Label, Typography } from "./Common";
import MenuSheet from "./MenuSheet";
import { places } from "../lib/data";
import { shortcutIcons, type ShortcutIcon, type ShortcutItem } from "../lib/shortcuts";
import { useStore } from "../state/store";
import { useAppToast } from "../hooks/useAppToast";
import { colors, fonts, ui } from "../lib/theme";

export const shortcutIconComponents: Record<ShortcutIcon, LucideIcon> = { "map-pin": MapPin, dumbbell: Dumbbell, "graduation-cap": GraduationCap, "shopping-basket": ShoppingBasket, landmark: Landmark };
export type ShortcutDraft = { id: string; title: string; iconName: ShortcutIcon; placeId?: string };

function ShortcutLabelInput({ value, onChange }: { value: string; onChange: (text: string) => void }) {
  const handlers = useBottomSheetAwareHandlers();
  return <Input {...handlers} accessibilityLabel="Shortcut label" value={value} maxLength={24} placeholder="Gym, School, Surau…" onChangeText={onChange} style={ui.input} />;
}

export default function ShortcutMenu({ initial, onChange, onClose, onChoosePlace, onSave }: { initial: ShortcutDraft | "manage" | null; onChange: (next: ShortcutDraft | "manage") => void; onClose: () => void; onChoosePlace: (draft: ShortcutDraft) => void; onSave: (draft: ShortcutDraft, placeId: string) => void }) {
  const { data, update } = useStore();
  const notify = useAppToast();
  const draft = initial && initial !== "manage" ? initial : null;
  const setDraft = (next: ShortcutDraft | null) => onChange(next || "manage");
  const protectedSlot = draft?.id === "home" || draft?.id === "work";
  const location = places.find((p) => p.id === draft?.placeId);
  const editPermanent = (id: "home" | "work") => {
    const placeId = (id === "home" ? data.homePlaceId : data.workPlaceId) || undefined;
    const next: ShortcutDraft = { id, title: id === "home" ? "Home" : "Work", iconName: "map-pin", placeId };
    if (placeId && places.some((place) => place.id === placeId)) setDraft(next);
    else onChoosePlace(next);
  };
  const reset = (id: "home" | "work") => {
    update((d) => ({ ...d, [id === "home" ? "homePlaceId" : "workPlaceId"]: null }));
    notify(`${id === "home" ? "Home" : "Work"} location reset.`);
  };
  const row = (id: string, title: string, detail: string, Icon: LucideIcon, edit: () => void, remove: () => void, permanent: boolean, canRemove = true) => <View key={id} style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12, borderBottomWidth: 1, borderColor: colors.border }}><Icon size={18} color={colors.muted} /><View style={{ flex: 1, minWidth: 0, gap: 4 }}><Typography style={{ fontFamily: fonts.semibold, color: colors.ink, fontSize: 14 }}>{title}</Typography><Typography numberOfLines={2} style={[ui.muted, { fontSize: 12 }]}>{detail}</Typography></View><Button variant="ghost" size="sm" onPress={edit}><Button.Label style={{ fontSize: 12 }}>Edit</Button.Label></Button>{canRemove && <Button variant="ghost" size="sm" accessibilityLabel={`${permanent ? "Reset" : "Delete"} ${title}`} onPress={remove}><Button.Label style={{ color: colors.red, fontSize: 12 }}>{permanent ? "Reset" : "Delete"}</Button.Label></Button>}</View>;
  return <MenuSheet open={initial !== null} scrollable={!draft} onOpenChange={(open) => { if (!open) onClose(); }} label={draft ? `${protectedSlot ? "Set" : draft.placeId ? "Edit" : "Add"} ${protectedSlot ? draft.title : "shortcut"}` : "Manage shortcuts"}>
    {draft ? <View style={{ gap: 12, paddingTop: 14 }}>
      {!protectedSlot && <><Label>Shortcut label</Label><ShortcutLabelInput value={draft.title} onChange={(title) => setDraft({ ...draft, title })} /><Label>Icon</Label><View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>{shortcutIcons.map((name) => { const Icon = shortcutIconComponents[name]; return <Button key={name} isIconOnly size="sm" variant={draft.iconName === name ? "primary" : "secondary"} accessibilityLabel={`Use ${name} icon`} accessibilityState={{ selected: draft.iconName === name }} onPress={() => setDraft({ ...draft, iconName: name })}><Icon size={18} color={draft.iconName === name ? colors.white : colors.ink} /></Button>; })}</View></>}
      <Typography style={ui.muted}>{location?.name || "Choose a destination from township search."}</Typography>
      <Button variant="secondary" isDisabled={!draft.title.trim()} onPress={() => { Keyboard.dismiss(); onChoosePlace({ ...draft, title: draft.title.trim() }); }}><Button.Label>{location ? "Change destination" : "Choose destination"}</Button.Label></Button>
      {location && <Button isDisabled={!draft.title.trim()} onPress={() => onSave({ ...draft, title: draft.title.trim() }, location.id)}><Button.Label>Save shortcut</Button.Label></Button>}
      {initial === "manage" && <Button variant="ghost" size="sm" onPress={() => setDraft(null)}><Button.Label>Back to shortcuts</Button.Label></Button>}
    </View> : <>
      <BottomSheetScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
        {row("home", "Home", places.find((p) => p.id === data.homePlaceId)?.name || "Not set · Protected shortcut", House, () => editPermanent("home"), () => reset("home"), true, places.some((p) => p.id === data.homePlaceId))}
        {row("work", "Work", places.find((p) => p.id === data.workPlaceId)?.name || "Not set · Protected shortcut", BriefcaseBusiness, () => editPermanent("work"), () => reset("work"), true, places.some((p) => p.id === data.workPlaceId))}
        {data.shortcuts.map((item: ShortcutItem) => row(item.id, item.title, item.address, shortcutIconComponents[item.iconName], () => setDraft(item), () => { update((d) => ({ ...d, shortcuts: d.shortcuts.filter((s) => s.id !== item.id) })); notify(`${item.title} shortcut deleted.`); }, false))}
      </BottomSheetScrollView>
      <Button style={{ marginTop: 14 }} isDisabled={data.shortcuts.length >= 20} onPress={() => setDraft({ id: `shortcut-${Date.now()}`, title: "", iconName: "map-pin" })}><Button.Label>Add custom shortcut</Button.Label></Button>
    </>}
  </MenuSheet>;
}
