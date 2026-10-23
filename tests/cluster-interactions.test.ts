import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { URL } from "node:url";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import { announcementMapPlaces, isAnnouncementMarker } from "../src/lib/map-layers";
import { clusterAnnouncementMarkers, clusterLabel, clusterOpensList } from "../src/lib/announcement-clusters";
import { runCameraCommand } from "../src/lib/native-camera";
import { CENTER, places } from "../src/lib/data";

type Node = { type: any; props: Record<string, any> };
const nodes = (node: any): Node[] => node?.props ? [node, ...[node.props.children].flat(Infinity).flatMap(nodes)] : [];

test("native map zoom events group notices, cluster taps zoom in, and expanded pins retain their selection handler", async () => {
  let stateCursor = 0, refCursor = 0;
  const state: any[] = [], refs: any[] = [], commands: any[] = [], selections: string[] = [], lists: any[] = [];
  const jsx = (type: any, props: any) => ({ type, props });
  const modules: Record<string, any> = {
    react: { useEffect() {}, useMemo: (fn: any) => fn(), useState(initial: any) { const i = stateCursor++; if (!(i in state)) state[i] = initial; return [state[i], (value: any) => { state[i] = value; }]; }, useRef(initial: any) { const i = refCursor++; if (!refs[i]) refs[i] = { current: initial }; return refs[i]; } },
    "react/jsx-runtime": { jsx, jsxs: jsx }, "react-native": { Pressable: "Pressable", Text: "Text", View: "View", StyleSheet: { absoluteFill: {} } },
    "@maplibre/maplibre-react-native": { Map: "Map", Camera: "Camera", Marker: "Marker", GeoJSONSource: "GeoJSONSource", Layer: "Layer" },
    "../lib/map-layers": { isAnnouncementMarker }, "../lib/announcement-clusters": { clusterAnnouncementMarkers, clusterLabel, clusterOpensList },
    "./AnnouncementClusterBadge": { default: "ClusterBadge" }, "./MapMarkerBadge": { default: "MapMarkerBadge" },
    "../lib/data": { CENTER }, "../lib/map": {}, "../lib/native-camera": { runCameraCommand },
    "../lib/shuttle-data": { liveBusLocation: { id: "live-bus-s1" } }, "../lib/theme": { colors: {} },
  };
  const source = ts.transpileModule(readFileSync(new URL("../src/components/TownshipMap.tsx", import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports: Record<string, any> = {};
  runInNewContext(source, { exports, require(name: string) { assert.ok(name in modules, name); return modules[name]; } });
  const markers = announcementMapPlaces(places).filter(p => p.announcementId);
  const render = () => { stateCursor = 0; refCursor = 0; return exports.default({ markers, onSelect: (p: any) => selections.push(p.id), onClusterSelect: (places: any[]) => lists.push(places) }); };
  let tree = render();
  const badge = nodes(tree).find(n => n.type === "ClusterBadge")!;
  assert.equal(badge.props.count, 3);
  nodes(tree).find(n => n.type === "Camera")!.props.ref.current = { easeTo: (options: any) => commands.push(options) };
  nodes(tree).find(n => n.type === "Pressable" && n.props.accessibilityLabel === "3 map items. View colocated facilities")!.props.onPress({ stopPropagation() {} });
  await Promise.resolve();
  assert.equal(lists[0].length, 3);
  assert.equal(commands.length, 0, "an indivisible location opens the list instead of endlessly zooming");
  nodes(tree).find(n => n.type === "Map")!.props.onRegionDidChange({ nativeEvent: { zoom: 9 } });
  tree = render();
  nodes(tree).find(n => n.type === "Pressable" && n.props.accessibilityLabel === "5 map items. Zoom in to view")!.props.onPress({ stopPropagation() {} });
  await Promise.resolve();
  assert.ok(commands[0].zoom > 9);
  assert.ok(commands[0].zoom <= 16.5);
  nodes(tree).find(n => n.type === "Map")!.props.onRegionDidChange({ nativeEvent: { zoom: 16.49999 } });
  tree = render();
  assert.equal(nodes(tree).filter(n => n.type === "ClusterBadge").length, 0);
  assert.equal(nodes(tree).filter(n => n.type === "MapMarkerBadge").length, 5);
  nodes(tree).find(n => n.type === "Pressable" && n.props.accessibilityLabel === markers[0].name)!.props.onPress({ stopPropagation() {} });
  assert.deepEqual(selections, [markers[0].id]);
  nodes(tree).find(n => n.type === "Map")!.props.onRegionDidChange({ nativeEvent: { zoom: 9 } });
  tree = render();
  assert.equal(nodes(tree).find(n => n.type === "ClusterBadge")!.props.count, 5);
  assert.equal(nodes(tree).filter(n => n.type === "MapMarkerBadge").length, 0);
});
