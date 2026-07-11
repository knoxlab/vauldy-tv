import { create } from "zustand";
import type { SeriesPlaySession } from "@/lib/seriesPlayback";

type SeriesPlayState = {
  session: SeriesPlaySession | null;
  setSession: (seriesId: number, order: number[]) => void;
  clearSession: () => void;
};

export const useSeriesPlayStore = create<SeriesPlayState>((set) => ({
  session: null,
  setSession: (seriesId, order) =>
    set({ session: { seriesId, order: order.filter((id) => id > 0) } }),
  clearSession: () => set({ session: null }),
}));
