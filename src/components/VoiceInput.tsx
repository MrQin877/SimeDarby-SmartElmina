import { useEffect, useRef, useState } from "react";
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "expo-speech-recognition";
import { Mic, Square } from "lucide-react-native";
import { IconButton } from "./Common";
import { useAppToast } from "../hooks/useAppToast";
import { colors } from "../lib/theme";
export default function VoiceInput({ onResult }: { onResult: (text: string) => void }) {
  const [listening, setListening] = useState(false);
  const notify = useAppToast();
  const lastError = useRef(0);
  const showError = (message: string) => {
    // Some platforms emit an error event as well as rejecting start().
    if (Date.now() - lastError.current < 1500) return;
    lastError.current = Date.now();
    notify(message, "warning");
  };
  useSpeechRecognitionEvent("start", () => setListening(true));
  useSpeechRecognitionEvent("end", () => setListening(false));
  useSpeechRecognitionEvent("result", (event) => { if (event.results[0]) onResult(event.results[0].transcript); });
  useSpeechRecognitionEvent("error", (event) => { if (event.error !== "aborted") showError("Voice input unavailable. You can type your destination."); setListening(false); });
  useEffect(() => () => { ExpoSpeechRecognitionModule.abort(); }, []);
  async function start() {
    try {
      if (listening) { ExpoSpeechRecognitionModule.stop(); return; }
      const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!permission.granted) { showError("Microphone permission is needed for voice search."); return; }
      ExpoSpeechRecognitionModule.start({ lang: "en-MY", interimResults: true, continuous: false });
    } catch { setListening(false); showError("Voice input is not available on this device. You can type your destination."); }
  }
  return <IconButton icon={listening ? Square : Mic} label={listening ? "Stop voice input" : "Start voice input"} color={listening ? colors.red : colors.ink} onPress={() => { void start(); }} style={{ borderWidth: 0, backgroundColor: "transparent" }} />;
}
