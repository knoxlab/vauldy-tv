export type ParsedMediaMeta = {
  overview: string;
  releaseDate: string;
  rating: number;
  poster: string;
  backdrop: string;
  genres: string[];
  director: string[];
  certification: string;
};

function readNameList(...sources: unknown[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const src of sources) {
    if (typeof src === "string") {
      for (const part of src.split(/[,、/|]/)) {
        const s = part.trim();
        if (!s) continue;
        const key = s.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(s);
      }
      continue;
    }
    if (!Array.isArray(src)) continue;
    for (const item of src) {
      const s =
        typeof item === "string"
          ? item.trim()
          : item && typeof item === "object" && typeof (item as { name?: unknown }).name === "string"
            ? (item as { name: string }).name.trim()
            : "";
      if (!s) continue;
      const key = s.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(s);
    }
  }
  return out;
}

export function parseMediaMeta(metaJson?: string): ParsedMediaMeta {
  const empty: ParsedMediaMeta = {
    overview: "",
    releaseDate: "",
    rating: 0,
    poster: "",
    backdrop: "",
    genres: [],
    director: [],
    certification: "",
  };
  if (!metaJson) return empty;
  try {
    const raw = JSON.parse(metaJson) as {
      scrape?: {
        overview?: string;
        release_date?: string;
        rating?: number;
        poster?: string;
        backdrop?: string;
        genres?: string[];
        extra?: Record<string, unknown>;
      };
    };
    const scrape = raw.scrape;
    if (!scrape) return empty;
    const extra = scrape.extra || {};
    const genres = Array.isArray(scrape.genres)
      ? scrape.genres.filter((g): g is string => typeof g === "string" && g.trim().length > 0)
      : [];
    const certRaw =
      extra.certification ?? extra.rated ?? extra.mpaa_rating ?? extra.content_rating ?? extra.parental_rating;
    const pick = (a: string, b: string) => {
      const x = (a || "").trim();
      if (x) return x;
      return (b || "").trim();
    };
    return {
      overview: (scrape.overview || "").trim(),
      releaseDate: (scrape.release_date || "").trim(),
      rating: typeof scrape.rating === "number" ? scrape.rating : 0,
      poster: pick(typeof extra.poster === "string" ? extra.poster : "", typeof scrape.poster === "string" ? scrape.poster : ""),
      backdrop: pick(
        typeof extra.backdrop === "string" ? extra.backdrop : "",
        typeof scrape.backdrop === "string" ? scrape.backdrop : "",
      ),
      genres,
      director: readNameList(extra.director, extra.directors, extra.crew),
      certification: typeof certRaw === "string" ? certRaw.trim() : "",
    };
  } catch {
    return empty;
  }
}

export function formatMetaRating(rating: number): string | null {
  if (!rating || Number.isNaN(rating) || rating <= 0) return null;
  if (rating <= 10) return `${rating.toFixed(1)}/10`;
  return `${Math.round(rating)}%`;
}
