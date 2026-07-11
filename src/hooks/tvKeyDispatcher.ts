/**
 * Single global TV key dispatcher.
 *
 * On Android TV, `useTVEventHandler` from react-native can silently drop
 * events when multiple components each register their own listener.  This
 * module installs ONE `useTVEventHandler` in the root layout and fans the
 * event out to every registered callback.
 *
 * Priority handlers run first (main-shell sidebar/content).  Supports event
 * consumption: the first handler that processes an event can call
 * `consumeTvKeyEvent(evt)` to stop further handlers from seeing it.
 */

export type TvKeyEvent = {
  eventType: string;
  _consumed?: boolean;
  [key: string]: unknown;
};

type Handler = (evt: TvKeyEvent) => void;

const handlers = new Set<Handler>();
const priorityHandlers = new Set<Handler>();

/** Register a normal handler. Returns an unsubscribe function. */
export function registerTvKeyHandler(handler: Handler): () => void {
  handlers.add(handler);
  return () => {
    handlers.delete(handler);
  };
}

/** Register a priority handler (runs before normal handlers). */
export function registerPriorityTvKeyHandler(handler: Handler): () => void {
  priorityHandlers.add(handler);
  return () => {
    priorityHandlers.delete(handler);
  };
}

/** Mark an event as consumed so no further handlers process it. */
export function consumeTvKeyEvent(evt: TvKeyEvent) {
  evt._consumed = true;
}

/** Dispatch an event to all registered handlers (stops at first consumed). */
export function dispatchTvKeyEvent(evt: TvKeyEvent) {
  evt._consumed = false;
  for (const h of priorityHandlers) {
    if (evt._consumed) break;
    h(evt);
  }
  for (const h of handlers) {
    if (evt._consumed) break;
    h(evt);
  }
}
