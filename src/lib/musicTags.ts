export function parseMusicTags(metaJson?: string): { artist: string; album: string } {
  if (!metaJson) return { artist: "", album: "" };
  try {
    const raw = JSON.parse(metaJson) as { format?: { tags?: Record<string, string> } };
    const tags = raw.format?.tags ?? {};
    const artist =
      tags.artist ||
      tags.ARTIST ||
      tags.album_artist ||
      tags.ALBUMARTIST ||
      tags.AlbumArtist ||
      "";
    const album = tags.album || tags.ALBUM || "";
    return { artist: artist.trim(), album: album.trim() };
  } catch {
    return { artist: "", album: "" };
  }
}
