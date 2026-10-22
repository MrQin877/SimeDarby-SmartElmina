import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { Animated, PanResponder, Pressable, View } from "react-native";
import { colors, radius, ui } from "../lib/theme";
import { nearestSnap, sheetSnapPoints, toggledSheetSnap } from "../lib/sheet";

export default function DraggableSheet({ children, availableHeight, index, onSnap, expandedHeight, snapPoints, compactHandle = false }: {
  expandedHeight?: number;
  snapPoints?: number[];
  compactHandle?: boolean;
  children: ReactNode; availableHeight: number; index: number; onSnap: (index: number) => void;
}) {
  const points = useMemo(() => snapPoints || sheetSnapPoints(availableHeight, expandedHeight), [availableHeight, expandedHeight, snapPoints]);
  const height = useRef(new Animated.Value(0)).current;
  const start = useRef(points[index]);
  const current = useRef(points[index]);
  useEffect(() => {
    const listener = height.addListener(({ value }) => { current.current = value; });
    return () => height.removeListener(listener);
  }, [height]);
  useEffect(() => {
    Animated.timing(height, { toValue: points[index], duration: 280, useNativeDriver: false }).start();
  }, [height, index, points]);
  const pan = useMemo(() => {
    const finish = (dy: number, vy: number) => {
      const next = nearestSnap(points, start.current - dy, vy);
      onSnap(next);
      Animated.timing(height, { toValue: points[next], duration: 280, useNativeDriver: false }).start();
    };
    return PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponderCapture: (_, gesture) => Math.abs(gesture.dy) > 6 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 5 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
      onPanResponderGrant: () => { height.stopAnimation(); start.current = current.current; },
      onPanResponderMove: (_, gesture) => height.setValue(Math.max(points[0], Math.min(points[2], start.current - gesture.dy))),
      onPanResponderRelease: (_, gesture) => finish(gesture.dy, gesture.vy),
      onPanResponderTerminate: (_, gesture) => finish(gesture.dy, 0),
    });
  }, [height, points, onSnap]);
  return <Animated.View {...(index < 2 ? pan.panHandlers : {})} style={[ui.shadow, { position: "absolute", zIndex: 4, elevation: 8, bottom: 0, left: 0, right: 0, height, backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, borderTopWidth: 1, borderColor: colors.border, overflow: "hidden", paddingHorizontal: 20 }]}>
    <Pressable {...pan.panHandlers} accessibilityRole="button" accessibilityLabel={index === 2 ? "Collapse map details" : "Expand map details"} accessibilityState={{ expanded: index === 2 }} onPress={() => onSnap(toggledSheetSnap(index))} style={{ height: compactHandle ? 30 : 40, alignItems: "center", justifyContent: "center", touchAction: "none" }}>
      <View style={{ width: 36, height: 4, borderRadius: radius.sm, backgroundColor: colors.border }} />
    </Pressable>
    {children}
  </Animated.View>;
}
