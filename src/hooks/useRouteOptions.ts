import { useEffect, useMemo, useState } from "react";
import type { Place } from "../lib/data";
import { demoRouteOptions, requestDrivingOptions, requestTransitOptions, requestWalkingOptions, type RouteOption, type TravelMode } from "../lib/journey-planner";
export function useRouteOptions(origin: Place | null, destination: Place | null, mode: TravelMode, enabled: boolean) {
  const demos = useMemo(() => origin && destination ? demoRouteOptions(origin, destination, mode) : [], [origin, destination, mode]);
  const key = origin && destination ? `${mode}:${origin.coordinate.join(",")}:${destination.coordinate.join(",")}` : "";
  const [roads, setRoads] = useState<{ key: string; options: RouteOption[]; loading: boolean; message: string }>();
  useEffect(() => {
    if (!enabled || !origin || !destination || !demos.length) return;
    const controller = new AbortController();
    let active = true;
    setRoads({ key, options: [], loading: true, message: "" });
    const timeout = setTimeout(() => controller.abort(), mode === "transit" ? 25000 : 15000);
    const request = mode === "drive" ? requestDrivingOptions : mode === "walk" ? requestWalkingOptions : requestTransitOptions;
    request(origin, destination, controller.signal).then((options) => {
      if (active) setRoads({ key, options, loading: false, message: mode === "walk" ? "Mapped walking paths · OpenStreetMap / FOSSGIS · check access on site" : mode === "transit" ? "Mapped roads & walking connections · proposed transit / example timetable" : "Road geometry & ETA from routing service · no live traffic data" });
    }).catch(() => {
      if (active) setRoads({ key, options: [], loading: false, message: "Route geometry unavailable. Preview estimates only; retry by selecting a travel mode. Navigation is unavailable until a mapped route loads." });
    }).finally(() => clearTimeout(timeout));
    return () => { active = false; clearTimeout(timeout); controller.abort(); };
  }, [enabled, mode, origin, destination, demos, key]);
  const current = enabled && roads?.key === key ? roads : undefined;
  return { options: current?.options.length ? current.options : demos, loading: enabled && demos.length > 0 && (!current || current.loading), message: current?.message || "Loading mapped route geometry · preview estimates only" };
}
