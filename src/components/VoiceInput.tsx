import { useEffect, useState } from "react";
import { View } from "react-native";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { Mic, Square } from "lucide-react-native";
import { FieldError, IconButton } from "./Common";
import { colors, ui } from "../lib/theme";
export default function VoiceInput({
  onResult,
}: {
  onResult: (text: string) => void;
}) {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState("");
  useSpeechRecognitionEvent("start", () => setListening(true));
  useSpeechRecognitionEvent("end", () => setListening(false));
  useSpeechRecognitionEvent("result", (event) => {
    if (event.results[0]) onResult(event.results[0].transcript);
  });
  useSpeechRecognitionEvent("error", () => {
    setError("Voice input unavailable. You can type your destination.");
    setListening(false);
  });
  useEffect(
    () => () => {
      ExpoSpeechRecognitionModule.abort();
    },
    [],
  );
  async function start() {
    if (listening) {
      ExpoSpeechRecognitionModule.stop();
      return;
    }
    try {
      const p = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!p.granted) {
        setError("Microphone permission is needed for voice search.");
        return;
      }
      setError("");
      ExpoSpeechRecognitionModule.start({
        lang: "en-MY",
        interimResults: true,
        continuous: false,
      });
    } catch {
      setError("Voice input is not available on this device.");
    }
  }
  return (
    <View>
      <IconButton
        icon={listening ? Square : Mic}
        label={listening ? "Stop voice input" : "Start voice input"}
        color={listening ? colors.red : colors.ink}
        onPress={() => {
          void start();
        }}
      />
      {error ? (
        <FieldError
          isInvalid
          style={{ maxWidth: 180 }}
          textProps={{ style: ui.muted }}
        >
          {error}
        </FieldError>
      ) : null}
    </View>
  );
}
