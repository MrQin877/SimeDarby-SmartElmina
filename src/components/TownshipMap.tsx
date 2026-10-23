import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  Map,
  Camera,
  Marker,
  GeoJSONSource,
  Layer,
  type CameraRef,
  type MapRef,
  type StyleSpecification,
} from "@maplibre/maplibre-react-native";
import { isAnnouncementMarker } from "../lib/map-layers";
import { clusterAnnouncementMarkers, clusterLabel, clusterOpensList, type AnnouncementCluster } from "../lib/announcement-clusters";
import AnnouncementClusterBadge from "./AnnouncementClusterBadge";
import MapMarkerBadge from "./MapMarkerBadge";
import { CENTER } from "../lib/data";
import { lineFeature, mapStyle, trafficLines, roadLayerIds, routeBounds, type MapProps } from "../lib/map";
import { runCameraCommand } from "../lib/native-camera";
import { SHUTTLE_BLUE, liveBusLocation } from "../lib/shuttle-data";
import { colors } from "../lib/theme";
export default function TownshipMap({
  markers,
  onSelect,
  onZoomChange,
  onClusterSelect,
  clusterEnabled = true,
  onMapPress,
  onMapLongPress,
  onTrafficPress,
  selectedId,
  center = CENTER,
  traffic,
  route,
  shuttleRoute,
  zoomLevel,
  routeOptions,
  selectedRouteId,
  onRouteSelect,
  viewportPadding,
  bearing = 0,
  pitch = 0,
  following = false,
  userCoordinate,
  cameraKey,
}: MapProps) {
  const camera = useRef<CameraRef>(null);
  const map = useRef<MapRef>(null);
  const interaction = useRef(0);
  const [viewZoom, setViewZoom] = useState(14.4);
  const clustered = useMemo(() => clusterAnnouncementMarkers(markers, viewZoom, selectedId, clusterEnabled), [markers, viewZoom, selectedId, clusterEnabled]);
  const expandCluster = (cluster: AnnouncementCluster) => {
    if (clusterOpensList(cluster, viewZoom) && onClusterSelect) { onClusterSelect(cluster.members); return; }
    const target = camera.current;
    if (!target) return;
    void runCameraCommand(() => camera.current === target, () => target.easeTo({ center: cluster.coordinate, zoom: cluster.expansionZoom, duration: 450 }), error => console.warn("Cluster camera update failed", error));
  };
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!loaded || !camera.current) return;
    const target = camera.current;
    let active = true;
    // Wait for native layout after map initialization, including retries.
    const frame = requestAnimationFrame(() => {
      void runCameraCommand(() => active && camera.current === target, () => {
        const coordinates = routeOptions?.flatMap((option) => lineFeature(option.coordinates, option.segments).features.flatMap((feature) => feature.geometry.coordinates)) || (zoomLevel === undefined ? shuttleRoute : undefined) || [];
        if (coordinates.length > 1 && !following) {
          const [sw, ne] = routeBounds(coordinates as typeof center[]);
          return target.fitBounds([...sw, ...ne], { padding: { top: viewportPadding?.top || 180, bottom: viewportPadding?.bottom || 230, left: 40, right: 40 }, duration: 600 });
        }
        return target.easeTo({ center, zoom: zoomLevel ?? (following ? 16 : route ? 15 : 14.4), bearing, pitch, padding: { top: viewportPadding?.top || 0, bottom: viewportPadding?.bottom || 0 }, duration: 600 });
      }, (error) => console.warn("Map camera update failed", error));
    });
    return () => { active = false; cancelAnimationFrame(frame); };
  }, [loaded, retry, center, bearing, pitch, following, route, cameraKey, routeOptions, viewportPadding, zoomLevel, shuttleRoute]);
  return (
    <View style={StyleSheet.absoluteFill}>
      <Map
        ref={map}
        key={retry}
        style={{ flex: 1 }}
        mapStyle={mapStyle as string | StyleSpecification}
        attributionPosition={{ bottom: 8, left: 8 }}
        onDidFailLoadingMap={() => { setLoaded(false); setFailed(true); }}
        onDidFinishLoadingMap={() => { setLoaded(true); setFailed(false); }}
        onRegionDidChange={event => { const zoom = event.nativeEvent.zoom; if (Number.isFinite(zoom)) { const next = Math.round(zoom * 100) / 100; setViewZoom(next); onZoomChange?.(next); } }}
        onPress={async (event) => {
          if ("features" in event.nativeEvent && event.nativeEvent.features?.length) return;
          const token = ++interaction.current;
          const { lngLat, point } = event.nativeEvent;
          if (traffic) {
            try {
              const roads = await map.current?.queryRenderedFeatures([[point[0] - 8, point[1] - 8], [point[0] + 8, point[1] + 8]], { layers: roadLayerIds });
              if (token !== interaction.current) return;
              if (roads?.length) {
                const properties = roads[0].properties;
                onTrafficPress?.({ name: properties?.name || properties?.ref || undefined, coordinate: lngLat });
                return;
              }
            } catch { /* A custom map style may use other road layer names. */ }
          }
          if (token === interaction.current) onMapPress?.(lngLat);
        }}
        onLongPress={(event) => onMapLongPress?.(event.nativeEvent.lngLat)}
      >
        <Camera
          ref={camera}
          initialViewState={{ center, zoom: 14.4, bearing }}
        />
        {traffic && (
          <GeoJSONSource id="traffic" data={trafficLines} hitbox={{ top: 12, bottom: 12, left: 12, right: 12 }} onPress={(event) => { event.stopPropagation(); interaction.current++; onTrafficPress?.({ corridorId: event.nativeEvent.features[0]?.properties?.corridorId, coordinate: event.nativeEvent.lngLat }); }}>
            <Layer
              id="traffic-line"
              type="line"
              paint={{
                "line-color": ["get", "color"],
                "line-width": 5,
                "line-opacity": 0.85,
              }}
              layout={{ "line-cap": "round", "line-join": "round" }}
            />
          </GeoJSONSource>
        )}
        {shuttleRoute && <GeoJSONSource id="shuttle-route-source" data={lineFeature(shuttleRoute)}>
          <Layer id="shuttle-route-casing" type="line" paint={{ "line-color": colors.white, "line-width": 8 }} layout={{ "line-cap": "round", "line-join": "round" }} />
          <Layer id="shuttle-route-line" type="line" paint={{ "line-color": SHUTTLE_BLUE, "line-width": 5 }} layout={{ "line-cap": "round", "line-join": "round" }} />
        </GeoJSONSource>}
        {routeOptions?.filter((option) => lineFeature(option.coordinates, option.segments).features.length > 0).map((option) => <GeoJSONSource key={option.id} id={`option-${option.id}`} data={lineFeature(option.coordinates, option.segments)} hitbox={{ top: 12, bottom: 12, left: 12, right: 12 }} onPress={(event) => { event.stopPropagation(); onRouteSelect?.(option.id); }}>
          <Layer id={`option-casing-${option.id}`} type="line" paint={{ "line-color": colors.white, "line-width": option.id === selectedRouteId ? 11 : 8 }} />
          <Layer id={`option-line-${option.id}`} type="line" paint={{ "line-color": option.id === selectedRouteId ? (option.id.startsWith("transit") ? colors.blue : option.id.startsWith("walk") ? colors.green : colors.red) : "#9CA3AF", "line-width": option.id === selectedRouteId ? 7 : 5 }} layout={{ "line-cap": "round", "line-join": "round" }} />
        </GeoJSONSource>)}
        {route && lineFeature(route).features.length > 0 && (
          <GeoJSONSource id="route" data={lineFeature(route)}>
            <Layer
              id="route-casing"
              type="line"
              paint={{ "line-color": "#fff", "line-width": 10 }}
            />
            <Layer
              id="route-line"
              type="line"
              paint={{ "line-color": colors.red, "line-width": 6 }}
              layout={{ "line-cap": "round", "line-join": "round" }}
            />
          </GeoJSONSource>
        )}
        {clustered.clusters.map(cluster => <Marker key={cluster.id} id={cluster.id} lngLat={cluster.coordinate} offset={cluster.markerOffset} onPress={event => { event.stopPropagation(); interaction.current++; expandCluster(cluster); }}>
          <Pressable accessibilityRole="button" accessibilityLabel={clusterLabel(cluster)} onPress={event => { event.stopPropagation(); interaction.current++; expandCluster(cluster); }} style={{ width: 48, height: 48 }}>
            <AnnouncementClusterBadge count={cluster.count} selected={cluster.members.some(place => place.id === selectedId)} />
          </Pressable>
        </Marker>)}
        {clustered.places.map((place) => {
          const selected = selectedId === place.id;
          return (
            <Marker
              key={place.id}
              id={place.id}
              lngLat={place.coordinate}
              anchor={isAnnouncementMarker(place) ? "bottom" : "center"}
              offset={place.markerOffset}
              selected={selected}
              style={{ zIndex: selected ? 999 : isAnnouncementMarker(place) ? 30 : 10 }}
              onPress={(event) => { event.stopPropagation(); interaction.current++; onSelect?.(place); }}
            >
              <Pressable
                accessibilityLabel={place.name}
                onPress={(event) => { event.stopPropagation(); interaction.current++; onSelect?.(place); }}
                style={{ width: place.id === liveBusLocation.id ? 80 : isAnnouncementMarker(place) ? 64 : 48, height: place.id === liveBusLocation.id ? 80 : isAnnouncementMarker(place) ? 64 : 48, alignItems: "center", justifyContent: "center" }}
              >
                <MapMarkerBadge place={place} selected={selected} />
              </Pressable>
            </Marker>
          );
        })}
        {userCoordinate && (
          <Marker id="user" lngLat={userCoordinate}>
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: colors.blue,
                borderColor: "#fff",
                borderWidth: 4,
              }}
            />
          </Marker>
        )}
      </Map>
      {failed && (
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setLoaded(false);
            setFailed(false);
            setRetry((n) => n + 1);
          }}
          style={{
            position: "absolute",
            top: "45%",
            alignSelf: "center",
            backgroundColor: "#fff",
            padding: 18,
            borderRadius: 16,
          }}
        >
          <Text>Map unavailable. Check your connection and tap to retry.</Text>
        </Pressable>
      )}
    </View>
  );
}
