import { useState } from "react";
import { Image, Platform, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { router, useLocalSearchParams } from "expo-router";
import { Camera, Sparkles } from "lucide-react-native";
import {
  Button,
  CloseButton,
  DemoNote,
  Description,
  FilterChip,
  Input,
  Label,
  Page,
  PressableFeedback,
  Surface,
  TextArea,
  TextField,
  Typography,
} from "../components/Common";
import Action from "../components/Action";
import { reportError } from "../lib/model";
import { useAppToast } from "../hooks/useAppToast";
import { useStore } from "../state/store";
import { colors, fonts, radius, ui } from "../lib/theme";
export default function ReportScreen() {
  const params = useLocalSearchParams<{ location?: string; scenario?: string; prefill?: string }>();
  const isScenario3 = params.scenario === "3" || params.prefill === "scenario3";
  const { update } = useStore();
  const [category, setCategory] = useState("Road & traffic");
  const [location, setLocation] = useState(
    params.location || (isScenario3 ? "Near Elmina Central Park pedestrian crossing" : "")
  );
  const [description, setDescription] = useState(
    isScenario3
      ? "I noticed a pothole near the pedestrian crossing while walking around Elmina Central Park this evening. The damaged road surface may pose a hazard to cyclists, pedestrians and vehicles passing through the area. I have attached a photo and marked the approximate location on the map for reference."
      : ""
  );
  const [photos, setPhotos] = useState<string[]>(
    isScenario3
      ? [Platform.OS === "web" ? "/pothole-central-park.jpg" : "https://cdn.jsdelivr.net/gh/StartBootstrap/startbootstrap-business-casual@master/dist/assets/img/products-03.jpg"]
      : []
  );
  const [error, setErrorState] = useState("");
  const notify = useAppToast();
  const setError = (message: string) => { setErrorState(message); if (message) notify(message, "error"); };
  const [busy, setBusy] = useState(false);

  const fillScenario3 = () => {
    setCategory("Road & traffic");
    setLocation("Near Elmina Central Park pedestrian crossing");
    setDescription(
      "I noticed a pothole near the pedestrian crossing while walking around Elmina Central Park this evening. The damaged road surface may pose a hazard to cyclists, pedestrians and vehicles passing through the area. I have attached a photo and marked the approximate location on the map for reference."
    );
    setPhotos([Platform.OS === "web" ? "/pothole-central-park.jpg" : "https://cdn.jsdelivr.net/gh/StartBootstrap/startbootstrap-business-casual@master/dist/assets/img/products-03.jpg"]);
    notify("Scenario 3 details filled (Daniel: Central Park Pothole)", "info");
  };
  async function pick() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: true,
        selectionLimit: 3 - photos.length,
        quality: 0.6,
        base64: Platform.OS === "web",
      });
      if (!result.canceled) {
        const chosen = result.assets.slice(0, 3 - photos.length);
        if (chosen.some((a) => (a.fileSize || 0) > 5 * 1024 * 1024)) {
          setError("Please select photos smaller than 5 MB.");
          return;
        }
        setPhotos((previous) =>
          [
            ...previous,
            ...chosen.map((a) =>
              Platform.OS === "web" && a.base64
                ? `data:${a.mimeType || "image/jpeg"};base64,${a.base64}`
                : a.uri,
            ),
          ].slice(0, 3),
        );
        setError("");
      }
    } catch {
      setError("Could not open the photo library. Please try again.");
    }
  }
  async function submit() {
    const validation = reportError({ location, description, photos });
    if (validation) {
      setError(validation);
      return;
    }
    if (busy) return;
    setBusy(true);
    try {
      const id = `TC-${Date.now()}`;
      let persisted = photos;
      if (Platform.OS !== "web" && photos.length) {
        const folder = `${FileSystem.documentDirectory}reports/${id}/`;
        await FileSystem.makeDirectoryAsync(folder, { intermediates: true });
        persisted = await Promise.all(
          photos.map(async (uri, i) => {
            const to = `${folder}${i}.jpg`;
            if (uri.startsWith("file://")) {
              await FileSystem.copyAsync({ from: uri, to });
              return to;
            }
            return uri;
          }),
        );
      }
      update((d) => ({
        ...d,
        reports: [
          {
            id,
            category,
            location: location.trim(),
            description: description.trim(),
            photos: persisted,
            createdAt: new Date().toISOString(),
            status: "Submitted",
          },
          ...d.reports,
        ],
      }));
      notify("Report saved. You can track its status in My Reports.", "success");
      router.navigate("/reports");
    } catch {
      setError("Your photos could not be saved. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <Page
      title="Report an issue"
      subtitle="A small report can make a big difference."
      back
    >
      <Surface style={{ padding: 12, borderRadius: radius.card, backgroundColor: colors.redSoft, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <View style={{ flex: 1, gap: 2 }}>
          <Typography style={{ fontFamily: fonts.bold, fontSize: 13, color: colors.red }}>Scenario 3 Demo</Typography>
          <Description style={ui.muted}>Daniel (Central Park Pothole hazard report)</Description>
        </View>
        <Button size="sm" onPress={fillScenario3} style={{ backgroundColor: colors.red, borderRadius: 20 }}>
          <Sparkles size={14} color={colors.white} />
          <Button.Label style={{ color: colors.white, fontSize: 11 }}>Quick-Fill</Button.Label>
        </Button>
      </Surface>
      <Typography style={ui.label}>CATEGORY</Typography>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {[
          "Road & traffic",
          "Streetlights",
          "Cleanliness",
          "Facilities",
          "Other",
        ].map((c) => (
          <FilterChip
            key={c}
            label={c}
            selected={c === category}
            onPress={() => setCategory(c)}
          />
        ))}
      </View>
      <TextField isInvalid={Boolean(error && !location.trim())}>
        <Label>Location</Label>
        <Input
          accessibilityLabel="Issue location"
          value={location}
          onChangeText={setLocation}
          style={ui.input}
          placeholder="Road, building or nearby landmark"
          maxLength={150}
        />
      </TextField>
      <TextField
        isInvalid={Boolean(error && description.trim().length < 10)}
      >
        <Label>What happened?</Label>
        <TextArea
          accessibilityLabel="Issue description"
          maxLength={500}
          value={description}
          onChangeText={setDescription}
          style={[ui.input, { height: 125, textAlignVertical: "top" }]}
          placeholder="Tell us a little about the issue…"
        />
        <Description style={[ui.muted, { textAlign: "right" }]}>
          {description.length}/500
        </Description>
      </TextField>
      <Label>Photos ({photos.length}/3)</Label>
      <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
        {photos.map((uri, i) => (
          <View key={uri + i}>
            <Image
              source={{ uri }}
              style={{ width: 88, height: 88, borderRadius: radius.card }}
            />
            <View style={{ position: "absolute", right: 0, top: 0 }}>
              <CloseButton
                accessibilityLabel={`Remove photo ${i + 1}`}
                onPress={() => setPhotos((p) => p.filter((_, j) => i !== j))}
              />
            </View>
          </View>
        ))}
      </View>
      {photos.length < 3 && (
        <PressableFeedback
          onPress={() => {
            void pick();
          }}
        >
          <Surface
            style={{
              alignItems: "center",
              gap: 10,
              padding: 24,
              borderWidth: 1.5,
              borderStyle: "dashed",
              borderColor: colors.border,
              borderRadius: radius.card,
              backgroundColor: colors.surfaceSecondary,
            }}
          >
            <Camera size={26} color={colors.red} />
            <Description style={ui.muted}>
              Add up to 3 photos · 5 MB each
            </Description>
          </Surface>
        </PressableFeedback>
      )}
      <DemoNote text="Demo mode · reports and photos stay on this device." />
      <Action
        label={busy ? "Saving report…" : "Submit report"}
        disabled={busy}
        onPress={() => {
          void submit();
        }}
      />
    </Page>
  );
}
