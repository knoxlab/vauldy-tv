export const OFFICE_DOCUMENT_FORMATS = new Set(["doc", "docx", "xls", "xlsx", "ppt", "pptx"]);
export const TEXT_DOCUMENT_FORMATS = new Set(["txt", "md", "mdx", "csv", "html", "htm"]);

export function normalizeDocumentFormat(
  format?: string,
  filePath?: string,
): string {
  const fmt = (format || "").toLowerCase().replace(/^\./, "");
  if (fmt) return fmt;
  const match = (filePath || "").match(/\.([a-z0-9]+)$/i);
  return match ? match[1].toLowerCase() : "";
}

export function isOfficeDocumentFormat(format: string): boolean {
  return OFFICE_DOCUMENT_FORMATS.has(format);
}

function escapeForHtmlJs(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/</g, "\\x3c");
}


function escapeHtmlAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

function pdfViewerShell(pdfJsScriptSrc: string, bodyScript: string): string {
  const src = escapeHtmlAttr(pdfJsScriptSrc);
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
  <style>
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #1a1a1a;
    }
    #wrap {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: auto;
    }
    canvas { display: block; max-width: 100%; height: auto; }
    #status {
      color: #bbb;
      font: 18px/1.5 sans-serif;
      padding: 24px;
      text-align: center;
    }
  </style>
  <script src="${src}"></script>
</head>
<body>
  <div id="wrap"><div id="status">Loading document…</div></div>
  <script>${bodyScript}</script>
</body>
</html>`;
}

function pdfViewerRuntime(loadSourceJs: string, initialPage: number): string {
  const page = Math.max(1, Math.floor(initialPage));
  return `(function () {
      var currentPage = ${page};
      var pdfDoc = null;
      var rendering = false;
      var pendingPage = 0;

      function post(msg) {
        if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
          window.ReactNativeWebView.postMessage(JSON.stringify(msg));
        }
      }

      function renderPage(num) {
        if (!pdfDoc) return;
        if (rendering) {
          pendingPage = num;
          return;
        }
        rendering = true;
        pdfDoc.getPage(num).then(function (page) {
          var viewport = page.getViewport({ scale: 1.35 });
          var canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          var wrap = document.getElementById('wrap');
          wrap.innerHTML = '';
          wrap.appendChild(canvas);
          return page.render({ canvasContext: canvas.getContext('2d'), viewport: viewport }).promise;
        }).then(function () {
          currentPage = num;
          rendering = false;
          post({ type: 'page', page: currentPage, pages: pdfDoc.numPages });
          if (pendingPage && pendingPage !== currentPage) {
            var next = pendingPage;
            pendingPage = 0;
            renderPage(next);
          }
        }).catch(function (err) {
          rendering = false;
          document.getElementById('wrap').innerHTML = '<div id="status">Render failed: ' + (err && err.message ? err.message : err) + '</div>';
          post({ type: 'error', message: String(err && err.message ? err.message : err) });
        });
      }

      window.goToPage = function (num) {
        if (!pdfDoc) return;
        var page = Math.max(1, Math.min(pdfDoc.numPages, Number(num) || 1));
        renderPage(page);
      };

      function resolvePdfJs() {
        return globalThis.pdfjsLib || globalThis["pdfjs-dist/build/pdf"] || window.pdfjsLib;
      }

      var bootAttempts = 0;
      function boot() {
        var pdfjsLib = resolvePdfJs();
        if (!pdfjsLib) {
          bootAttempts += 1;
          if (bootAttempts > 200) {
            document.getElementById('wrap').innerHTML = '<div id="status">pdf.js failed to load</div>';
            post({ type: 'error', message: 'pdfjsLib is not defined' });
            return;
          }
          setTimeout(boot, 50);
          return;
        }
        try {
          pdfjsLib.GlobalWorkerOptions.workerSrc = '';
          ${loadSourceJs}
        } catch (err) {
          document.getElementById('wrap').innerHTML = '<div id="status">Viewer failed: ' + err + '</div>';
          post({ type: 'error', message: String(err) });
        }
      }
      boot();
    })();`;
}

/** HTML viewer that renders a PDF with bundled pdf.js loaded via local script src. */
export function buildPdfViewerHtmlFromUrl(
  pdfUrl: string,
  pdfJsScriptSrc: string,
  initialPage = 1,
): string {
  const url = escapeForHtmlJs(pdfUrl);
  const loadSource = `pdfjsLib.getDocument({ url: '${url}', disableWorker: true }).promise.then(function (doc) {
          pdfDoc = doc;
          var start = Math.max(1, Math.min(doc.numPages, currentPage));
          renderPage(start);
          post({ type: 'ready', page: start, pages: doc.numPages });
        }).catch(function (err) {
          document.getElementById('wrap').innerHTML = '<div id="status">Open failed: ' + (err && err.message ? err.message : err) + '</div>';
          post({ type: 'error', message: String(err && err.message ? err.message : err) });
        });`;
  return pdfViewerShell(pdfJsScriptSrc, pdfViewerRuntime(loadSource, initialPage));
}

/** Fallback viewer — renders from base64 PDF bytes with bundled pdf.js. */
export function buildPdfViewerHtml(
  base64: string,
  pdfJsScriptSrc: string,
  initialPage = 1,
): string {
  const data = escapeForHtmlJs(base64);
  const loadSource = `function base64ToUint8Array(base64) {
          var raw = atob(base64);
          var len = raw.length;
          var bytes = new Uint8Array(len);
          for (var i = 0; i < len; i++) bytes[i] = raw.charCodeAt(i);
          return bytes;
        }
        pdfjsLib.getDocument({ data: base64ToUint8Array('${data}'), disableWorker: true }).promise.then(function (doc) {
          pdfDoc = doc;
          var start = Math.max(1, Math.min(doc.numPages, currentPage));
          renderPage(start);
          post({ type: 'ready', page: start, pages: doc.numPages });
        }).catch(function (err) {
          document.getElementById('wrap').innerHTML = '<div id="status">Open failed: ' + (err && err.message ? err.message : err) + '</div>';
          post({ type: 'error', message: String(err && err.message ? err.message : err) });
        });`;
  return pdfViewerShell(pdfJsScriptSrc, pdfViewerRuntime(loadSource, initialPage));
}

export function buildTextViewerHtml(text: string, format: string): string {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const isHtml = format === "html" || format === "htm";
  const body = isHtml
    ? text
    : `<pre style="white-space:pre-wrap;word-break:break-word;">${escaped}</pre>`;
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    html, body {
      margin: 0;
      padding: 24px;
      background: #1a1a1a;
      color: #e8e8e8;
      font: 18px/1.6 sans-serif;
    }
    pre { margin: 0; font: inherit; }
  </style>
</head>
<body>${body}</body>
</html>`;
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = "";
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

export function parseResumePage(position: unknown): number {
  if (typeof position === "number" && position > 0) return Math.floor(position);
  if (typeof position === "string") {
    if (position.startsWith("page:")) {
      const n = parseInt(position.slice(5), 10);
      return Number.isFinite(n) && n > 0 ? n : 1;
    }
    const n = parseInt(position, 10);
    return Number.isFinite(n) && n > 0 ? n : 1;
  }
  return 1;
}
