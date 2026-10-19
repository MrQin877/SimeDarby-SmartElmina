import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  Map,
  Camera,
  Marker,
  GeoJSONSource,
  Layer,
  type CameraRef,
  type StyleSpecification,
} from "@maplibre/maplibre-react-native";
import { BusFront, Video, TriangleAlert, MapPin } from "lucide-react-native";
import { CENTER } from "../lib/data";
import { lineFeature, mapStyle, trafficLines, type MapProps } from "../lib/map";
import { colors } from "../lib/theme";
export default function TownshipMap({
  markers,
  onSelect,
  onMapPress,
  selectedId,
  center = CENTER,
  traffic,
  route,
  bearing = 0,
  userCoordinate,
  cameraKey,
}: MapProps) {
  const camera = useRef<CameraRef>(null);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    camera.current?.easeTo({
      center,
      zoom: route ? 15 : 14.4,
      bearing,
      duration: 600,
    });
  }, [center, bearing, route, cameraKey]);
  return (
    <View style={StyleSheet.absoluteFill}>
      <Map
        key={retry}
        style={{ flex: 1 }}
        mapStyle={mapStyle as string | StyleSpecification}
        attributionPosition={{ bottom: 8, left: 8 }}
        onDidFailLoadingMap={() => setFailed(true)}
        onDidFinishLoadingMap={() => setFailed(false)}
        onPress={(event) => onMapPress?.(event.nativeEvent.lngLat)}
      >
        <Camera
          ref={camera}
          initialViewState={{ center, zoom: 14.4, bearing }}
        />
        {traffic && (
          <GeoJSONSource id="traffic" data={trafficLines}>
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
        {route && (
          <GeoJSONSource id="route" data={lineFeature(route)}>
            <Layer
              id="route-casing"
              type="line"
              paint={{ "line-color": "#fff", "line-width": 10 }}
            />
            <Layer
              id="route-line"
              type="line"
              paint={{ "line-color": "#377EDB", "line-width": 6 }}
              layout={{ "line-cap": "round", "line-join": "round" }}
            />
          </GeoJSONSource>
        )}
        {markers.map((place) => {
          const Icon =
            place.kind === "camera"
              ? Video
              : place.kind === "transport"
                ? BusFront
                : place.kind === "hazard"
                  ? TriangleAlert
                  : MapPin;
          const selected = selectedId === place.id;
          return (
            <Marker
              key={place.id}
              id={place.id}
              lngLat={place.coordinate}
              onPress={() => onSelect?.(place)}
            >
              <Pressable
                accessibilityLabel={place.name}
                onPress={() => onSelect?.(place)}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 18,
                  borderWidth: 3,
                  borderColor: "#fff",
                  backgroundColor: selected ? colors.red : "#fff",
                  alignItems: "center",
                  justifyContent: "center",
                  elevation: 5,
                }}
              >
                <Icon
                  size={21}
                  color={
                    selected
                      ? "#fff"
                      : place.kind === "hazard"
                        ? colors.amber
                        : colors.ink
                  }
                />
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
