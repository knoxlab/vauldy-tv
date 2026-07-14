# Vauldy TV v0.1.0 Release Notes

## Overview

Vauldy TV is an Android TV client for Vauldy media server, built with Expo + react-native-tvos.
This initial release provides full media browsing, video playback, music streaming, TV series support,
and remote-control optimized navigation.

---

## Core Features

### Media Browsing
- **Home screen** — Continue Watching shelf with playback progress, Libraries grid, and Recent media rows
- **Browse** — Browse by library type (movies, TV series, photos, music, documents)
- **Favorites** — Grid view of favorited media items
- **Library detail** — Grid of media items within a library with sorting

### Video Playback
- Full video player with expo-av hardware decoding
- **D-pad seek** — Short press ±30s, long press ±60s on direction keys
- **On-screen controls** — Play/pause, fast-forward, rewind, stop with focusable buttons
- **Resume playback** — Automatically resumes from last playback position when re-entering a video
- **Progress saving** — Periodic progress sync to server during playback
- **Keep screen awake** — Disables Android TV screensaver during active video playback

### TV Series
- **Series detail page** — Hero banner with poster artwork, season/episode counts
- **Season navigation** — Horizontal season tab bar for switching between seasons
- **Episode list** — Sorted episode list with poster thumbnails and **watched status badges**
- **Playback actions** — "Continue" (resume from last episode) and "Play from start" buttons
- **Auto-play next** — At episode end, shows a **corner overlay** with next episode poster, title, and countdown
  - Press **OK** → skip countdown, play next episode immediately
  - Press **Back** → cancel, stay on current screen
- **Series playback session** — Remembers series play order across episodes for seamless continuation

### Music Player
- Full-screen music player with album art, artist/album metadata, and seek controls
- **Lyrics panel** — Synchronized lyrics display with auto-scroll (LRC format)
- **Floating mini-bar** — Persistent music controls at screen bottom while browsing
- **Queue navigation** — Previous/next track with queue index tracking
- D-pad optimized control buttons (play/pause, prev/next, seek, stop)

### Documents & Photos
- **PDF/Document viewer** — Embedded PDF.js renderer with reading progress sync
- **Photo viewer** — Full-screen image viewer with swipe gestures

### Remote Control Navigation
- **Three-zone focus system** — Sidebar navigation, content area, and back button focus zones
- **Programmatic focus** — Custom TV focus management via global key event dispatcher
- **Sidebar navigation** — Home / Browse / Favorites / Settings with D-pad selection
- **Grid & list navigation** — Smart grid cell navigation (up/down/left/right), horizontal shelf scrolling
- **Exit confirmation** — Back button shows exit dialog when in sidebar zone

### Branding & Visual
- **Dark theme** — Custom dark color palette optimized for TV viewing
- **TV launcher icon** — Properly sized Android TV launcher icon via `@react-native-tvos/config-tv`
- **TV banner** — 320×180 Android TV home screen banner
- **Splash screen** — Full-screen 1920×1080 splash background

### Multi-language
- **English (en)** and **Simplified Chinese (zh-CN)** UI translations
- Covers all screens: home, browse, favorites, settings, player, series, music, login

---

## Technical Details

- **Platform**: Android TV (API 21+), leanback required
- **Framework**: Expo SDK 52 + react-native-tvos 0.76.9-0
- **Navigation**: expo-router (file-based routing with Stack navigator)
- **State**: Zustand stores for auth, config, music player, series playback, TV focus
- **Video**: expo-av Video component with HLS support
- **Audio**: expo-av shared global audio engine for background music
- **Network**: Axios HTTP client with session token auth
- **PDF**: pdfjs-dist 3.11 for document rendering

---

## Package

```json
{
  "name": "vauldy-tv",
  "version": "0.1.0",
  "package": "com.knoxmedia.vauldy.tv"
}
```

---

## Known Limitations

- Audio-only playback uses a hidden Video component (expo-av limitation for audio-only)
- Large photo libraries may impact grid rendering performance
- HLS streaming requires server-side HLS transcoding support
- Document viewer supports PDF only; other document formats are not rendered

---

*Generated 2026-07-14*
