/**
 * UPIlink short-link service: a tiny Cloudflare Worker + KV store (free tier).
 *
 *   POST /api/shorten  {"url": "https://you.github.io/UPIlink/?pa=..."}  ->  {"short": "https://<worker>/Ab3dEf7"}
 *   GET  /Ab3dEf7                                                       ->  302 to the saved payment page
 *
 * Safety rules built in:
 *  - Only links that point at YOUR payment page (SITE_ORIGIN + SITE_PATH) and carry a UPI ID are accepted,
 *    so this can't be used as an open redirect or to hide other websites.
 *  - Only your site (SITE_ORIGIN) may call the API from a browser.
 *  - The same link always gets the same short code, so repeats don't fill the store.
 */

const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const CODE_LENGTH = 7;
const MAX_URL_LENGTH = 600;

function json(body, status, headers) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

async function codeFor(text, salt) {
  const bytes = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(salt + text)));
  let n = 0n;
  for (let i = 0; i < 8; i++) n = (n << 8n) | BigInt(bytes[i]);
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += ALPHABET[Number(n % 62n)];
    n /= 62n;
  }
  return code;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const sitePath = env.SITE_PATH || "/";
    const home = env.SITE_ORIGIN + sitePath;
    const cors = {
      "Access-Control-Allow-Origin": env.SITE_ORIGIN,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
      Vary: "Origin",
    };

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

    if (request.method === "POST" && url.pathname === "/api/shorten") {
      if (request.headers.get("Origin") !== env.SITE_ORIGIN) return json({ error: "forbidden" }, 403, cors);

      let target;
      try {
        const body = await request.json();
        if (typeof body.url !== "string" || body.url.length > MAX_URL_LENGTH) throw new Error("bad url");
        target = new URL(body.url);
      } catch (e) {
        return json({ error: "bad request" }, 400, cors);
      }
      if (!target.href.startsWith(home) || !target.searchParams.get("pa")) {
        return json({ error: "not a payment link for this site" }, 400, cors);
      }

      // Same link -> same code. On the (very unlikely) clash, add a salt and try again.
      let code;
      for (let salt = 0; salt < 5; salt++) {
        code = await codeFor(target.href, String(salt));
        const existing = await env.LINKS.get(code);
        if (existing === null) {
          await env.LINKS.put(code, target.href);
          break;
        }
        if (existing === target.href) break;
        code = null;
      }
      if (!code) return json({ error: "try again" }, 503, cors);
      return json({ short: url.origin + "/" + code }, 200, cors);
    }

    if (request.method === "GET" || request.method === "HEAD") {
      const code = url.pathname.slice(1);
      if (new RegExp("^[0-9A-Za-z]{" + CODE_LENGTH + "}$").test(code)) {
        const target = await env.LINKS.get(code);
        if (target) return Response.redirect(target, 302);
      }
      return Response.redirect(home, 302);
    }

    return new Response("Method not allowed", { status: 405 });
  },
};
