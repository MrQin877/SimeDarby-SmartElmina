import { useState } from "react";
import { View, type TextInputProps } from "react-native";
import { CircleCheck, LockKeyhole, Pencil } from "lucide-react-native";
import { DemoNote, IconButton, Input, Label, Page, Surface, Typography } from "../components/Common";
import Action from "../components/Action";
import { useAppToast } from "../hooks/useAppToast";
import { useStore } from "../state/store";
import { colors, fonts, ui } from "../lib/theme";

function ProfileField({ label, value, onChange, keyboardType = "default", verified = false, editing, last = false }: { label: string; value: string; onChange: (text: string) => void; keyboardType?: TextInputProps["keyboardType"]; verified?: boolean; editing: boolean; last?: boolean }) {
  const id = `profile-${label.replaceAll(" ", "-").toLowerCase()}`;
  return <View style={{ paddingHorizontal: 14, paddingVertical: 8, minHeight: 58, borderBottomWidth: last ? 0 : 1, borderColor: colors.border, flexDirection: "row", alignItems: "center", gap: 10 }}>
    <View style={{ width: 110, flexDirection: "row", alignItems: "center", gap: 5 }}>
      <Label nativeID={`${id}-label`}><Label.Text style={{ fontFamily: fonts.medium, fontSize: 12, color: colors.muted }}>{label}</Label.Text></Label>
      {verified && <View accessible accessibilityLabel="Email address verified"><CircleCheck size={14} color={colors.green} /></View>}
    </View>
    {editing ? <Input nativeID={id} accessibilityLabel={label} value={value} onChangeText={onChange} keyboardType={keyboardType} autoCorrect={keyboardType === "email-address" ? false : undefined} autoCapitalize={keyboardType === "email-address" ? "none" : "words"} style={{ flex: 1, minWidth: 0, minHeight: 42, textAlign: "right", borderWidth: 0, outlineWidth: 0, backgroundColor: colors.white, paddingHorizontal: 0, paddingVertical: 8, shadowOpacity: 0, elevation: 0, fontFamily: fonts.medium, fontSize: 14, color: colors.ink }} />
      : <Typography selectable style={{ flex: 1, minWidth: 0, textAlign: "right", fontFamily: fonts.medium, fontSize: 14, color: colors.ink }}>{value}</Typography>}
  </View>;
}

export default function ProfileDetails() {
  const { data, update } = useStore();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(data.name);
  const [fullName, setFullName] = useState(data.fullName);
  const [phone, setPhone] = useState(data.phone);
  const [email, setEmail] = useState(data.email);
  const [address, setAddress] = useState(data.address);
  const notify = useAppToast();
  const valid = Boolean(name.trim() && fullName.trim() && phone.trim() && address.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()));
  const beginEditing = () => {
    setName(data.name); setFullName(data.fullName); setPhone(data.phone); setEmail(data.email); setAddress(data.address);
    setEditing(true);
  };
  return <Page title={editing ? "Edit profile" : "Profile details"} back backTo="/profile" right={!editing ? <IconButton icon={Pencil} label="Edit profile" color={colors.red} onPress={beginEditing} style={{ borderWidth: 0, backgroundColor: "transparent" }} /> : undefined}>
    <Typography style={ui.label}>PERSONAL DETAILS</Typography>
    <Surface style={[ui.card, { padding: 0, gap: 0, overflow: "hidden" }]}>
      <ProfileField label="Preferred name" editing={editing} value={editing ? name : data.name} onChange={setName} />
      <ProfileField label="Full name" editing={editing} value={editing ? fullName : data.fullName} onChange={setFullName} />
      <View style={{ padding: 14, gap: 8 }}><View style={ui.between}><Typography style={{ color: colors.muted, fontSize: 12 }}>Resident ID</Typography><View style={[ui.row, { gap: 6 }]}><LockKeyhole size={14} color={colors.muted} /><Typography selectable style={{ color: colors.ink, fontFamily: fonts.medium, fontSize: 13 }}>{data.residentId}</Typography></View></View><Typography style={[ui.muted, { fontSize: 11 }]}>Masked demo identifier · managed by township administration.</Typography></View>
    </Surface>
    <Typography style={ui.label}>CONTACT & ADDRESS</Typography>
    <Surface style={[ui.card, { padding: 0, gap: 0, overflow: "hidden" }]}>
      <ProfileField label="Mobile number" editing={editing} value={editing ? phone : data.phone} onChange={setPhone} keyboardType="phone-pad" />
      <ProfileField label="Email address" editing={editing} value={editing ? email : data.email} onChange={setEmail} keyboardType="email-address" verified={data.emailVerified && (!editing || email.trim() === data.email)} />
      <ProfileField label="Property address" editing={editing} value={editing ? address : data.address} onChange={setAddress} last />
    </Surface>
    {editing && <><Action label="Save changes" disabled={!valid} onPress={() => {
      if (!editing || !valid) return;
      update((d) => ({ ...d, name: name.trim(), fullName: fullName.trim(), phone: phone.trim(), email: email.trim(), address: address.trim(), emailVerified: email.trim() === d.email && d.emailVerified }));
      setEditing(false);
      notify("Profile saved on this device.", "success");
    }} /><Action label="Cancel" secondary onPress={() => setEditing(false)} /></>}
    <DemoNote text="Demo resident profile · changes are saved on this device only." />
  </Page>;
}
