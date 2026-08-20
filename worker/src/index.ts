import { jsonError, statusFor } from "./errors.ts";
import { parseModelText } from "./parse.ts";
import { DAILY_LIMIT, nextCount, rateKey, utcDayKey } from "./ratelimit.ts";
import { FOOD_SCHEMA, SCAN_PROMPT } from "./schema.ts";

export interface Env {
  GEMINI_API_KEY: string;
  GEMINI_MODEL?: string;
  RATE_LIMIT?: KVNamespace;
}

const MAX_BYTES = Math.floor(1.5 * 1024 * 1024);
const DEFAULT_MODEL = "gemini-2.5-flash-lite";

function cors(res: Response): Response {
  const headers = new Headers(res.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Headers", "content-type, x-device-id");
  headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  return new Response(res.body, { status: res.status, headers });
}

async function checkLimit(env: Env, deviceId: string): Promise<boolean> {
  const key = rateKey(deviceId, utcDayKey());
  if (env.RATE_LIMIT) {
    const current = Number((await env.RATE_LIMIT.get(key)) || "0") || 0;
    const { allowed, next } = nextCount(current);
    if (!allowed) return false;
    await env.RATE_LIMIT.put(key, String(next), { expirationTtl: 172800 });
    return true;
  }
  const cache = (globalThis as { caches?: { default: Cache } }).caches?.default;
  if (!cache) return true;
  const req = new Request(`https://protein-scanner.rate/${key}`);
  const hit = await cache.match(req);
  const current = hit ? Number(await hit.text()) || 0 : 0;
  const { allowed, next } = nextCount(current);
  if (!allowed) return false;
  await cache.put(
    req,
    new Response(String(next), { headers: { "Cache-Control": "max-age=172800" } }),
  );
  return true;
}

async function handleScan(req: Request, env: Env): Promise<Response> {
  const deviceId = req.headers.get("x-device-id")?.trim();
  if (!deviceId) {
    return jsonError("bad_image", 400, { message: "x-device-id required" });
  }

  const contentType = (req.headers.get("content-type") || "").toLowerCase();
  if (contentType.includes("application/json")) {
    return jsonError("bad_image", 400, { message: "send raw image/jpeg bytes, not JSON" });
  }

  const buf = await req.arrayBuffer();
  if (buf.byteLength > MAX_BYTES) {
    return Response.json({ error: "too_large" }, { status: 413 });
  }
  if (buf.byteLength < 32) {
    return jsonError("bad_image", statusFor("bad_image"));
  }

  if (!(await checkLimit(env, deviceId))) {
    return jsonError("rate_limited", statusFor("rate_limited"));
  }

  const model = env.GEMINI_MODEL || DEFAULT_MODEL;
  const key = env.GEMINI_API_KEY;
  if (!key) {
    return jsonError("upstream", statusFor("upstream"), { message: "GEMINI_API_KEY missing" });
  }

  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
  const b64 = btoa(binary);

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
  const payload = {
    contents: [
      {
        role: "user",
        parts: [
          { text: SCAN_PROMPT },
          { inline_data: { mime_type: "image/jpeg", data: b64 } },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json",
      responseSchema: FOOD_SCHEMA,
    },
  };

  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), 25000);
  let upstream: Response;
  try {
    upstream = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      signal: ac.signal,
    });
  } catch (err) {
    const aborted = (err as { name?: string }).name === "AbortError";
    return jsonError(aborted ? "timeout" : "upstream", statusFor(aborted ? "timeout" : "upstream"));
  } finally {
    clearTimeout(timer);
  }

  if (!upstream.ok) {
    return jsonError("upstream", statusFor("upstream"));
  }

  let data: { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  try {
    data = (await upstream.json()) as typeof data;
  } catch {
    return jsonError("model_parse", statusFor("model_parse"));
  }

  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";
  if (!text) {
    return jsonError("model_parse", statusFor("model_parse"));
  }

  try {
    const food = parseModelText(text);
    return Response.json(food);
  } catch {
    return jsonError("model_parse", statusFor("model_parse"));
  }
}

const PRIVACY = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Privacy · Protein Scanner</title></head><body style="font-family:system-ui;max-width:40rem;margin:2rem auto;padding:0 1rem;line-height:1.5"><h1>Privacy Policy</h1><p>Protein Scanner: AI Calories (“Protein Scanner”) estimates nutrition from a photo you take.</p><p>A photo is sent to our Worker and then to Google Gemini to identify the plate. We do not keep the photo after the scan response. Meal logs stay on your iPhone. There is no account and no HealthKit.</p><p>Device id is a random local identifier used only for rate limits. Support: <a href="mailto:support@proteinsnap.app">support@proteinsnap.app</a></p><p>Placeholder page — replace with counsel-reviewed copy before App Store submission.</p></body></html>`;

const SUPPORT = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Support · Protein Scanner</title></head><body style="font-family:system-ui;max-width:40rem;margin:2rem auto;padding:0 1rem;line-height:1.5"><h1>Support</h1><p>Email <a href="mailto:support@proteinsnap.app">support@proteinsnap.app</a></p><p>Protein Scanner is not a medical device and is not affiliated with Novo Nordisk, Eli Lilly, or any pharmacy. Estimates only. Not medical advice.</p></body></html>`;

const TERMS = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Terms · Protein Scanner</title></head><body style="font-family:system-ui;max-width:40rem;margin:2rem auto;padding:0 1rem;line-height:1.5"><h1>Terms of Use</h1><p>You may use Apple’s standard EULA: <a href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/">https://www.apple.com/legal/internet-services/itunes/dev/stdeula/</a></p><p>Estimates are AI-generated and may be wrong. Not medical advice. Subscriptions auto-renew via Apple In-App Purchase until you cancel in App Store settings.</p><p>Placeholder page — replace with counsel-reviewed copy before App Store submission.</p></body></html>`;

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    if (req.method === "OPTIONS") {
      return cors(new Response(null, { status: 204 }));
    }
    const url = new URL(req.url);
    const path = url.pathname.replace(/\/$/, "") || "/";

    if (req.method === "GET" && path === "/health") {
      return cors(
        Response.json({
          ok: true,
          model: env.GEMINI_MODEL || DEFAULT_MODEL,
        }),
      );
    }
    if (req.method === "GET" && path === "/privacy") {
      return cors(new Response(PRIVACY, { headers: { "content-type": "text/html; charset=utf-8" } }));
    }
    if (req.method === "GET" && path === "/support") {
      return cors(new Response(SUPPORT, { headers: { "content-type": "text/html; charset=utf-8" } }));
    }
    if (req.method === "GET" && path === "/terms") {
      return cors(new Response(TERMS, { headers: { "content-type": "text/html; charset=utf-8" } }));
    }
    if (req.method === "POST" && path === "/api/scan") {
      return cors(await handleScan(req, env));
    }
    return cors(Response.json({ error: "not_found" }, { status: 404 }));
  },
};
