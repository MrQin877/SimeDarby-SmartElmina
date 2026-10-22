import { Redirect, useLocalSearchParams } from "expo-router";
export default function RoutePreview() {
  const { lng, lat, name } = useLocalSearchParams<{ lng?: string; lat?: string; name?: string }>();
  return <Redirect href={{ pathname: "/explore", params: { sheet: "plan_journey", lng: lng || "", lat: lat || "", name: name || "Selected destination" } }} />;
}
