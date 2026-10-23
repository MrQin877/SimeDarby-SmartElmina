import { useEffect, useRef, useState } from "react";
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, TextInput, View } from "react-native";
import Animated, { cancelAnimation, Easing, ReduceMotion, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, ArrowUpRight, BriefcaseBusiness, Plus, Ellipsis, BusFront, Clock, House, MapPin, type LucideIcon } from "lucide-react-native";
import { Badge, Button, CloseButton, DemoNote, IconButton, Input, PressableFeedback, Surface, Typography } from "./Common";
import VoiceInput from "./VoiceInput";
import ShortcutMenu, { shortcutIconComponents, type ShortcutDraft } from "./ShortcutMenu";
import { places, searchPlaces, type Place } from "../lib/data";
import { upsertShortcut } from "../lib/shortcuts";
import { rememberSearch } from "../lib/search";
import { useStore } from "../state/store";
import { useAppToast } from "../hooks/useAppToast";
import { colors, fonts, radius, ui } from "../lib/theme";

export default function SearchOverlay({ query, onQueryChange, onClose, onSelect }: { query: string; onQueryChange: (text: string) => void; onClose: () => void; onSelect: (place: Place) => void }) {
  const insets = useSafeAreaInsets();
  const entrance = useSharedValue(0);
  useEffect(() => {
    entrance.value = withTiming(1, { duration: 220, easing: Easing.out(Easing.cubic), reduceMotion: ReduceMotion.System });
    return () => cancelAnimation(entrance);
  }, [entrance]);
  const entranceStyle = useAnimatedStyle(() => ({ opacity: entrance.value, transform: [{ translateY: (1 - entrance.value) * 14 }] }));
  const { data, update } = useStore();
  const notify = useAppToast();
  const input = useRef<TextInput>(null);
  const [configuring, setConfiguring] = useState<ShortcutDraft | null>(null);
  const [menu, setMenu] = useState<ShortcutDraft | "manage" | null>(null);
  const [showAll, setShowAll] = useState(false);
  const recent = data.recentSearches.map((id) => places.find((place) => place.id === id)).filter((place): place is Place => Boolean(place));
  const matches = searchPlaces(query);
  const work = places.find((place) => place.id === data.workPlaceId);
  const home = places.find((place) => place.id === data.homePlaceId);
  const searching = Boolean(query.trim()) || Boolean(configuring);
  const visible = searching ? matches : showAll ? recent : recent.slice(0, 4);
  const saveShortcut = (draft: ShortcutDraft, placeId: string) => {
    const place = places.find((p) => p.id === placeId);
    if (!place || !draft.title.trim()) return;
    update((d) => draft.id === "home" || draft.id === "work"
      ? { ...d, [draft.id === "home" ? "homePlaceId" : "workPlaceId"]: placeId }
      : { ...d, shortcuts: upsertShortcut(d.shortcuts, { id: draft.id, title: draft.title, iconName: draft.iconName, address: `${place.name} · ${place.subtitle}`, placeId }) });
    setConfiguring(null); setMenu(null); onQueryChange(""); Keyboard.dismiss();
    notify(`${draft.title} shortcut saved on this device.`, "success");
  };
  const choose = (place: Place) => {
    if (configuring) { saveShortcut(configuring, place.id); return; }
    update((d) => ({ ...d, recentSearches: rememberSearch(d.recentSearches, place.id) }));
    onSelect(place);
  };
  const configureShortcut = (draft: ShortcutDraft) => {
    setMenu(null); setConfiguring(draft); onQueryChange("");
    requestAnimationFrame(() => input.current?.focus());
  };
  const openMenu = (next: ShortcutDraft | "manage") => { Keyboard.dismiss(); setMenu(next); };
  const shortcuts: { title: string; detail: string; icon: LucideIcon; onPress: () => void }[] = [
    { title: home ? "Home" : "Home + Set", detail: home?.name || "Not set", icon: House, onPress: () => home ? choose(home) : configureShortcut({ id: "home", title: "Home", iconName: "map-pin" }) },
    { title: work ? "Work" : "Work + Set", detail: work?.name || "Not set", icon: BriefcaseBusiness, onPress: () => work ? choose(work) : configureShortcut({ id: "work", title: "Work", iconName: "map-pin" }) },
    { title: "Transit", detail: "Nearby bus stops", icon: BusFront, onPress: () => onQueryChange("Bus Stop") },
    ...data.shortcuts.map((item) => ({ title: item.title, detail: item.address, icon: shortcutIconComponents[item.iconName], onPress: () => { const place = places.find((p) => p.id === item.placeId); if (place) choose(place); else openMenu(item); } })),
    { title: "Add", detail: "Add custom shortcut", icon: Plus, onPress: () => { if (data.shortcuts.length >= 20) { notify("You can keep up to 20 custom shortcuts. Edit or delete one in More."); return; } openMenu({ id: `shortcut-${Date.now()}`, title: "", iconName: "map-pin" }); } },
    { title: "More", detail: "Manage shortcuts", icon: Ellipsis, onPress: () => openMenu("manage") },
  ];
  return <Animated.View collapsable={false} style={[{ position: "absolute", inset: 0, zIndex: 10 }, entranceStyle]}><KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top, paddingBottom: insets.bottom }}>
    <View style={{ paddingHorizontal: 18, paddingTop: 10, paddingBottom: 16, gap: 16 }}>
      <Surface style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingLeft: 6, paddingRight: 6, paddingVertical: 4, borderRadius: radius.field, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white }}>
        <IconButton icon={ArrowLeft} label={configuring ? "Cancel shortcut location selection" : "Close destination search"} onPress={() => { if (configuring) { setConfiguring(null); onQueryChange(""); } else onClose(); }} style={{ borderWidth: 0, backgroundColor: "transparent" }} />
        <Input ref={input} autoFocus value={query} onChangeText={onQueryChange} placeholder={configuring ? `Choose ${configuring.title} location` : "Search destination"} placeholderTextColor={colors.muted} accessibilityLabel="Search Elmina destination" returnKeyType="search" style={{ flex: 1, minWidth: 0, minHeight: 44, backgroundColor: colors.white, borderWidth: 0, outlineWidth: 0, paddingHorizontal: 2, paddingVertical: 8, shadowOpacity: 0, elevation: 0, fontFamily: fonts.regular, fontSize: 15, color: colors.ink }} />
        {query ? <CloseButton accessibilityLabel="Clear search text" onPress={() => { onQueryChange(""); input.current?.focus(); }} /> : <VoiceInput onResult={onQueryChange} />}
      </Surface>
    </View>
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 22 }}>
      {!searching && <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 18, gap: 8 }}>
        {shortcuts.map(({ title, detail, icon: Icon, onPress }, index) => <Surface key={`${title}-${index}`} style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 16, backgroundColor: colors.white, padding: 0, shadowOpacity: 0, elevation: 0, boxShadow: "none", maxWidth: 200, flexShrink: 0 }}><PressableFeedback accessibilityLabel={`${title}: ${detail}`} onPress={onPress} hitSlop={{ top: 6, bottom: 6 }} style={{ flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, minHeight: 32 }}><Icon size={14} color={colors.red} /><Typography numberOfLines={1} style={{ flexShrink: 1, fontFamily: fonts.medium, color: colors.ink, fontSize: 12 }}>{title}</Typography></PressableFeedback></Surface>)}
      </ScrollView>}
      <View style={{ paddingHorizontal: 18, gap: 10 }}>
        <View style={ui.between}><Typography style={[ui.heading, { fontSize: 16 }]}>{configuring ? `Choose ${configuring.title} location` : searching ? "Destinations" : "Recent"}</Typography>{!searching && recent.length > 0 && <Button variant="ghost" size="sm" onPress={() => { update((d) => ({ ...d, recentSearches: [] })); notify("Recent searches cleared."); }}><Button.Label style={{ color: colors.red, fontSize: 12 }}>Clear</Button.Label></Button>}</View>
        <Surface style={[ui.card, { padding: 0, gap: 0, overflow: "hidden" }]}>
          {visible.map((place, index) => <PressableFeedback key={place.id} accessibilityLabel={`Choose ${place.name}`} onPress={() => choose(place)} style={{ flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 16, borderBottomWidth: index === visible.length - 1 ? 0 : 1, borderColor: colors.border }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: searching ? colors.redSoft : colors.surfaceSecondary, justifyContent: "center", alignItems: "center" }}>{searching ? <MapPin size={18} color={colors.red} /> : <Clock size={18} color={colors.muted} />}</View>
            <View style={{ flex: 1, gap: 4 }}><Typography style={{ color: colors.ink, fontFamily: fonts.semibold, fontSize: 14 }}>{place.name}</Typography><Typography style={[ui.muted, { fontSize: 12 }]}>{place.subtitle}</Typography>{searching ? <View style={{ alignSelf: "flex-start" }}><Badge>{place.searchCategory || (place.kind === "transport" ? "Transit" : "Destination")}</Badge></View> : null}</View>
            {searching ? <ArrowUpRight size={18} color={colors.muted} /> : place.searchStatus && <View style={{ flexShrink: 1, maxWidth: 100, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 4, backgroundColor: colors.greenSoft }}><Typography numberOfLines={1} style={{ color: colors.green, fontFamily: fonts.medium, fontSize: 10 }}>{place.searchStatus}</Typography></View>}
          </PressableFeedback>)}
          {!visible.length && <Typography style={[ui.muted, { padding: 20 }]}>{searching ? "No destinations found. Try park, mall, bus or Kwasa." : "Your recent searches will appear here."}</Typography>}
        </Surface>
        {!searching && recent.length > 4 && <Button variant="ghost" size="sm" onPress={() => setShowAll(!showAll)}><Button.Label style={ui.muted}>{showAll ? "Show fewer recent searches" : "More from recent history"}</Button.Label></Button>}
        <DemoNote text="Illustrative township locations, opening hours and bus arrivals. History and shortcuts are saved on this device." />
      </View>
    </ScrollView>
    {/* HeroUI needs a closed-to-open transition; keep this sheet mounted. */}
    <ShortcutMenu initial={menu} onChange={setMenu} onClose={() => setMenu(null)} onSave={saveShortcut} onChoosePlace={configureShortcut} />
  </KeyboardAvoidingView></Animated.View>;
}
