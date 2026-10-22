import { useState } from "react";
import { Modal, Share, StyleSheet, View } from "react-native";
import {
  Share2,
  ShieldCheck,
} from "lucide-react-native";
import {
  Badge,
  Button,
  CloseButton,
  Description,
  Input,
  Label,
  PressableFeedback,
  Surface,
  TextField,
  Typography,
} from "./Common";
import Action from "./Action";
import { colors, fonts, radius, ui } from "../lib/theme";
import { useStore } from "../state/store";
import type { VisitorPass } from "../lib/model";

export function VisitorPassModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { data, update } = useStore();
  const [visitorName, setVisitorName] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [duration, setDuration] = useState(8);
  const [generatedPass, setGeneratedPass] = useState<VisitorPass | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = () => {
    if (!visitorName.trim()) return;

    const newPass: VisitorPass = {
      id: `VP-${Math.floor(1000 + Math.random() * 9000)}`,
      visitorName: visitorName.trim(),
      vehiclePlate: vehiclePlate.trim().toUpperCase() || "WALK-IN",
      entryDate: "Today, " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      validHours: duration,
      passCode: `ELM-${Math.floor(1000 + Math.random() * 9000)}-G3`,
      createdAt: "Just now",
      status: "active",
    };

    update((d) => ({
      ...d,
      visitorPasses: [newPass, ...d.visitorPasses],
    }));

    setGeneratedPass(newPass);
  };

  const handleShareWhatsApp = async () => {
    if (!generatedPass) return;
    const msg = `*TownshipConnect Gate Access Pass*\n\nVisitor: ${generatedPass.visitorName}\nPlate: ${generatedPass.vehiclePlate}\nPass Code: ${generatedPass.passCode}\nValidity: ${generatedPass.validHours} Hours\nPrecinct: Elmina Valley 3\nHost: ${data.fullName}\n\nPresent this code or QR pass at Gate 3 boom barrier.`;

    try {
      await Share.share({ message: msg });
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  const handleReset = () => {
    setGeneratedPass(null);
    setVisitorName("");
    setVehiclePlate("");
    onClose();
  };

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={handleReset}>
      <View style={s.overlay}>
        <Surface style={[s.modalCard, ui.shadow]}>
          <View style={ui.between}>
            <View style={[ui.row, { gap: 8 }]}>
              <Surface
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: radius.md,
                  backgroundColor: colors.redSoft,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ShieldCheck size={18} color={colors.red} />
              </Surface>
              <View>
                <Typography style={{ fontSize: 11, fontFamily: fonts.bold, fontWeight: "700", color: colors.red }}>
                  CITY OF ELMINA SECURITY
                </Typography>
                <Typography.Heading type="h3" style={{ fontSize: 16, fontWeight: "700", color: colors.ink }}>
                  Visitor Quick-Pass
                </Typography.Heading>
              </View>
            </View>

            <CloseButton accessibilityLabel="Close visitor pass" onPress={handleReset} />
          </View>

          {!generatedPass ? (
            <View style={{ gap: 12 }}>
              <Description style={ui.muted}>
                Issue a fast digital entry token for the guard house and automated boom gate barrier.
              </Description>

              <TextField isRequired>
                <Label>Visitor Full Name</Label>
                <Input
                  style={ui.input}
                  placeholder="e.g. Nurul Aisyah"
                  value={visitorName}
                  onChangeText={setVisitorName}
                />
              </TextField>

              <TextField>
                <Label>Vehicle Plate Number</Label>
                <Input
                  style={ui.input}
                  placeholder="e.g. WXY 8192 or Walk-in"
                  value={vehiclePlate}
                  onChangeText={setVehiclePlate}
                  autoCapitalize="characters"
                />
              </TextField>

              <View style={{ gap: 6 }}>
                <Label>Validity Window</Label>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {[4, 8, 24].map((hours) => (
                    <PressableFeedback
                      key={hours}
                      onPress={() => setDuration(hours)}
                      style={{
                        flex: 1,
                        paddingVertical: 10,
                        borderRadius: radius.sm,
                        borderWidth: 1,
                        borderColor: duration === hours ? colors.red : colors.border,
                        backgroundColor: duration === hours ? colors.redSoft : colors.white,
                        alignItems: "center",
                      }}
                    >
                      <Typography
                        style={{
                          fontSize: 12,
                          fontFamily: fonts.bold,
                          fontWeight: "700",
                          color: duration === hours ? colors.red : colors.ink,
                        }}
                      >
                        {hours} Hours
                      </Typography>
                    </PressableFeedback>
                  ))}
                </View>
              </View>

              <Action
                label="Generate Digital Access Pass"
                disabled={!visitorName.trim()}
                onPress={handleGenerate}
              />
            </View>
          ) : (
            <View style={{ gap: 14 }}>
              {/* Generated Pass Preview Box */}
              <Surface
                style={{
                  padding: 16,
                  borderRadius: radius.card,
                  backgroundColor: colors.surfaceSecondary,
                  borderWidth: 1,
                  borderColor: colors.border,
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <Badge tone="green">AUTHORIZED PASS ACTIVE</Badge>

                <View style={{ alignItems: "center", gap: 2 }}>
                  <Typography style={{ fontSize: 22, fontFamily: fonts.bold, fontWeight: "700", color: colors.red, letterSpacing: 1.5 }}>
                    {generatedPass.passCode}
                  </Typography>
                  <Description style={ui.muted}>
                    Gate 3 Boom Barrier Access
                  </Description>
                </View>

                <View style={{ width: "100%", height: 1, backgroundColor: colors.border }} />

                <View style={{ width: "100%", gap: 4 }}>
                  <View style={ui.between}>
                    <Description style={ui.muted}>Visitor</Description>
                    <Typography style={{ fontSize: 13, fontFamily: fonts.semibold, color: colors.ink }}>
                      {generatedPass.visitorName}
                    </Typography>
                  </View>
                  <View style={ui.between}>
                    <Description style={ui.muted}>Vehicle</Description>
                    <Typography style={{ fontSize: 13, fontFamily: fonts.semibold, color: colors.ink }}>
                      {generatedPass.vehiclePlate}
                    </Typography>
                  </View>
                  <View style={ui.between}>
                    <Description style={ui.muted}>Valid For</Description>
                    <Typography style={{ fontSize: 13, fontFamily: fonts.semibold, color: colors.ink }}>
                      {generatedPass.validHours} Hours ({generatedPass.entryDate})
                    </Typography>
                  </View>
                </View>
              </Surface>

              <Button
                variant="primary"
                onPress={handleShareWhatsApp}
                style={{
                  height: 46,
                  borderRadius: radius.field,
                  backgroundColor: colors.red,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <Share2 size={16} color={colors.white} />
                <Typography style={{ fontFamily: fonts.bold, fontSize: 14, color: colors.white }}>
                  {copied ? "Pass Shared!" : "Share Pass via WhatsApp"}
                </Typography>
              </Button>

              <Button
                variant="secondary"
                onPress={handleReset}
                style={{
                  height: 42,
                  borderRadius: radius.field,
                  backgroundColor: colors.surfaceSecondary,
                  borderWidth: 1,
                  borderColor: colors.border,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography style={{ fontFamily: fonts.bold, fontSize: 13, color: colors.ink }}>
                  Done
                </Typography>
              </Button>
            </View>
          )}
        </Surface>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(9, 9, 11, 0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 380,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    padding: 20,
    gap: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
