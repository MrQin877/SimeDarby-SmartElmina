import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { URL } from "node:url";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import { announcements, places, type Announcement } from "../src/lib/data";
import { announcementMapPlaces, filterMapPlaces, placeAnnouncement, isLiveBusMarker } from "../src/lib/map-layers";
import { getAnnouncementImageSource } from "../src/lib/announcement-images";

test("every linked advisory has a distinct marker with category and photo metadata", () => {
  const map = announcementMapPlaces(places);
  const markers = map.filter(place => place.announcementId);
  assert.equal(markers.length, announcements.length);
  assert.equal(new Set(map.map(place => place.id)).size, map.length);
  const closure = markers.find(place => place.id === "closure-persiaran-elmina")!;
  assert.equal(placeAnnouncement(closure)?.id, "ann-01");
  assert.equal(closure.announcementCategory, "Roads");
  assert.equal(closure.announcementPriority, "high");
  assert.equal(closure.imageUrl, "road-closure.jpg");
  const park = markers.filter(place => placeAnnouncement(place)?.placeId === "park");
  assert.equal(park.length, 3);
  assert.equal(new Set(park.map(place => place.markerOffset?.join(","))).size, 3);
  assert.ok(park.every(place => place.coordinate === places.find(p => p.id === "park")!.coordinate));
  assert.ok(filterMapPlaces(map, "traffic").some(place => place.announcementId === "ann-04"));
  assert.ok(filterMapPlaces(map, "cctv").every(place => place.kind === "camera"));
});

test("coordinate-only advisories resolve while missing or invalid locations are skipped", () => {
  const base = announcements[0];
  const notice: Announcement = { ...base, id: "coordinate-notice", placeId: undefined, coordinate: [101.51, 3.18], category: "General" };
  const map = announcementMapPlaces([], [notice, { ...notice, id: "invalid", coordinate: [NaN, 3] }, { ...notice, id: "missing", coordinate: undefined }]);
  assert.equal(map.length, 1);
  assert.deepEqual(map[0].coordinate, notice.coordinate);
  assert.equal(map[0].announcementCategory, "General");
});

test("bundled announcement photos resolve across native and web without a root-relative URI", () => {
  const source = getAnnouncementImageSource("road-closure.jpg", "ann-01");
  assert.ok(source);
  if (typeof source === "object") assert.ok(!source.uri.startsWith("/"));
  assert.equal(getAnnouncementImageSource(undefined, "ann-02"), null);
  assert.equal(getAnnouncementImageSource("unsupported-local-path.jpg", "unknown"), null);
});

type Node = { type: any; props: Record<string, any> };
const nodes = (node: any): Node[] => node?.props ? [node, ...[node.props.children].flat(Infinity).flatMap(nodes)] : [];
function load(path: string, deps: Record<string, any>) {
  const jsx = (type: any, props: any) => ({ type, props });
  const source = ts.transpileModule(readFileSync(new URL(path, import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports: Record<string, any> = {};
  runInNewContext(source, { exports, require(name: string) { if (name === "react/jsx-runtime") return { jsx, jsxs: jsx }; assert.ok(name in deps, name); return deps[name]; } });
  return exports.default;
}

test("avatar pins render a 48px white frame, photo-error fallback, and category icons", () => {
  let cursor = 0;
  const state: any[] = [];
  const Marker = load("../src/components/MapMarkerBadge.tsx", {
    react: { useEffect() {}, useRef: (value: any) => ({ current: value }), useState(initial: any) { const i = cursor++; if (!(i in state)) state[i] = initial; return [state[i], (value: any) => { state[i] = value; }]; } },
    "react-native": { View: "View", Text: "Text", Image: "Image", Animated: { Value: class { interpolate() { return 0; } }, View: "AnimatedView" } },
    "lucide-react-native": new Proxy({}, { get: (_, key) => String(key) }),
    "../lib/map-layers": { markerKind: () => "hazard", placeAnnouncement, isLiveBusMarker },
    "../lib/announcement-images": { getAnnouncementImageSource }, "../lib/shuttle-data": { SHUTTLE_BLUE: "blue", liveBusLocation: { id: "live-bus-s1" } },
    "../lib/theme": { colors: { white: "white", red: "red" }, fonts: {} },
  });
  const fixtures = announcementMapPlaces(places);
  const render = (id: string) => { cursor = 0; return Marker({ place: fixtures.find(p => p.announcementId === id), selected: true }); };
  let tree = render("ann-01");
  assert.ok(nodes(tree).some(n => n.props.style?.width === 48 && n.props.style.borderWidth === 3 && n.props.style.borderColor === "white"));
  const photo = nodes(tree).find(n => n.type === "Image")!;
  assert.equal(photo.props.resizeMode, "cover");
  photo.props.onError();
  tree = render("ann-01");
  assert.ok(nodes(tree).some(n => n.type === "Construction"));
  assert.ok(nodes(tree).some(n => n.type === "AnimatedView"), "high-priority notices include a beacon ring");
  assert.ok(nodes(render("ann-02")).some(n => n.type === "Zap"));
  assert.ok(nodes(render("ann-03")).some(n => n.type === "HeartPulse"));
});

test("announcement preview actions open the full advisory and the supplied route planner", () => {
  const routes: any[] = [];
  let planned = false;
  const Preview = load("../src/components/AnnouncementMapPreview.tsx", {
    "react-native": { View: "View" }, "lucide-react-native": { Clock: "Clock", MapPin: "MapPin" },
    "expo-router": { router: { push: (route: any) => routes.push(route) } }, "./Common": { Badge: "Badge", Typography: "Typography" },
    "./Action": { default: "Action" }, "../lib/theme": { colors: {}, ui: {} },
  });
  const tree = Preview({ announcement: announcements[0], compact: false, onPlanRoute: () => { planned = true; } });
  nodes(tree).find(n => n.props.label === "View Full Advisory")!.props.onPress();
  assert.equal(routes[0].pathname, "/announcement");
  assert.equal(routes[0].params.id, "ann-01");
  nodes(tree).find(n => n.props.label === "Plan Detour / Route")!.props.onPress();
  assert.equal(planned, true);
});

test("All progressively reveals places while dedicated layers keep all their entries", () => {
  const map = announcementMapPlaces(places);
  const wide = filterMapPlaces(map, "all", 13);
  assert.ok(wide.every(place => place.announcementId || place.kind === "hazard"));
  assert.ok(!wide.some(place => place.kind === "camera" || place.kind === "transport"));
  assert.ok(!wide.some(place => place.id === "park"));
  assert.ok(filterMapPlaces(map, "all", 15).some(place => place.id === "park"));
  assert.ok(!filterMapPlaces(map, "all", 15).some(place => place.kind === "camera"));
  assert.ok(filterMapPlaces(map, "all", 16).some(place => place.kind === "camera"));
  for (const layer of ["cctv", "shuttle", "traffic"] as const) assert.deepEqual(filterMapPlaces(map, layer, 9), filterMapPlaces(map, layer, 18));
});
