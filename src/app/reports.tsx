import { Image, View } from "react-native";
import { router } from "expo-router";
import {
  Badge,
  Card,
  DemoNote,
  Description,
  HeroCard,
  Page,
  Typography,
} from "../components/Common";
import Action from "../components/Action";
import { useStore } from "../state/store";
import { ui } from "../lib/theme";
export default function Reports() {
  const { data } = useStore();
  return (
    <Page title="My reports" subtitle="Every issue, followed through." back>
      <Action label="Report an issue" onPress={() => router.push("/report")} />
      {data.reports.length === 0 && (
        <Card>
          <HeroCard.Body>
            <HeroCard.Title style={ui.heading}>
              Nothing reported yet
            </HeroCard.Title>
            <HeroCard.Description style={ui.muted}>
              Your issues, attached photos and progress will appear here.
            </HeroCard.Description>
          </HeroCard.Body>
        </Card>
      )}
      {data.reports.map((r) => (
        <Card key={r.id}>
          <HeroCard.Header>
            <Badge tone="amber">{r.status}</Badge>
          </HeroCard.Header>
          <HeroCard.Body>
            <HeroCard.Title style={ui.heading}>{r.category}</HeroCard.Title>
            <Typography style={ui.body}>{r.description}</Typography>
            <HeroCard.Description style={ui.muted}>
              {r.location}
            </HeroCard.Description>
            {r.photos.length > 0 && (
              <View style={{ flexDirection: "row", gap: 8 }}>
                {r.photos.map((uri) => (
                  <Image
                    key={uri}
                    source={{ uri }}
                    style={{ width: 72, height: 72, borderRadius: 12 }}
                  />
                ))}
              </View>
            )}
          </HeroCard.Body>
          <HeroCard.Footer style={{ gap: 6 }}>
            <Description style={ui.muted}>
              {new Date(r.createdAt).toLocaleString()}
            </Description>
            <DemoNote text="Saved locally · awaiting backend connection" />
          </HeroCard.Footer>
        </Card>
      ))}
    </Page>
  );
}
