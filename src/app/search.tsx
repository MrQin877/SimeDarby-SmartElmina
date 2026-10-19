import { useState } from "react";
import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { MapPin, ArrowUpRight } from "lucide-react-native";
import { searchPlaces } from "../lib/data";
import {
  DemoNote,
  Description,
  Page,
  PressableFeedback,
  SearchField,
  Separator,
  Surface,
  Typography,
} from "../components/Common";
import VoiceInput from "../components/VoiceInput";
import { colors, radius, ui } from "../lib/theme";
export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const { voice } = useLocalSearchParams<{ voice?: string }>();
  const results = searchPlaces(query);
  return (
    <Page title="Where to?" subtitle="Find your next stop in Elmina." back>
      <View style={ui.row}>
        <SearchField
          value={query}
          onChange={setQuery}
          style={{ flex: 1 }}
        >
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input
              autoFocus={voice !== "1"}
              accessibilityLabel="Search destination"
              placeholder="Search destination"
              returnKeyType="search"
            />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>
        <VoiceInput onResult={setQuery} />
      </View>
      {voice === "1" && (
        <Description style={ui.muted}>
          Tap the microphone to begin speaking.
        </Description>
      )}
      <Typography style={ui.label}>
        {query ? "SEARCH RESULTS" : "NEARBY PLACES"}
      </Typography>
      {results.map((p) => (
        <View key={p.id}>
          <PressableFeedback
            onPress={() =>
              router.replace({ pathname: "/explore", params: { place: p.id } })
            }
            style={[ui.row, { paddingVertical: 15 }]}
          >
            <Surface
              style={{
                width: 42,
                height: 42,
                backgroundColor: colors.greenSoft,
                borderRadius: radius.md,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MapPin size={20} color={colors.green} />
            </Surface>
            <View style={{ flex: 1 }}>
              <Typography
                style={{ fontSize: 15, fontWeight: "600", color: colors.ink }}
              >
                {p.name}
              </Typography>
              <Description style={ui.muted}>{p.subtitle}</Description>
            </View>
            <ArrowUpRight size={18} color={colors.muted} />
          </PressableFeedback>
          <Separator />
        </View>
      ))}
      {!results.length && (
        <Typography style={ui.body}>
          No places found. Try “park”, “mall” or “entrance”.
        </Typography>
      )}
      <DemoNote text="Search covers the demo township places. Voice recognition depends on device support." />
    </Page>
  );
}
