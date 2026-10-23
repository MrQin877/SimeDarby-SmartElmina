import { useCallback, useEffect, useMemo, useRef, type ReactNode } from "react";
import { Animated, PanResponder, Pressable, View } from "react-native";
import { colors, radius, ui } from "../lib/theme";
import { nearestSnap, sheetSnapPoints, toggledSheetSnap } from "../lib/sheet";

export default function DraggableSheet({ children, availableHeight, index, onSnap, expandedHeight, snapPoints, compactHandle = false, visible = true }: {
  expandedHeight?: number;
  snapPoints?: number[];
  compactHandle?: boolean;
  visible?: boolean;
  children: ReactNode; availableHeight: number; index: number; onSnap: (index: number) => void;
}) {
  const points = useMemo(() => snapPoints || sheetSnapPoints(availableHeight, expandedHeight), [availableHeight, expandedHeight, snapPoints]);
  const height = useRef(new Animated.Value(0)).current;
  const animation = useRef<Animated.CompositeAnimation | null>(null);
  const animateTo = useCallback((target: number) => {
    animation.current?.stop();
    animation.current = Animated.timing(height, { toValue: target, duration: 280, useNativeDriver: false });
    animation.current.start();
  }, [height]);
  const start = useRef(points[index]);
  const current = useRef(points[index]);
  useEffect(() => {
    const listener = height.addListener(({ value }) => { current.current = value; });
    return () => { animation.current?.stop(); height.stopAnimation(); height.removeListener(listener); };
  }, [height]);
  useEffect(() => {
    if (!visible) {
      animation.current?.stop();
      height.stopAnimation();
      height.setValue(0);
      return;
    }
    animateTo(points[index]);
    return () => animation.current?.stop();
  }, [animateTo, height, index, points, visible]);
  const pan = useMemo(() => {
    const finish = (dy: number, vy: number) => {
      if (!visible) return;
      const next = nearestSnap(points, start.current - dy, vy);
      onSnap(next);
      animateTo(points[next]);
    };
    return PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponderCapture: (_, gesture) => Math.abs(gesture.dy) > 6 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 5 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
      onPanResponderGrant: () => { animation.current?.stop(); height.stopAnimation(); start.current = current.current; },
      onPanResponderMove: (_, gesture) => height.setValue(Math.max(points[0], Math.min(points[2], start.current - gesture.dy))),
      onPanResponderRelease: (_, gesture) => finish(gesture.dy, gesture.vy),
      onPanResponderTerminate: (_, gesture) => finish(gesture.dy, 0),
    });
  }, [animateTo, height, points, onSnap, visible]);
  // A permanent shell avoids recycling the clipped native parent during navigation.
  // Keep the border separate: clipped views with borders use an extra iOS container.
  return <Animated.View pointerEvents={visible ? "auto" : "none"} accessibilityElementsHidden={!visible} importantForAccessibility={visible ? "auto" : "no-hide-descendants"} collapsable={false} collapsableChildren={false} {...(visible && index < 2 ? pan.panHandlers : {})} style={[ui.shadow, { display: visible ? "flex" : "none", position: "absolute", zIndex: 4, elevation: 8, bottom: 0, left: 0, right: 0, height, backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: "hidden", paddingHorizontal: 20 }]}>
    <View collapsable={false} pointerEvents="none" style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, backgroundColor: colors.border }} />
    <Pressable {...pan.panHandlers} accessibilityRole="button" accessibilityLabel={index === 2 ? "Collapse map details" : "Expand map details"} accessibilityState={{ expanded: index === 2 }} onPress={() => onSnap(toggledSheetSnap(index))} style={{ height: compactHandle ? 30 : 40, alignItems: "center", justifyContent: "center", touchAction: "none" }}>
      <View style={{ width: 36, height: 4, borderRadius: radius.sm, backgroundColor: colors.border }} />
    </Pressable>
    <View collapsable={false} collapsableChildren={false} style={{ flex: 1 }}>{visible ? children : null}</View>
  </Animated.View>;
}
