import { useCallback, useEffect, useRef, useState } from "react";
import { Platform, useTVEventHandler } from "react-native";
import { useIsFocused } from "@react-navigation/native";

export const TV_NAV_ENABLED = Platform.OS === "android" || Platform.isTV;

type BaseOpts = {
  count: number;
  enabled?: boolean;
  requireScreenFocus?: boolean;
  initialIndex?: number;
  onSelect?: (index: number) => void;
  onIndexChange?: (index: number) => void;
  onExitLeft?: () => void;
  onExitUp?: () => void;
  onExitDown?: () => void;
};

type GridOpts = BaseOpts & {
  mode: "grid";
  columns: number;
};

type LinearOpts = BaseOpts & {
  mode: "horizontal" | "vertical";
};

type ControlOpts = {
  mode: "controls";
  count: number;
  enabled?: boolean;
  requireScreenFocus?: boolean;
  initialIndex?: number;
  loop?: boolean;
  onSelect?: (index: number) => void;
  onIndexChange?: (index: number) => void;
  onExitUp?: () => void;
  onExitDown?: () => void;
  onExitLeft?: () => void;
};

export type TvRemoteNavOpts = GridOpts | LinearOpts | ControlOpts;

function clampIndex(index: number, count: number) {
  if (count <= 0) return 0;
  return Math.max(0, Math.min(count - 1, index));
}

export function useTvRemoteNav(opts: TvRemoteNavOpts) {
  const {
    count,
    enabled = TV_NAV_ENABLED,
    requireScreenFocus = true,
    initialIndex = 0,
    onSelect,
    onIndexChange,
  } = opts;
  const screenFocused = useIsFocused();
  const [index, setIndex] = useState(() => clampIndex(initialIndex, count));
  const indexRef = useRef(index);
  indexRef.current = index;

  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const onExitLeftRef = useRef(opts.onExitLeft);
  onExitLeftRef.current = opts.onExitLeft;
  const onExitUpRef = useRef(opts.onExitUp);
  onExitUpRef.current = opts.onExitUp;
  const onExitDownRef = useRef(opts.onExitDown);
  onExitDownRef.current = opts.onExitDown;

  const active = enabled && count > 0 && (!requireScreenFocus || screenFocused);

  useEffect(() => {
    setIndex((prev) => clampIndex(prev, count));
  }, [count]);

  const moveTo = useCallback(
    (next: number) => {
      const clamped = clampIndex(next, count);
      indexRef.current = clamped;
      setIndex(clamped);
      onIndexChange?.(clamped);
    },
    [count, onIndexChange],
  );

  useTVEventHandler((evt) => {
    if (!active) return;
    const type = evt.eventType;
    const current = indexRef.current;

    if (type === "select") {
      onSelectRef.current?.(current);
      return;
    }

    if (opts.mode === "horizontal") {
      if (type === "left") {
        if (current <= 0) onExitLeftRef.current?.();
        else moveTo(current - 1);
      }
      if (type === "right") moveTo(current + 1);
      if (type === "up") onExitUpRef.current?.();
      if (type === "down") onExitDownRef.current?.();
      return;
    }

    if (opts.mode === "vertical") {
      if (type === "up") {
        if (current <= 0) onExitUpRef.current?.();
        else moveTo(current - 1);
      }
      if (type === "down") {
        if (current >= count - 1) onExitDownRef.current?.();
        else moveTo(current + 1);
      }
      if (type === "left") onExitLeftRef.current?.();
      return;
    }

    if (opts.mode === "grid") {
      const { columns } = opts;
      const row = Math.floor(current / columns);
      const col = current % columns;
      const maxRow = Math.floor((count - 1) / columns);

      if (type === "left") {
        if (col > 0) moveTo(current - 1);
        else onExitLeftRef.current?.();
      }
      if (type === "right" && col < columns - 1 && current + 1 < count) moveTo(current + 1);
      if (type === "up") {
        if (row > 0) moveTo(current - columns);
        else onExitUpRef.current?.();
      }
      if (type === "down") {
        if (row < maxRow && current + columns < count) moveTo(current + columns);
        else onExitDownRef.current?.();
      }
      return;
    }

    if (opts.mode === "controls") {
      const loop = opts.loop ?? true;
      if (type === "left") {
        if (current > 0) moveTo(current - 1);
        else if (loop) moveTo(count - 1);
        else onExitLeftRef.current?.();
      }
      if (type === "right") {
        if (current < count - 1) moveTo(current + 1);
        else if (loop) moveTo(0);
      }
      if (type === "up") onExitUpRef.current?.();
      if (type === "down") onExitDownRef.current?.();
    }
  });

  return { index: active ? index : -1, setIndex: moveTo, active };
}
