import { create } from "zustand";
import type { MediaItem } from "@/api/types";

type PlayerState = {
  mediaId: number | null;
  title: string | null;
  fileType: string | null;
  poster: string | null;
  playing: boolean;
  setNowPlaying: (item: Pick<MediaItem, "id" | "title" | "file_type">, poster?: string | null) => void;
  setPlaying: (playing: boolean) => void;
  clear: () => void;
};

export const usePlayerStore = create<PlayerState>((set) => ({
  mediaId: null,
  title: null,
  fileType: null,
  poster: null,
  playing: false,
  setNowPlaying: (item, poster = null) =>
    set({ mediaId: item.id, title: item.title, fileType: item.file_type, poster, playing: true }),
  setPlaying: (playing) => set({ playing }),
  clear: () => set({ mediaId: null, title: null, fileType: null, poster: null, playing: false }),
}));
