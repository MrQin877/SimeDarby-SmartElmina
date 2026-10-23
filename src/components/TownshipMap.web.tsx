import { createElement, useEffect, useRef, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { isAnnouncementMarker } from "../lib/map-layers";
import { clusterAnnouncementMarkers, clusterLabel, clusterOpensList } from "../lib/announcement-clusters";
import AnnouncementClusterBadge from "./AnnouncementClusterBadge";
import MapMarkerBadge from "./MapMarkerBadge";
import { Map, Marker, setWorkerUrl, type StyleSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { CENTER } from "../lib/data";
import { lineFeature, mapStyle, trafficLines, roadLayerIds, routeBounds, type MapProps } from "../lib/map";
import { SHUTTLE_BLUE, liveBusLocation } from "../lib/shuttle-data";
import { colors } from "../lib/theme";
import { Pressable, Text, View } from "react-native";
export default function TownshipMap(props: MapProps) {
  const host = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);
  const current = useRef(props);
  current.current = props;
  const [viewZoom, setViewZoom] = useState(14.4);
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
    setLoaded(false);
    m.on("load", () => {
      setLoaded(true);
      setViewZoom(Math.round(m.getZoom() * 100) / 100);
      current.current.onZoomChange?.(Math.round(m.getZoom() * 100) / 100);
      setFailed(false);
    });
    m.on("zoomend", () => { const zoom = Math.round(m.getZoom() * 100) / 100; setViewZoom(zoom); current.current.onZoomChange?.(zoom); });
    m.on("error", () => {
      if (!m.isStyleLoaded()) setFailed(true);
    });
    let pressTimer: ReturnType<typeof setTimeout> | undefined;
    let suppressClickUntil = 0;
    const cancelPress = () => { clearTimeout(pressTimer); };
    m.on("click", (e) => {
      if (!m.isStyleLoaded()) return;
      if (Date.now() < suppressClickUntil) return;
      const routeLayers = (current.current.routeOptions || []).map((option) => `option-line-${option.id}`).filter((id) => m.getLayer(id));
      if (routeLayers.length) {
        const hit = m.queryRenderedFeatures([[e.point.x - 10, e.point.y - 10], [e.point.x + 10, e.point.y + 10]], { layers: routeLayers })[0];
        if (hit) { current.current.onRouteSelect?.(hit.layer.id.replace("option-line-", "")); return; }
      }
      const trafficHit = m.getLayer("traffic-line") ? m.queryRenderedFeatures([[e.point.x - 12, e.point.y - 12], [e.point.x + 12, e.point.y + 12]], { layers: ["traffic-line"] })[0] : undefined;
      if (trafficHit) {
        current.current.onTrafficPress?.({ corridorId: trafficHit.properties.corridorId, coordinate: [e.lngLat.lng, e.lngLat.lat] });
        return;
      }
      if (current.current.traffic) {
        const layers = roadLayerIds.filter((id) => m.getLayer(id));
        const road = layers.length ? m.queryRenderedFeatures([[e.point.x - 8, e.point.y - 8], [e.point.x + 8, e.point.y + 8]], { layers })[0] : undefined;
        if (road) { current.current.onTrafficPress?.({ name: road.properties.name || road.properties.ref || undefined, coordinate: [e.lngLat.lng, e.lngLat.lat] }); return; }
      }
      current.current.onMapPress?.([e.lngLat.lng, e.lngLat.lat]);
    });
    m.on("contextmenu", (e) => {
      e.preventDefault();
      suppressClickUntil = Date.now() + 500;
      current.current.onMapLongPress?.([e.lngLat.lng, e.lngLat.lat]);
    });
    m.on("touchstart", (e) => {
      cancelPress();
      if (e.originalEvent.touches.length !== 1) return;
      const coordinate: [number, number] = [e.lngLat.lng, e.lngLat.lat];
      pressTimer = setTimeout(() => {
        suppressClickUntil = Date.now() + 800;
        current.current.onMapLongPress?.(coordinate);
      }, 550);
    });
    m.on("touchmove", cancelPress);
    m.on("touchend", cancelPress);
    m.on("touchcancel", cancelPress);
    const observer = new ResizeObserver(() => m.resize());
    observer.observe(host.current);
    return () => {
      cancelPress();
      observer.disconnect();
      m.remove();
      map.current = null;
    };
    // The map is initialised once. Reactive content is managed below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retry]);
  useEffect(() => {
    const m = map.current;
    if (!loaded || !m || !m.isStyleLoaded()) return;
    const roots: Root[] = [];
    const clustered = clusterAnnouncementMarkers(props.markers, viewZoom, props.selectedId, props.clusterEnabled ?? true);
    const markers = clustered.places.map((p) => {
      const b = document.createElement("button");
      b.setAttribute("aria-label", p.name);
      const iconRoot = createRoot(b); roots.push(iconRoot);
      iconRoot.render(<MapMarkerBadge place={p} selected={props.selectedId === p.id} />);
      const size = p.id === liveBusLocation.id ? 80 : isAnnouncementMarker(p) ? 64 : 48;
      b.style.cssText = `display:flex;align-items:center;justify-content:center;height:${size}px;width:${size}px;border:0;padding:0;background:transparent;cursor:pointer;overflow:visible`;
      b.style.zIndex = props.selectedId === p.id ? "999" : isAnnouncementMarker(p) ? "30" : "10";
      b.onclick = (e) => {
        e.stopPropagation();
        current.current.onSelect?.(p);
      };
      return new Marker({ element: b, anchor: isAnnouncementMarker(p) ? "bottom" : "center", offset: p.markerOffset }).setLngLat(p.coordinate).addTo(m);
    });
    clustered.clusters.forEach(cluster => {
      const button = document.createElement("button");
      button.setAttribute("aria-label", clusterLabel(cluster));
      button.style.cssText = "display:flex;align-items:center;justify-content:center;height:48px;width:48px;border:0;padding:0;background:transparent;cursor:pointer;overflow:visible";
      const root = createRoot(button); roots.push(root);
      root.render(<AnnouncementClusterBadge count={cluster.count} selected={cluster.members.some(place => place.id === props.selectedId)} />);
      button.onclick = event => { event.stopPropagation(); if (clusterOpensList(cluster, viewZoom) && current.current.onClusterSelect) { current.current.onClusterSelect(cluster.members); return; } m.easeTo({ center: cluster.coordinate, zoom: cluster.expansionZoom, duration: 450 }); };
      markers.push(new Marker({ element: button, anchor: "center", offset: cluster.markerOffset }).setLngLat(cluster.coordinate).addTo(m));
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
  }, [loaded, props.markers, props.selectedId, props.userCoordinate, viewZoom, props.clusterEnabled]);
  useEffect(() => {
    const m = map.current;
    if (!loaded || !m || !m.isStyleLoaded()) return;
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
    if (!loaded || !m || !m.isStyleLoaded() || !props.shuttleRoute) return;
    m.addSource("shuttle-route-source", { type: "geojson", data: lineFeature(props.shuttleRoute) });
    m.addLayer({ id: "shuttle-route-casing", source: "shuttle-route-source", type: "line", paint: { "line-color": colors.white, "line-width": 8 }, layout: { "line-cap": "round", "line-join": "round" } });
    m.addLayer({ id: "shuttle-route-line", source: "shuttle-route-source", type: "line", paint: { "line-color": SHUTTLE_BLUE, "line-width": 5 }, layout: { "line-cap": "round", "line-join": "round" } });
    return () => {
      if (map.current !== m || !m.isStyleLoaded()) return;
      ["shuttle-route-line", "shuttle-route-casing"].forEach(id => { if (m.getLayer(id)) m.removeLayer(id); });
      if (m.getSource("shuttle-route-source")) m.removeSource("shuttle-route-source");
    };
  }, [loaded, props.shuttleRoute]);
  useEffect(() => {
    const m = map.current;
    if (!loaded || !m || !m.isStyleLoaded()) return;
    if (m.getLayer("route-line")) m.removeLayer("route-line");
    if (m.getSource("route")) m.removeSource("route");
    if (props.route) {
      m.addSource("route", { type: "geojson", data: lineFeature(props.route) });
      m.addLayer({
        id: "route-line",
        source: "route",
        type: "line",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": colors.red, "line-width": 6 },
      });
    }
  }, [loaded, props.route]);
  useEffect(() => {
    const m = map.current;
    if (!loaded || !m || !m.isStyleLoaded()) return;
    const options = props.routeOptions || [];
    const ordered = [...options.filter((option) => option.id !== props.selectedRouteId), ...options.filter((option) => option.id === props.selectedRouteId)];
    ordered.forEach((option) => {
      const source = `option-${option.id}`;
      const selected = option.id === props.selectedRouteId;
      m.addSource(source, { type: "geojson", data: lineFeature(option.coordinates, option.segments) });
      m.addLayer({ id: `option-casing-${option.id}`, type: "line", source, paint: { "line-color": colors.white, "line-width": selected ? 11 : 8 } });
      m.addLayer({ id: `option-line-${option.id}`, type: "line", source, paint: { "line-color": selected ? colors.red : "#9CA3AF", "line-width": selected ? 7 : 5 }, layout: { "line-cap": "round", "line-join": "round" } });
    });
    return () => { if (map.current !== m || !m.isStyleLoaded()) return; options.forEach((option) => {
      [`option-line-${option.id}`, `option-casing-${option.id}`].forEach((id) => { if (m.getLayer(id)) m.removeLayer(id); });
      if (m.getSource(`option-${option.id}`)) m.removeSource(`option-${option.id}`);
    }); };
  }, [loaded, props.routeOptions, props.selectedRouteId]);
  useEffect(() => {
    if (!map.current?.isStyleLoaded()) return;
    if (loaded && props.routeOptions?.length && !props.following) {
      map.current?.fitBounds(routeBounds(props.routeOptions.flatMap((option) => option.coordinates)), { padding: { top: props.viewportPadding?.top || 180, bottom: props.viewportPadding?.bottom || 230, left: 40, right: 40 }, duration: 600, maxZoom: 15 });
    } else if (loaded && props.shuttleRoute?.length && props.zoomLevel === undefined) {
      map.current?.fitBounds(routeBounds(props.shuttleRoute), { padding: { top: props.viewportPadding?.top || 110, bottom: props.viewportPadding?.bottom || 230, left: 40, right: 40 }, duration: 600, maxZoom: 15 });
    } else if (loaded)
      map.current?.easeTo({
        center: props.center || CENTER,
        bearing: props.bearing || 0,
        pitch: props.pitch || 0,
        zoom: props.zoomLevel ?? (props.following ? 16 : props.route ? 15 : 14.4),
        padding: { top: props.viewportPadding?.top || 0, bottom: props.viewportPadding?.bottom || 0, left: 0, right: 0 },
        duration: 600,
      });
  }, [loaded, props.center, props.bearing, props.pitch, props.following, props.cameraKey, props.route, props.routeOptions, props.viewportPadding, props.zoomLevel, props.shuttleRoute]);
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
