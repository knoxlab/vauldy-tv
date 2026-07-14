# Vauldy TV

Expo + `react-native-tvos` client for the Vauldy media server, targeting **Android TV** and **Apple TV (tvOS)**. See `README.md` for the product overview, project layout, and standard dev commands.

## Cursor Cloud specific instructions

- Package manager is **npm** (`package-lock.json`). `.npmrc` sets `legacy-peer-deps=true`, which is required for install to resolve the `react-native-tvos` / React peer set — don't switch package managers or drop that flag.
- `postinstall` runs `node scripts/embed-pdfjs.mjs`, which copies `pdfjs-dist` into `assets/pdfjs/pdf.min.bundle` (gitignored). It runs automatically on `npm install`; run `npm run embed-pdfjs` manually only if that asset is missing.
- Headless-friendly checks (no device/backend needed): `npm run typecheck` (`tsc --noEmit`) and `npm test` (`vitest run`). There is **no ESLint/Prettier config**; `typecheck` is the static-analysis gate.
- The `android` / `prebuild:tv` / `apk:*` npm scripts are **Windows PowerShell** wrappers (`scripts/*.ps1`, hardcoded Windows Android SDK/JDK paths) and do **not** run on the Linux VM. On Linux use the Expo CLI directly, e.g. `npx expo start`, `npx expo export --platform android`, `npx expo prebuild`.
- No Android/tvOS emulator or simulator is available on the cloud VM, so the full TV UI cannot be launched here. To validate the app in dev mode without a device: start Metro with `CI=1 npx expo start` and fetch the dev bundle to force a full compile:
  `curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:8081/node_modules/expo-router/entry.bundle?platform=android&dev=true&transform.routerRoot=app"` (expect `200`). `npx expo export --platform android` also produces a full Hermes bundle.
- Run Metro with `CI=1` in this environment; otherwise `expo start` opens interactive watch mode and blocks the terminal waiting for TTY input.
- End-to-end functional testing (login, browse, playback) needs the external **Vauldy backend** (not in this repo; default `http://127.0.0.1:8200`, demo login `admin` / `admin123`). The app's `src/api/client.ts` + Zustand stores can be exercised headlessly against a mock HTTP server via a Vitest test. Note: the Zustand `persist` middleware backs onto AsyncStorage and logs a harmless `window is not defined` warning under the Node test environment — it does not affect logic or assertions.
