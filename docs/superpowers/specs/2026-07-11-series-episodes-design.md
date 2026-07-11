# TV Series Episodes — Design Spec

**Date:** 2026-07-11  
**App:** Vauldy-TV  
**Status:** Approved in conversation (approach A; next-episode = 10s cancellable countdown; season UI = horizontal tabs)

## Problem

TV / anime libraries are currently browsed as a flat list of video files. Users expect series → season → episode navigation, watched status on each episode, play-from-list, and auto-advance to the next episode after finish.

Backend and Web already expose the hierarchy APIs and playback session pattern. Vauldy-TV must adopt the same model.

## Goals

1. TV/anime library browse shows **series** cards, not individual episode files.
2. Opening a series shows a **detail page** with season tabs and an episode list.
3. Each episode row shows **watched / in-progress** state; OK plays that episode (resume position when available).
4. When an episode finishes, show a **10-second “Next episode” countdown** (confirm = play now, back/cancel = dismiss).
5. Last episode of the series: no next-episode prompt.

## Non-goals (this iteration)

- Multi-version picker UI (always use primary / first version)
- Mark watched / unwatched context menu
- Series metadata editing
- Flat-file override mode for TV libraries
- Changing movie / music / photo library flows

## Decisions

| Topic | Choice |
|-------|--------|
| Architecture | Align with Web: series APIs + in-memory play session |
| Season UI | Horizontal season tabs + episode list for selected season |
| Next episode | 10s countdown overlay, cancellable |
| Episode versions | First version in `versions[]` (by `sort_order` / API order) |

## User flows

### Browse

1. User opens a library with type `tv` or `anime`.
2. App calls `GET /api/v1/library/:id/series`.
3. Grid shows series posters (title, year, season/episode counts if useful).
4. OK → `/series/:id`.

### Series detail

1. Load `GET /api/v1/series/:id` (title, poster, seasons).
2. Default selected season: first season, or the season containing the play-target episode when available.
3. Load `GET /api/v1/season/:id/episodes` for the selected season.
4. Header actions:
   - **Continue** → `GET /api/v1/series/:id/play-target` → player with `media_id` + seek `position`
   - **Play from start** → first episode of first season (or first available), position 0
5. Episode row OK → player for that episode’s primary `media_id`, seek if in-progress (position from history/play-target when known; otherwise start).

### Episode row display

| State | UI |
|-------|-----|
| Never played | Episode number, title, duration |
| In progress | Same + progress indicator / “Continue” cue |
| Completed (`versions[].completed`) | Same + “已看完” / checkmark |

Progress bar for in-progress: prefer data already on the episode/version if present; otherwise omit bar and only show completed badge when `completed` is true. Do not invent progress percentages without API fields.

### Playback + next episode

1. Before navigating to the player, build a full-series `order: number[]` of primary `media_id`s across all seasons (ascending season_num, then episode_num).
2. Store session in a small Zustand (or module) store: `{ seriesId, order }` (AsyncStorage optional; in-memory is enough for one viewing session).
3. Route: `/player/:mediaId?series_id=&index=` (and optional `t=` seconds for resume).
4. On natural end / `completed` save:
   - If next `media_id` exists in `order` → show overlay “下一集” with 10s countdown.
   - Confirm / timeout → replace route to next episode (same series session).
   - Back / Cancel → hide overlay, stay on ended state or exit player per existing back behavior.
5. If no next episode → clear series session; no overlay.

## API surface (Vauldy-TV client)

Add to `src/api/types.ts` and `src/api/client.ts` (mirror Web):

- `SeriesSummary` — list row from `/library/:id/series`
- `SeriesDetail` — `/series/:id` including `seasons[]`
- `SeasonSummary` — `id`, `season_num`, `name`, `episode_count`, …
- `EpisodeRow` — `id`, `episode_num`, `title`, `duration`, `versions[]`
- `EpisodeVersion` — `media_id`, `title`, `duration`, `poster_url`, `completed`, …
- `SeriesPlayTarget` — `{ media_id, position }`

Functions:

- `fetchLibrarySeries(libraryId)`
- `fetchSeries(seriesId)`
- `fetchSeasonEpisodes(seasonId)`
- `fetchSeriesPlayTarget(seriesId)`

Existing: `saveProgress`, `playbackStart` / `playbackEnd`, player HLS/play URLs.

## Screens & files

| Piece | Path | Responsibility |
|-------|------|----------------|
| Library branch | `app/library/[id].tsx` | If TV library → series grid; else existing media/music |
| Series card | reuse / thin wrap `MediaCard` or small `SeriesCard` | Poster + title |
| Series detail | `app/series/[id].tsx` | Seasons tabs, episode list, continue/start |
| Episode list UI | `src/components/series/EpisodeList.tsx` (or inline) | Focusable rows + watched state |
| Series play session | `src/store/seriesPlay.ts` + `src/lib/seriesPlayback.ts` | order, next resolve, clear |
| Player | `app/player/[id].tsx` | Read query params; resume `t`; next-episode overlay |
| i18n | `src/i18n/zh-CN.ts`, `en.ts` | Series / episode / next-episode strings |
| Library helper | `src/lib/library.ts` | Keep `isTVLibraryType`; optionally align aliases with Web |

Remote focus: follow existing `useTvRemoteNav` patterns (season tabs horizontal; episode list vertical; back button zone).

## Edge cases

- Series with zero seasons / empty episodes → empty state, no play actions.
- Episode with empty `versions` → row disabled / skip in play order.
- Play-target media not in built order → still play target; rebuild order best-effort; next-episode may be unavailable until order includes it.
- User opens player from Continue Watching (history `media_id`) without `series_id` → no next-episode overlay (out of scope unless history items later carry series context).
- Leaving player clears countdown timer; series session may remain until series finishes or user starts unrelated video playback (clear session when starting non-series play).

## Acceptance criteria

- [ ] TV/anime library lists series, not flat episode files.
- [ ] Series detail shows season tabs and episode list with completed indicator.
- [ ] Selecting an episode starts playback of that episode.
- [ ] Continue / Play from start use play-target / first episode correctly.
- [ ] Finishing an episode (not last) shows 10s next-episode prompt; confirm and timeout both advance; cancel dismisses.
- [ ] Finishing the last episode does not show next-episode prompt.
- [ ] Movie libraries and non-series video play unchanged.

## References

- SRS §4.3.3 — `Vauldy-TV/doc/电视端需求规格书.md`
- Web: `web/src/pages/SeriesDetail.tsx`, `web/src/lib/seriesPlayback.ts`, `web/src/api/client.ts`
- Backend: `api/handler/series.go`, `GET /library/:id/series`, `/series/:id`, `/season/:id/episodes`, `/series/:id/play-target`
