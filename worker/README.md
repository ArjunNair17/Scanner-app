# Protein Scanner Worker

Cloudflare Worker that accepts a raw JPEG and asks Gemini for a structured plate estimate.

## Endpoints

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/health` | `{ ok, model }` |
| `POST` | `/api/scan` | Raw `image/jpeg` body + `x-device-id` |
| `GET` | `/privacy` `/support` `/terms` | Placeholder legal pages |

## Request contract

The iOS client **must not** send JSON base64. Example:

```bash
curl -X POST "$WORKER_URL/api/scan" \
  -H "content-type: image/jpeg" \
  -H "x-device-id: 00000000-0000-4000-8000-000000000001" \
  --data-binary @plate.jpg
```

- Body larger than **1.5 MB** → `413` `{ "error": "too_large" }`
- About **40 scans / device / UTC day** → `429` `{ "error": "rate_limited" }`
- Other JSON errors: `bad_image`, `model_parse`, `upstream`, `timeout`

## FOOD_SCHEMA

```json
{
  "identified": true,
  "name": "string",
  "ingredients": ["string"],
  "calories": 0,
  "protein_g": 0,
  "fat_g": 0,
  "carbs_g": 0,
  "serving_description": "string",
  "confidence": 0
}
```

`identified=false` when the image is not food. The client does **not** consume a free scan in that case.

## Secrets

Set `GEMINI_API_KEY` as a Wrangler secret. **Do not commit it.**

```bash
cd worker
npx wrangler login
npx wrangler secret put GEMINI_API_KEY
npx wrangler deploy
```

Local:

```bash
echo 'GEMINI_API_KEY=your-key' > .dev.vars
npx wrangler dev
```

`GEMINI_MODEL` defaults to `gemini-2.5-flash-lite` in `wrangler.toml` (Gemini 2.0 Flash is shut down).

## Tests

From the repo root: `npm test`  
Or: `cd worker && npm test`
