import { useState } from "react";
import {
  Badge,
  Card,
  DemoNote,
  HeroCard,
  Input,
  Label,
  Page,
  TextField,
} from "../components/Common";
import Action from "../components/Action";
import { useStore } from "../state/store";
import { ui } from "../lib/theme";
export default function Profile() {
  const { data, update } = useStore();
  const [name, setName] = useState(data.name);
  const [saved, setSaved] = useState(false);
  return (
    <Page
      title="Your profile"
      subtitle="A little more about your neighbourhood."
      back
    >
      <Card>
        <HeroCard.Header>
          <Badge tone="green">DEMO RESIDENT</Badge>
        </HeroCard.Header>
        <HeroCard.Body>
          <HeroCard.Title style={ui.heading}>City of Elmina</HeroCard.Title>
          <HeroCard.Description style={ui.muted}>
            TownshipConnect resident preview
          </HeroCard.Description>
        </HeroCard.Body>
      </Card>
      <TextField isRequired>
        <Label>Display name</Label>
        <Input
          accessibilityLabel="Display name"
          style={ui.input}
          value={name}
          maxLength={40}
          onChangeText={(v) => {
            setName(v);
            setSaved(false);
          }}
        />
      </TextField>
      <Action
        label={saved ? "Saved on this device" : "Save profile"}
        disabled={!name.trim()}
        onPress={() => {
          update((d) => ({ ...d, name: name.trim() }));
          setSaved(true);
        }}
      />
      <DemoNote text="Local demo profile. No account or verified residency is implied." />
    </Page>
  );
}
