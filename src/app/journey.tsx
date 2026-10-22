import { Redirect } from "expo-router";
// Compatibility entry point for older links. Navigation is an Explore overlay.
export default function JourneyScreen() {
  return <Redirect href={{ pathname: "/explore", params: { resume: "1" } }} />;
}
