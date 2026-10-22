import { useState } from "react";
import { Modal, View } from "react-native";
import { router } from "expo-router";
import { Bell, ChevronRight, Globe, HelpCircle, Info, LogOut, MessageSquare, ShieldCheck, Type, type LucideIcon } from "lucide-react-native";
import { Avatar, Button, CloseButton, DemoNote, Page, PressableFeedback, Surface, Typography } from "../components/Common";
import LanguageSheet from "../components/LanguageSheet";
import { useStore } from "../state/store";
import { colors, fonts, ui } from "../lib/theme";
import { version } from "../../package.json";

export default function Profile() {
  const { data, update } = useStore();
  const [languageOpen, setLanguageOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggedOut, setLoggedOut] = useState(false);
  const settings = (section: string) => router.push({ pathname: "/settings", params: { section } });
  if (loggedOut) return <Page title="Demo session ended" back>
    <Typography style={ui.body}>Your locally saved preferences are retained. This prototype has no connected sign-in service.</Typography>
    <Button onPress={() => { setLoggedOut(false); router.replace("/home"); }} style={{ minHeight: 48 }}><Button.Label>Return to demo</Button.Label></Button>
  </Page>;
  return <Page back stickyTitle="Settings">
    <View style={{ alignItems: "center", gap: 10 }}>
      <Avatar size="lg" style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: colors.redSoft }}>
        <Avatar.Fallback textProps={{ style: { fontFamily: fonts.bold, fontSize: 26, color: colors.red } }}>{data.fullName.split(" ").filter(Boolean).slice(0, 2).map((word) => word[0]).join("")}</Avatar.Fallback>
      </Avatar>
      <Typography style={[ui.heading, { textAlign: "center" }]}>{data.fullName}</Typography>
      <PressableFeedback onPress={() => router.push("/profile-details")} style={{ minHeight: 44, justifyContent: "center" }}><Typography style={{ color: colors.red, fontFamily: fonts.semibold, fontSize: 14 }}>View profile</Typography></PressableFeedback>
    </View>
    <Typography style={ui.label}>ACCOUNT & TOWNSHIP</Typography>
    <Surface style={[ui.card, { padding: 0, gap: 0, overflow: "hidden" }]}>
      <SettingsRow icon={Globe} label="Language Preference" detail={data.language} onPress={() => setLanguageOpen(true)} />
      <SettingsRow icon={Type} label="Appearance Preferences" detail={data.textSize === "large" ? "AAA Senior Mode" : "Standard"} onPress={() => settings("appearance")} />
      <SettingsRow icon={Bell} label="Notification Preferences" onPress={() => settings("notifications")} last />
    </Surface>
    <Typography style={ui.label}>SUPPORT & LEGAL</Typography>
    <Surface style={[ui.card, { padding: 0, gap: 0, overflow: "hidden" }]}>
      <SettingsRow icon={HelpCircle} label="Help & Support" onPress={() => settings("support")} />
      <SettingsRow icon={MessageSquare} label="Report Issue / Feedback" onPress={() => router.push("/report")} />
      <SettingsRow icon={Info} label="About TownshipConnect" onPress={() => settings("about")} />
      <SettingsRow icon={ShieldCheck} label="Privacy Information" onPress={() => settings("privacy")} last />
    </Surface>
    <Surface style={[ui.card, { padding: 0, gap: 0, overflow: "hidden" }]}><SettingsRow icon={LogOut} label="Log out" onPress={() => setLogoutOpen(true)} last /></Surface>
    <Typography style={[ui.muted, { textAlign: "center" }]}>Smart Elmina · v{version}</Typography>
    <DemoNote text="Demo resident account · no live identity or access verification" />
    <LanguageSheet open={languageOpen} value={data.language} onClose={() => setLanguageOpen(false)} onSelect={(language) => { update((d) => ({ ...d, language })); setLanguageOpen(false); }} />
    <Modal visible={logoutOpen} transparent animationType="fade" onRequestClose={() => setLogoutOpen(false)}>
      <View style={{ flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#18181B66" }}>
        <Surface style={{ padding: 22, gap: 16 }}>
          <View style={ui.between}><Typography style={ui.heading}>End demo session?</Typography><CloseButton onPress={() => setLogoutOpen(false)} /></View>
          <Typography style={ui.body}>This simulates logging out. Your local demo data will be retained.</Typography>
          <Button onPress={() => { setLogoutOpen(false); setLoggedOut(true); }} style={{ minHeight: 48 }}><Button.Label>Log out</Button.Label></Button>
          <Button variant="secondary" onPress={() => setLogoutOpen(false)} style={{ minHeight: 48 }}><Button.Label>Cancel</Button.Label></Button>
        </Surface>
      </View>
    </Modal>
  </Page>;
}
function SettingsRow({ icon: Icon, label, detail, onPress, last = false }: { icon: LucideIcon; label: string; detail?: string; onPress: () => void; last?: boolean }) {
  return <PressableFeedback onPress={onPress} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 12, minHeight: 56, borderBottomWidth: last ? 0 : 1, borderColor: colors.border }}>
    <Icon size={20} color={colors.ink} />
    <View style={{ flex: 1, gap: 4 }}><Typography style={{ fontFamily: fonts.semibold, color: colors.ink, fontSize: 14 }}>{label}</Typography>{detail && <Typography style={ui.muted}>{detail}</Typography>}</View>
    <ChevronRight size={17} color={colors.muted} />
  </PressableFeedback>;
}
