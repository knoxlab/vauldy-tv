import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useRef } from "react";
import type { TvKeyEvent } from "@/hooks/tvKeyDispatcher";
import { useTvFocusStore } from "@/store/tvFocus";

/**
 * Register a TV key handler for the currently focused main-tab content screen.
 * Only one screen may register at a time; unfocused screens auto-unregister.
 */
export function useMainContentNav(handler: (evt: TvKeyEvent) => boolean) {
  const setContentKeyHandler = useTvFocusStore((s) => s.setContentKeyHandler);
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useFocusEffect(
    useCallback(() => {
      const wrapped = (evt: TvKeyEvent) => handlerRef.current(evt);
      setContentKeyHandler(wrapped);
      return () => setContentKeyHandler(null);
    }, [setContentKeyHandler]),
  );
}
