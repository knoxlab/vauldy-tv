# AGENTS.md

## Cursor Cloud specific instructions

Vauldy TV is an **Expo + react-native-tvos** client (Android TV / Apple tvOS) for a Vauldy media server. Standard commands live in `README.md` and `package.json` — this section only records non-obvious cloud caveats.

### Environment / dependencies
- Node 20+ (the cloud VM ships Node 22, which works).
- `npm install` is the only setup step; the `postinstall` hook (`scripts/embed-pdfjs.mjs`) copies `pdfjs-dist` into `assets/pdfjs/pdf.min.bundle`, so it must run *after* deps are present.
- `.npmrc` sets `legacy-peer-deps=true`; this is required because `react-native` is aliased to `react-native-tvos` and peer ranges otherwise conflict. Use plain `npm install` (not `--legacy-peer-deps` flags).

### Lint / test / build (work headlessly on Linux)
- Typecheck: `npm run typecheck` (`tsc --noEmit`). This is the lint/static-check gate — there is no ESLint config.
- Tests: `npm test` (`vitest run`); test files use the `@/` alias for `src/`.
- Bundle the whole app end-to-end: `npx expo export --platform android --output-dir /tmp/expo-export` (produces a Hermes bundle; good smoke test that all app code compiles through Metro).
- Metro dev server: `npx expo start`.

### Running the actual app (gotchas)
- The `npm run android` / `npm run ios` / `npm run prebuild:tv` / `apk:*` scripts are **Windows PowerShell wrappers** (`scripts/*.ps1`) and do not run on Linux/macOS as-is. They also need an Android TV emulator/SDK or Xcode + Apple TV simulator (macOS only) — none are available in the cloud VM, so the native TV app cannot be launched here.
- **Web is not a supported platform** (`app.json` `platforms` is `["ios","android"]`). For a headless UI smoke test you can *temporarily* add `"web"` to `platforms`, `npm install --no-save react-native-web`, and run `npx expo start --web`. Caveat: `useTVEventHandler` (from react-native-tvos) does not exist on web and must be shimmed to a no-op, e.g. in `app/_layout.tsx`. This is a throwaway workaround for testing only — do not commit it.
- The app needs a running **Vauldy media server** backend (default `http://127.0.0.1:8200`, demo login `admin` / `admin123`). Without it, only the "Server setup" screen renders before health checks fail.
