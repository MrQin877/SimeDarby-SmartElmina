import { Redirect, useLocalSearchParams } from "expo-router";
// Compatibility entry point: search itself lives over Explore's persistent map.
export default function SearchScreen() {
  const { voice } = useLocalSearchParams<{ voice?: string }>();
  return <Redirect href={{ pathname: "/explore", params: { mode: "search", voice: voice || "" } }} />;
}
