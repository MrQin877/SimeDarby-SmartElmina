# TownshipConnect — City of Elmina

**TownshipConnect** is a mobile and web smart-township companion built for the **City of Elmina** (Sime Darby Property Hackathon). It brings together interactive township mobility, live road/CCTV exploration, turn-by-turn route previews, neighbourhood issue reporting, and community announcements in a clean, resident-first interface.

---

## Features

- **Home Dashboard (`src/app/(tabs)/home.tsx`)**
  - Quick destination search with voice input support
  - Saved favourite places (`Home`, `Work`, `Park`, `Mall`) and saved routes
  - Sample township traffic snapshot across key corridors (`Clear`, `Moderate`, `Heavy`)
  - Latest official announcements and resident report status summary
- **Interactive Township Map (`src/app/(tabs)/explore.tsx`)**
  - Powered by **MapLibre** (`@maplibre/maplibre-react-native` on iOS/Android & `maplibre-gl` on Web)
  - Filterable map layers: **Traffic**, **Transport** (proposed feeder bus stops & timetables), **Hazards**, and **CCTV** road cameras (`expo-video`)
  - Tap anywhere on the map to drop a pin, bookmark places, or launch route planning
- **Route Planning & Turn-by-Turn Journey (`src/app/route.tsx`, `src/app/journey.tsx`)**
  - Calculates driving, cycling, and walking routes with step-by-step navigation instructions
  - Interactive journey preview mode with distance and ETA updates
- **Community Feed & Announcements (`src/app/(tabs)/community.tsx`, `src/app/announcement.tsx`)**
  - Official Township Management updates filterable by category (`Road & Traffic`, `Safety`, `Environment`, `Community`)
  - Resident reactions, comments, and direct **"View on map"** links for location-tagged notices
- **Neighbourhood Issue Reporting (`src/app/report.tsx`, `src/app/reports.tsx`)**
  - Submit local maintenance or hazard reports (`Road & traffic`, `Streetlights`, `Cleanliness`, `Facilities`, `Other`)
  - Attach up to 3 photos (`expo-image-picker`) persisted locally on the device (`AsyncStorage` + `expo-file-system`)

---

## Tech Stack

- **Framework**: [Expo SDK 54](https://docs.expo.dev/) & [React Native 0.81](https://reactnative.dev/) (New Architecture enabled)
- **Navigation**: [Expo Router v6](https://docs.expo.dev/router/introduction/) (file-based routing in `src/app/`)
- **UI & Styling**: [HeroUI Native](https://heroui.com/native), [Tailwind CSS v4](https://tailwindcss.com/) + [Uniwind](https://github.com/uniwind/uniwind), [Lucide Icons](https://lucide.dev/), and `DM Sans` typography
- **Maps & Media**: `@maplibre/maplibre-react-native` (iOS/Android), `maplibre-gl` (Web), `expo-location`, `expo-video`, `expo-speech-recognition`, `expo-image-picker`

---

## Prerequisites

Before running the project, make sure you have the following installed:

### 1. Required for All Platforms
- **Node.js**: `v20 LTS` or `v22+` (with `npm`)
- **Git**

### 2. Platform-Specific Requirements

#### Running on Web (Fastest — no native SDKs required)
- Any modern web browser (Chrome, Safari, Firefox, Edge)

#### Running Locally on Android (`npm run android`)
> **Note**: Because this app uses custom native modules (`@maplibre/maplibre-react-native`, `expo-speech-recognition`, `expo-video`), it requires an **Expo Development Build** and **cannot** be opened inside the standard Expo Go store app.

- **Android Studio** with:
  - **Android SDK Platform** (API 35 / Android 15 recommended) & **Android SDK Build-Tools**
  - **Android Emulator** (or a physical Android phone with **USB Debugging** enabled)
- **JDK 17 or JDK 21**
  - *Automatic fallback included*: `npm run android` runs [`scripts/run-android.cjs`](scripts/run-android.cjs), which automatically detects a compatible JDK (`17`–`23`) or falls back to Android Studio's bundled JetBrains Runtime (`jbr`) if your system default Java is newer (e.g. Java 24–26).
- `ANDROID_HOME` environment variable configured:
  - **macOS**: `export ANDROID_HOME="$HOME/Library/Android/sdk"`
  - **Windows**: `%LOCALAPPDATA%\Android\Sdk`

#### Running Locally on iOS (`npm run ios` — macOS only)
- **Xcode 16+** with **Xcode Command Line Tools** (`xcode-select --install`)
- **CocoaPods** (`sudo gem install cocoapods` or `brew install cocoapods`)
- **iOS Simulator** (installed via Xcode > Settings > Components)

---

## Getting Started & Running the Project

### 1. Install Dependencies

```bash
npm install
```

### 2. Run on Android (Development Build)

Start an Android Emulator (or plug in a physical Android device via USB) and run:

```bash
npm run android
```

- To target a specific physical device or emulator:
  ```bash
  npm run android -- --device
  ```
- **Daily development after the first build**: Once the `TownshipConnect` development app is installed on your emulator/device, you **do not** need to rebuild every time you edit TypeScript/React code. Simply start the Metro bundler:
  ```bash
  npm start
  ```

### 3. Run on iOS (macOS only)

```bash
npm run ios
```

### 4. Run on Web

If you update `maplibre-gl`, sync the web worker once (`npm run sync:map-worker`), then start the web server:

```bash
npm run web
```

---

## Alternative: Cloud Development Build with EAS (No Local Android Studio / Xcode Needed)

If a team member does not have Android Studio or Xcode installed locally, you can build the development `.apk` in the cloud using **EAS Build** (`eas.json` is preconfigured):

```bash
npx eas-cli@latest login
npx eas-cli@latest build --platform android --profile development
```

Once finished, download and install the `.apk` on your Android device or emulator via the EAS link/QR code, then run:

```bash
npm start
```

---

## Useful Commands & Scripts

| Command | Description |
| :--- | :--- |
| `npm start` | Start the Expo development server (`expo start --dev-client`) |
| `npm run android` | Auto-detect compatible JDK (17–21) and build/run Android development client |
| `npm run ios` | Build and run iOS development client on Simulator |
| `npm run web` | Start the web version in your browser (`expo start --web`) |
| `npm run typecheck` | Run TypeScript compiler typechecking (`tsc --noEmit`) |
| `npm run lint` | Run ESLint via `expo lint` |
| `npm test` | Run unit tests (`tests/*.test.ts`) |
| `npx expo prebuild --clean` | Regenerate native `android/` and `ios/` directories after changing `app.json` or native packages |

---

## Troubleshooting

- **`Unsupported class file major version 70` (or `68`/`69`) on Android**
  - **Cause**: Your terminal's default Java is JDK 24–26, which Gradle `8.14` does not support yet.
  - **Fix**: Run `npm run android` (which uses `scripts/run-android.cjs` to automatically select JDK 17/21 or Android Studio's bundled JDK), or manually set `JAVA_HOME`:
    ```bash
    export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
    export PATH="$JAVA_HOME/bin:$PATH"
    ```
- **Native dependency or `app.json` changes not taking effect**
  - Run `npx expo prebuild --clean` followed by `npm run android` or `npm run ios`.
