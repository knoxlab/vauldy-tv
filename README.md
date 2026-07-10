# Vauldy TV

TV client for [Vauldy](https://github.com/knoxmedia/Vauldy) media server. Cross-platform app for **Android TV** and **Apple TV (tvOS)**, built with **Expo** and **react-native-tvos**.

This repository is linked into the main Vauldy project as a git submodule at `Vauldy-TV/`.

## Phase 1 (MVP)

- Server setup & JWT login
- Sidebar navigation with TV focus highlights
- Home: libraries, continue watching, recently added (horizontal shelves)
- Browse libraries & media grids
- Media detail, favorites
- Video/audio playback (expo-av, HLS/direct)
- Photo lightbox, PDF/Office/EPUB reader (WebView)
- Settings: language, server, logout
- Android TV & tvOS builds via Expo prebuild

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 20+ |
| Android Studio | Android TV emulator or device |
| Xcode | Apple TV simulator or device (macOS only) |

## Development

```bash
npm install

# Generate native TV projects (first time)
npm run prebuild:tv

# Android TV
npm run android

# Apple TV (macOS)
npm run ios

# Type check
npm run typecheck
```

Default server: `http://127.0.0.1:8200` — demo login `admin` / `admin123`.

> Set `EXPO_TV=1` (via `prebuild:tv` script) so `@react-native-tvos/config-tv` configures native projects for TV.

## Project layout

```
app/              Expo Router screens
src/api/          Vauldy API client
src/components/   TV focus UI, shelves, sidebar
src/store/        Zustand auth/config/player
doc/              Requirements specification (SRS)
```

## Related

- [TV SRS](doc/电视端需求规格书.md)
- [Vauldy server](https://github.com/knoxmedia/Vauldy)
- [Mobile client](https://github.com/knoxmedia/Vauldy-ReactNative)
- [Expo TV guide](https://docs.expo.dev/guides/building-for-tv/)
