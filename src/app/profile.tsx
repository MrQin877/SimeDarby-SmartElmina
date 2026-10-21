import { useState } from "react";
import { View, StyleSheet, Switch } from "react-native";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Description,
  Input,
  Label,
  Page,
  PressableFeedback,
  Surface,
  TextField,
  Typography,
} from "../components/Common";
import Action from "../components/Action";
import {
  ChevronRight,
  Globe,
  Home,
  MapPin,
  Phone,
  ShieldCheck,
  Type,
} from "lucide-react-native";
import { useStore } from "../state/store";
import { colors, fonts, radius, ui } from "../lib/theme";

export default function Profile() {
  const { data, update } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(data.fullName);
  const [address, setAddress] = useState(data.address);
  const [phone, setPhone] = useState(data.phone);
  const [savedMessage, setSavedMessage] = useState("");

  const handleSaveProfile = () => {
    update((d) => ({
      ...d,
      fullName: fullName.trim() || d.fullName,
      address: address.trim() || d.address,
      phone: phone.trim() || d.phone,
      name: (fullName.trim() || d.fullName).split(" ")[0] || d.name,
    }));
    setIsEditing(false);
    setSavedMessage("Profile updated successfully");
    setTimeout(() => setSavedMessage(""), 3000);
  };

  const handleCycleLanguage = () => {
    const nextLang =
      data.language === "English (UK)"
        ? "Bahasa Melayu"
        : data.language === "Bahasa Melayu"
          ? "中文 (Simplified)"
          : "English (UK)";
    update((d) => ({ ...d, language: nextLang }));
  };

  const handleToggleTextSize = (size: "standard" | "large") => {
    update((d) => ({ ...d, textSize: size }));
  };

  const handleToggleNotification = (key: "traffic" | "official" | "community") => {
    update((d) => ({
      ...d,
      notifications: {
        ...d.notifications,
        [key]: !d.notifications[key],
      },
    }));
  };

  return (
    <Page
      title="Resident Profile"
      subtitle="Identity, accessibility & township preferences."
      back
    >
      {/* Resident Identity Card */}
      <Card style={{ padding: 18, gap: 14 }}>
        <View style={ui.between}>
          <View style={[ui.row, { gap: 12 }]}>
            <Avatar size="lg" style={s.avatar}>
              <Avatar.Fallback
                textProps={{
                  style: {
                    fontFamily: fonts.bold,
                    color: colors.red,
                    fontWeight: "700",
                    fontSize: 18,
                  },
                }}
              >
                {data.fullName
                  .split(" ")
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </Avatar.Fallback>
            </Avatar>

            <View style={{ gap: 2, flex: 1 }}>
              <View style={[ui.row, { gap: 6 }]}>
                <Typography.Heading
                  type="h2"
                  style={{ fontSize: 17, fontWeight: "700", color: colors.ink }}
                >
                  {data.fullName}
                </Typography.Heading>
              </View>
              <View style={[ui.row, { gap: 4 }]}>
                <Badge tone="green">VERIFIED HOMEOWNER</Badge>
              </View>
            </View>
          </View>
        </View>

        <Surface
          variant="secondary"
          style={{
            padding: 12,
            borderRadius: radius.card,
            backgroundColor: colors.surfaceSecondary,
            gap: 6,
          }}
        >
          <View style={[ui.row, { gap: 6 }]}>
            <MapPin size={14} color={colors.red} />
            <Typography style={{ fontSize: 13, fontFamily: fonts.semibold, fontWeight: "600", color: colors.ink }}>
              {data.precinct}
            </Typography>
          </View>
          <Description style={{ fontSize: 12, color: colors.muted, marginLeft: 20 }}>
            {data.address}
          </Description>
          <View style={[ui.row, { gap: 6, marginLeft: 2 }]}>
            <Phone size={13} color={colors.muted} />
            <Typography style={{ fontSize: 12, color: colors.muted }}>
              {data.phone}
            </Typography>
          </View>
        </Surface>

        <Button
          variant="secondary"
          onPress={() => setIsEditing(!isEditing)}
          style={s.editButton}
        >
          <Typography style={{ fontFamily: fonts.bold, fontSize: 13, color: colors.ink }}>
            {isEditing ? "Close Editing" : "Edit Profile Details"}
          </Typography>
        </Button>

        {isEditing && (
          <View style={{ gap: 10, paddingTop: 6 }}>
            <TextField>
              <Label>Full Name</Label>
              <Input
                style={ui.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Full Name"
              />
            </TextField>
            <TextField>
              <Label>Address</Label>
              <Input
                style={ui.input}
                value={address}
                onChangeText={setAddress}
                placeholder="Residential Address"
              />
            </TextField>
            <TextField>
              <Label>Contact Phone</Label>
              <Input
                style={ui.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="Phone number"
              />
            </TextField>
            <Action label="Save Profile Changes" onPress={handleSaveProfile} />
          </View>
        )}

        {savedMessage ? (
          <Typography style={{ fontSize: 12, color: colors.green, textAlign: "center", fontWeight: "600" }}>
            {savedMessage}
          </Typography>
        ) : null}
      </Card>

      {/* Residential Context Section */}
      <View style={{ gap: 8 }}>
        <Typography style={ui.label}>RESIDENTIAL CONTEXT</Typography>
        <Card style={{ padding: 16, gap: 10 }}>
          <View style={[ui.row, { gap: 10 }]}>
            <Surface
              style={{
                width: 38,
                height: 38,
                borderRadius: radius.md,
                backgroundColor: colors.surfaceSecondary,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Home size={19} color={colors.red} />
            </Surface>
            <View style={{ flex: 1, gap: 2 }}>
              <Typography style={{ fontSize: 14, fontFamily: fonts.bold, fontWeight: "700", color: colors.ink }}>
                My Neighbourhood
              </Typography>
              <Description style={ui.muted}>
                Elmina Valley 3 (Precinct 4A) • 184 terrace homes
              </Description>
            </View>
          </View>
        </Card>
      </View>

      {/* Accessibility & Display */}
      <View style={{ gap: 8 }}>
        <Typography style={ui.label}>ACCESSIBILITY & DISPLAY</Typography>
        <Card style={{ padding: 14, gap: 14 }}>
          {/* Language Preference */}
          <PressableFeedback
            onPress={handleCycleLanguage}
            style={ui.between}
          >
            <View style={[ui.row, { gap: 10 }]}>
              <Surface style={s.prefIcon}>
                <Globe size={18} color={colors.ink} />
              </Surface>
              <View>
                <Typography style={{ fontSize: 14, fontFamily: fonts.bold, fontWeight: "700", color: colors.ink }}>
                  Language Preference
                </Typography>
                <Description style={ui.muted}>EN, BM, 中文</Description>
              </View>
            </View>
            <View style={[ui.row, { gap: 6 }]}>
              <Badge tone="neutral">{data.language}</Badge>
              <ChevronRight size={16} color={colors.muted} />
            </View>
          </PressableFeedback>

          <View style={{ height: 1, backgroundColor: colors.border }} />

          {/* Text Size Readability */}
          <View style={ui.between}>
            <View style={[ui.row, { gap: 10 }]}>
              <Surface style={s.prefIcon}>
                <Type size={18} color={colors.ink} />
              </Surface>
              <View>
                <Typography style={{ fontSize: 14, fontFamily: fonts.bold, fontWeight: "700", color: colors.ink }}>
                  Text Readability Scale
                </Typography>
                <Description style={ui.muted}>AAA Senior Readability Mode</Description>
              </View>
            </View>
            <View style={[ui.row, { backgroundColor: colors.surfaceSecondary, borderRadius: radius.sm, padding: 3 }]}>
              <PressableFeedback
                onPress={() => handleToggleTextSize("standard")}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: radius.sm,
                  backgroundColor: data.textSize === "standard" ? colors.white : "transparent",
                }}
              >
                <Typography
                  style={{
                    fontSize: 11,
                    fontFamily: fonts.bold,
                    fontWeight: "700",
                    color: data.textSize === "standard" ? colors.red : colors.muted,
                  }}
                >
                  Standard
                </Typography>
              </PressableFeedback>

              <PressableFeedback
                onPress={() => handleToggleTextSize("large")}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: radius.sm,
                  backgroundColor: data.textSize === "large" ? colors.white : "transparent",
                }}
              >
                <Typography
                  style={{
                    fontSize: 11,
                    fontFamily: fonts.bold,
                    fontWeight: "700",
                    color: data.textSize === "large" ? colors.red : colors.muted,
                  }}
                >
                  Large (AAA)
                </Typography>
              </PressableFeedback>
            </View>
          </View>
        </Card>
      </View>

      {/* Push Notification Preferences */}
      <View style={{ gap: 8 }}>
        <Typography style={ui.label}>NOTIFICATION PREFERENCES</Typography>
        <Card style={{ padding: 14, gap: 12 }}>
          {/* Row 1: Traffic */}
          <View style={ui.between}>
            <View style={{ flex: 1, gap: 2, paddingRight: 8 }}>
              <Typography style={{ fontSize: 13, fontFamily: fonts.bold, fontWeight: "700", color: colors.ink }}>
                Traffic & Road Disruptions
              </Typography>
              <Description style={ui.muted}>
                Persiaran Atmosfera closures & GCE detour alerts
              </Description>
            </View>
            <Switch
              value={data.notifications.traffic}
              onValueChange={() => handleToggleNotification("traffic")}
              trackColor={{ false: colors.border, true: colors.red }}
              thumbColor={colors.white}
            />
          </View>

          <View style={{ height: 1, backgroundColor: colors.border }} />

          {/* Row 2: Official Township Alerts */}
          <View style={ui.between}>
            <View style={{ flex: 1, gap: 2, paddingRight: 8 }}>
              <Typography style={{ fontSize: 13, fontFamily: fonts.bold, fontWeight: "700", color: colors.ink }}>
                Official Township Circulars
              </Typography>
              <Description style={ui.muted}>
                Sime Darby maintenance & weather advisories
              </Description>
            </View>
            <Switch
              value={data.notifications.official}
              onValueChange={() => handleToggleNotification("official")}
              trackColor={{ false: colors.border, true: colors.red }}
              thumbColor={colors.white}
            />
          </View>

          <View style={{ height: 1, backgroundColor: colors.border }} />

          {/* Row 3: Community Updates */}
          <View style={ui.between}>
            <View style={{ flex: 1, gap: 2, paddingRight: 8 }}>
              <Typography style={{ fontSize: 13, fontFamily: fonts.bold, fontWeight: "700", color: colors.ink }}>
                Community Forum Activity
              </Typography>
              <Description style={ui.muted}>
                Replies to your discussions & topic updates
              </Description>
            </View>
            <Switch
              value={data.notifications.community}
              onValueChange={() => handleToggleNotification("community")}
              trackColor={{ false: colors.border, true: colors.red }}
              thumbColor={colors.white}
            />
          </View>
        </Card>
      </View>

      {/* Governance & Support Footer */}
      <Surface
        variant="secondary"
        style={{
          padding: 16,
          borderRadius: radius.card,
          backgroundColor: colors.surfaceSecondary,
          borderWidth: 1,
          borderColor: colors.border,
          gap: 6,
          alignItems: "center",
        }}
      >
        <ShieldCheck size={22} color={colors.red} />
        <Typography style={{ fontSize: 12, color: colors.muted, textAlign: "center", lineHeight: 18 }}>
          TownshipConnect is managed by Sime Darby Property in partnership with City of Elmina Community Council.
        </Typography>
        <Typography style={{ fontSize: 11, color: colors.muted }}>
          Version 2.4.0 (Build 302)
        </Typography>
      </Surface>
    </Page>
  );
}

const s = StyleSheet.create({
  avatar: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.redSoft,
  },
  editButton: {
    height: 38,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  prefIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
});
