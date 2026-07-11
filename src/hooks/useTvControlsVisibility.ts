import { useEffect, useRef } from "react";

const DEFAULT_HIDE_MS = 5000;

export function useTvControlsVisibility(hideAfterMs = DEFAULT_HIDE_MS) {
  const visibleRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const scheduleHide = (setVisible: (v: boolean) => void) => {
    clearTimer();
    timerRef.current = setTimeout(() => {
      visibleRef.current = false;
      setVisible(false);
    }, hideAfterMs);
  };

  const show = (setVisible: (v: boolean) => void) => {
    visibleRef.current = true;
    setVisible(true);
    scheduleHide(setVisible);
  };

  const bump = (setVisible: (v: boolean) => void) => {
    if (visibleRef.current) {
      scheduleHide(setVisible);
      return;
    }
    show(setVisible);
  };

  useEffect(() => clearTimer, []);

  return { show, bump, scheduleHide, clearTimer };
}
