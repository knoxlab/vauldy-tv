import { Asset } from "expo-asset";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDFJS_BUNDLE = require("../../assets/pdfjs/pdf.min.bundle");

export type BundledPdfJsAsset = {
  /** Directory URL ending with / — used as WebView baseUrl. */
  baseUrl: string;
  /** Relative script filename for <script src>. */
  scriptSrc: string;
};

/** Resolve bundled pdf.min.js as a local file for WebView <script src> (offline). */
export async function resolveBundledPdfJsAsset(): Promise<BundledPdfJsAsset> {
  const asset = Asset.fromModule(PDFJS_BUNDLE);
  await asset.downloadAsync();
  const uri = asset.localUri ?? asset.uri;
  const lastSlash = uri.lastIndexOf("/");
  if (lastSlash < 0) throw new Error("Invalid pdf.js asset URI");
  return {
    baseUrl: uri.slice(0, lastSlash + 1),
    scriptSrc: uri.slice(lastSlash + 1),
  };
}
