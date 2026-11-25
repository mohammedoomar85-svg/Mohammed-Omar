// Serves the PitchFits static site from the SITE KV namespace (files uploaded by _deploy/deploy.sh).
const TYPES = {
  html: "text/html; charset=utf-8", css: "text/css; charset=utf-8", js: "text/javascript; charset=utf-8",
  svg: "image/svg+xml", jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", ico: "image/x-icon"
};
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let key = decodeURIComponent(url.pathname).replace(/^\/+/, "");
    if (key === "" || key.endsWith("/")) key += "index.html";
    let body = await env.SITE.get(key, "arrayBuffer");
    if (body === null && !key.includes(".")) { key += ".html"; body = await env.SITE.get(key, "arrayBuffer"); }
    if (body === null) {
      const nf = await env.SITE.get("index.html", "arrayBuffer");
      return new Response(nf, { status: 404, headers: { "content-type": TYPES.html } });
    }
    const ext = key.split(".").pop().toLowerCase();
    const cache = ext === "html" ? "public, max-age=60" : "public, max-age=3600";
    return new Response(body, { headers: { "content-type": TYPES[ext] || "application/octet-stream", "cache-control": cache } });
  }
};
