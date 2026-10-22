import { useEffect, useRef, useState } from "react";
import { Image, Platform, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Camera } from "lucide-react-native";
import { Avatar, Button, PressableFeedback } from "./Common";
import MenuSheet from "./MenuSheet";
import { residentInitials } from "../lib/avatar";
import { deleteAvatar, persistAvatar } from "../lib/avatar-storage";
import { useStore } from "../state/store";
import { useAppToast } from "../hooks/useAppToast";
import { colors, fonts } from "../lib/theme";
export default function ResidentAvatar({ size = 44, editable = false }: { size?: number; editable?: boolean }) {
  const { data, setAvatarUri } = useStore();
  const [failed, setFailed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const choosing = useRef(false);
  const notify = useAppToast();
  useEffect(() => setFailed(false), [data.avatarUri]);
  const pick = async () => {
    if (choosing.current) return;
    choosing.current = true; setBusy(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [1, 1], quality: 0.85, base64: Platform.OS === "web" });
      if (result.canceled || !result.assets[0]) return;
      const uri = await persistAvatar(result.assets[0]);
      const old = data.avatarUri;
      setAvatarUri(uri); setMenuOpen(false);
      void deleteAvatar(old).catch(() => {});
      notify("Profile photo updated.", "success");
    } catch (error) {
      notify(error instanceof Error && error.message.includes("5 MB") ? error.message : "Photo selection is unavailable. Please try another photo or check photo permissions.", "warning");
    } finally { choosing.current = false; setBusy(false); }
  };
  return <View style={{ width: size, height: size }}>
    <Avatar style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.redSoft, alignItems: "center", justifyContent: "center" }}>
      {data.avatarUri && !failed ? <Image source={{ uri: data.avatarUri }} accessibilityLabel="Resident profile photo" onError={() => setFailed(true)} style={{ width: size, height: size, borderRadius: size / 2 }} /> : <Avatar.Fallback animation={false} style={{ alignItems: "center", justifyContent: "center" }} textProps={{ style: { fontFamily: fonts.bold, fontSize: size >= 70 ? 26 : 16, lineHeight: 28, includeFontPadding: false, textAlign: "center", textAlignVertical: "center", color: colors.red } }}>{residentInitials(data.fullName)}</Avatar.Fallback>}
    </Avatar>
    {editable && <PressableFeedback accessibilityLabel="Change profile photo" onPress={() => setMenuOpen(true)} style={{ position: "absolute", right: -4, bottom: -4, width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: colors.red, borderWidth: 3, borderColor: colors.white }}><Camera size={16} color={colors.white} /></PressableFeedback>}
    <MenuSheet open={menuOpen && editable} onOpenChange={setMenuOpen} label="Profile photo" showCloseButton={false}>
      <View style={{ gap: 10, paddingTop: 16 }}><Button isDisabled={busy} onPress={() => { void pick(); }}><Button.Label>{busy ? "Saving photo…" : data.avatarUri ? "Replace photo" : "Choose photo"}</Button.Label></Button>{data.avatarUri && <Button variant="secondary" isDisabled={busy} onPress={() => { const previous = data.avatarUri; setAvatarUri(null); setMenuOpen(false); void deleteAvatar(previous).catch(() => {}); notify("Profile photo removed.", "success"); }}><Button.Label style={{ color: colors.red }}>Remove photo</Button.Label></Button>}</View>
    </MenuSheet>
  </View>;
}
