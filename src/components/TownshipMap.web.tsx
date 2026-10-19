import { createElement, useEffect, useRef, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Video, BusFront, TriangleAlert, MapPin } from "lucide-react-native";
import { Map, Marker, setWorkerUrl, type StyleSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { CENTER } from "../lib/data";
import { lineFeature, mapStyle, trafficLines, type MapProps } from "../lib/map";
import { colors } from "../lib/theme";
import { Pressable, Text, View } from "react-native";
export default function TownshipMap(props: MapProps) {
  const host = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);
  const current = useRef(props);
  current.current = props;
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!host.current) return;
    let m: Map;
    try {
      setWorkerUrl(`${window.location.origin}/maplibre-gl-worker.mjs`);
      m = new Map({
        container: host.current,
        style: mapStyle as string | StyleSpecification,
        center: props.center || CENTER,
        zoom: 14.4,
        attributionControl: { compact: true },
        canvasContextAttributes: { preserveDrawingBuffer: true },
      });
    } catch {
      setFailed(true);
      return;
    }
    map.current = m;
    m.on("load", () => {
      setLoaded(true);
      setFailed(false);
    });
    m.on("error", () => {
      if (!m.isStyleLoaded()) setFailed(true);
    });
    m.on("click", (e) =>
      current.current.onMapPress?.([e.lngLat.lng, e.lngLat.lat]),
    );
    const observer = new ResizeObserver(() => m.resize());
    observer.observe(host.current);
    return () => {
      observer.disconnect();
      m.remove();
      map.current = null;
    };
    // The map is initialised once. Reactive content is managed below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retry]);
  useEffect(() => {
    const m = map.current;
    if (!loaded || !m) return;
    const roots: Root[] = [];
    const markers = props.markers.map((p) => {
      const b = document.createElement("button");
      b.setAttribute("aria-label", p.name);
      const Icon = p.kind === "camera" ? Video : p.kind === "transport" ? BusFront : p.kind === "hazard" ? TriangleAlert : MapPin;
      const iconRoot = createRoot(b); roots.push(iconRoot);
      iconRoot.render(<Icon size={21} color={props.selectedId === p.id ? "#fff" : colors.ink} />);
      b.style.cssText = `display:flex;align-items:center;justify-content:center;height:42px;width:42px;border-radius:17px;border:3px solid white;background:${props.selectedId === p.id ? colors.red : "#fff"};color:${props.selectedId === p.id ? "#fff" : colors.ink};font-size:23px;box-shadow:0 4px 12px rgba(9,9,11,0.14);cursor:pointer`;
      b.onclick = (e) => {
        e.stopPropagation();
        current.current.onSelect?.(p);
      };
      return new Marker({ element: b }).setLngLat(p.coordinate).addTo(m);
    });
    if (props.userCoordinate)
      markers.push(
        new Marker({ color: colors.blue })
          .setLngLat(props.userCoordinate)
          .addTo(m),
      );
    return () => {
      markers.forEach((marker) => marker.remove());
      queueMicrotask(() => roots.forEach(root => root.unmount()));
    };
  }, [loaded, props.markers, props.selectedId, props.userCoordinate]);
  useEffect(() => {
    const m = map.current;
    if (!loaded || !m) return;
    if (m.getLayer("traffic-line")) m.removeLayer("traffic-line");
    if (m.getSource("traffic")) m.removeSource("traffic");
    if (props.traffic) {
      m.addSource("traffic", { type: "geojson", data: trafficLines });
      m.addLayer({
        id: "traffic-line",
        type: "line",
        source: "traffic",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": ["get", "color"], "line-width": 5 },
      });
    }
  }, [loaded, props.traffic]);
  useEffect(() => {
    const m = map.current;
    if (!loaded || !m) return;
    if (m.getLayer("route-line")) m.removeLayer("route-line");
    if (m.getSource("route")) m.removeSource("route");
    if (props.route) {
      m.addSource("route", { type: "geojson", data: lineFeature(props.route) });
      m.addLayer({
        id: "route-line",
        source: "route",
        type: "line",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": "#377EDB", "line-width": 6 },
      });
    }
  }, [loaded, props.route]);
  useEffect(() => {
    if (loaded)
      map.current?.easeTo({
        center: props.center || CENTER,
        bearing: props.bearing || 0,
        zoom: props.route ? 15 : 14.4,
        duration: 600,
      });
  }, [loaded, props.center, props.bearing, props.cameraKey, props.route]);
  return (
    <View style={{ position: "absolute", inset: 0 }}>
      {createElement("div", {
        ref: host,
        style: { position: "absolute", inset: 0 },
        "aria-label": "Interactive township map",
      })}
      {failed && (
        <Pressable
          onPress={() => {
            setLoaded(false);
            setFailed(false);
            setRetry((n) => n + 1);
          }}
          style={{
            position: "absolute",
            top: "45%",
            alignSelf: "center",
            padding: 18,
            borderRadius: 16,
            backgroundColor: "#fff",
          }}
        >
          <Text>Map unavailable · tap to retry</Text>
        </Pressable>
      )}
    </View>
  );
}
