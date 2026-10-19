# TownshipConnect · Smart Elmina

A map-first resident app for the Sime Darby hackathon. Built on the `draft-of-ui` branch with Expo SDK 54, React Native, TypeScript, free HeroUI Native, Uniwind and MapLibre. Brand accent: `#D93A34`.

## Start locally

Requires Node 20.19+ (Node 22 LTS recommended) and npm.

```sh
npm ci
npm run web
```

The web build is a convenient interactive review of the same screens. Native builds use HeroUI Native; the web adapter uses matching React Native Web controls because HeroUI Native does not officially support web.

### iOS / Android

MapLibre and speech recognition require a **development build**, not Expo Go.

```sh
npm run ios       # requires Xcode, iOS runtime and CocoaPods
npm run android   # requires Android SDK, JDK and emulator/device
```

If Xcode is installed but Command Line Tools are selected, use:

```sh
DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer npm run ios
```

Alternatively, sign in to your own Expo account and create a development build with `npx eas-cli build --profile development --platform ios` (or `android`). After installing it, run `npm start`.

## What works

- Three bottom tabs: **Home · Explore · Community**. Explore opens first.
- A real, pannable/zoomable MapLibre map with a custom warm palette and OpenFreeMap tiles.
- Traffic, proposed transport stops, hazards and CCTV markers. Contextual panels appear only after selection; tap any map location to drop a pin.
- Dedicated destination search, microphone input (permission and device support required), and saved places.
- Driving route previews from OSRM, with duration/distance estimates. The origin is the labelled demo starting point, not the user's GPS position.
- **Demo journey mode** with turn instructions, map bearing changes, remaining time/distance and End. The bottom tabs disappear. “Preview next instruction” advances the simulation; this is not live GPS navigation.
- Home quick actions, sample road overview, official announcement previews, profile and report access.
- Announcement filters, reactions, comments, sharing and links to map locations. No resident post composer or direct messaging.
- Issue reporting with validation, up to three image attachments and a persisted report list. Native attachments are copied into app-owned document storage.
- Browser review and platform-specific native map integration.

## Demo data and service boundaries

This build deliberately starts without a backend account. Reports, comments, profile edits, bookmarks and reactions are saved **only on the device** using AsyncStorage. They are not sent to management or shared with other residents. On web, browser storage quotas can limit attached photos; storage failures are shown rather than silently hidden.

Road geometry is real; traffic colours, camera/stop placements, incidents, road counts and announcements are **sample data**. There is no AI CCTV processing, verified incident feed, operating shuttle, push notification service or Supabase connection yet. No authentication or resident verification is implied by the demo profile.

CCTV initially shows “Camera feed not connected”. Configure an authorised HTTPS HLS stream for sample Camera 01 to exercise the video player. The app does not fabricate live footage.

Search currently covers the seeded township destinations. A production geocoder, production routing provider, continuous GPS navigation, rerouting and background location are separate integrations. The public OSRM demo endpoint provides route estimates without live traffic and is not a production SLA.

## Configuration

Copy `.env.example` to `.env.local` and restart Metro after editing.

- `EXPO_PUBLIC_MAP_STYLE_URL`: optional MapLibre style URL. Leave unset for the bundled custom OpenFreeMap style.
- `EXPO_PUBLIC_ROUTING_URL`: optional OSRM-compatible service origin. Defaults to `https://router.project-osrm.org`.
- `EXPO_PUBLIC_CCTV_STREAM_URL`: optional authorised HTTPS stream for Camera 01.

All `EXPO_PUBLIC_*` values are bundled into the client. **Do not put passwords, service-role keys or private camera credentials here.** A production CCTV service should issue short-lived authenticated stream URLs from a backend after verifying resident access.

## Validation

```sh
npm run typecheck
npm run lint
npm test
npx expo-doctor
npx expo export --platform all
```

Unit tests cover report validation, corrupted local storage, reaction toggling, map filters, search and route-response parsing. A successful native JavaScript export does not replace an installed-device test.

## Structure

```text
src/app/           Expo Router screens and three-tab layout
src/components/    Shared UI, native HeroUI controls, map/video/voice adapters
src/lib/           Theme, sample records, map style, routing and validation
src/state/         Versioned local demo persistence
assets/           Map style and sample traffic geometry
public/           MapLibre web worker (same-origin deployment)
tests/            Model and routing checks
docs/             Design and integration notes
```

MapLibre GL JS 6 uses a module worker. The web adapter points to the vendored worker in `public/`; Expo's import-meta transform is enabled in `babel.config.js`. Update the worker along with `maplibre-gl` using `npm run sync:map-worker`.

## Credits

- Map data: © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright), served via [OpenFreeMap](https://openfreemap.org/) / OpenMapTiles. Attribution remains on the map.
- Custom palette adapted from [OpenFreeMap Liberty](https://tiles.openfreemap.org/styles/liberty), derived from the [OSM Liberty style](https://github.com/maputnik/osm-liberty).
- Demo traffic geometry: OSRM driving route over OpenStreetMap data. Congestion colours are synthetic.
- Reference coordinates: [Elmina Lakeside Mall](https://mapcarta.com/W1308938137) and [Elmina Valley Central Park](https://mapcarta.com/W866543394), based on OSM. Demo camera and shuttle locations are illustrative.
- Map renderer: MapLibre React Native (MIT), MapLibre GL JS (BSD-3-Clause); see `docs/maplibre-license.txt` for the bundled web-worker licence.

The generated design-board images from the planning chat are references, not production assets or real camera footage.
