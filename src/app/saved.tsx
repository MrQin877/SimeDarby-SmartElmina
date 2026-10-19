import { router } from "expo-router";
import {
  Card,
  HeroCard,
  Page,
  PressableFeedback,
} from "../components/Common";
import { useStore } from "../state/store";
import { places } from "../lib/data";
import { ui } from "../lib/theme";
export default function Saved() {
  const { data } = useStore();
  const saved = places.filter((p) => data.saved.includes(p.id));
  return (
    <Page title="Saved places" subtitle="Your favourites, one tap away." back>
      {saved.map((p) => (
        <PressableFeedback
          key={p.id}
          onPress={() =>
            router.push({ pathname: "/explore", params: { place: p.id } })
          }
        >
          <Card>
            <HeroCard.Body>
              <HeroCard.Title style={ui.heading}>{p.name}</HeroCard.Title>
              <HeroCard.Description style={ui.muted}>
                {p.subtitle}
              </HeroCard.Description>
            </HeroCard.Body>
          </Card>
        </PressableFeedback>
      ))}
      {!saved.length && (
        <Card>
          <HeroCard.Body>
            <HeroCard.Title style={ui.body}>
              Your favourite places belong here.
            </HeroCard.Title>
            <HeroCard.Description style={ui.muted}>
              Select a place on Explore, then tap the bookmark to save it.
            </HeroCard.Description>
          </HeroCard.Body>
        </Card>
      )}
    </Page>
  );
}
