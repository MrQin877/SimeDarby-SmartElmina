import { useCallback, useRef } from "react";
import { View } from "react-native";
import { Toast, useToast } from "heroui-native/toast";
import { CheckCircle2, CircleAlert, Info } from "lucide-react-native";
import { colors, fonts } from "../lib/theme";

type Tone = "info" | "success" | "warning" | "error";
export function useAppToast() {
  const { toast } = useToast();
  const currentToast = useRef(toast);
  currentToast.current = toast;
  return useCallback((message: string, tone: Tone = "info", duration: number | "persistent" = 4500) => {
    if (!message.trim()) return;
    const Icon = tone === "success" ? CheckCircle2 : tone === "info" ? Info : CircleAlert;
    const color = tone === "success" ? colors.green : tone === "warning" ? colors.amber : tone === "error" ? colors.red : colors.ink;
    currentToast.current.show({
      duration,
      component: (props) => <Toast {...props} placement="top" style={{ backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}><Icon size={20} color={color} /><Toast.Description style={{ flex: 1, fontFamily: fonts.medium, fontSize: 13, lineHeight: 19, color: colors.ink }}>{message}</Toast.Description><Toast.Close iconProps={{ size: 16, color: colors.muted }} /></View>
      </Toast>,
    });
  }, []);
}
