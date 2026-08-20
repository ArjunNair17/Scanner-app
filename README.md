# Protein Scanner: AI Calories

Photograph a plate. Gemini estimates calories and protein. Rings for Today, heatmap for History. **First Snapline SKU only** — this repo is the protein app, not Sneaker / Toy / Habit / Alarm.

Not medical advice. Not affiliated with Novo Nordisk, Eli Lilly, or any pharmacy. Not a medical device. No login, no social, no barcode database, no HealthKit, no eBay / sold-price language.

| | |
| --- | --- |
| Public name | Protein Scanner: AI Calories |
| Expo name / slug / scheme | Protein Scanner / `protein-scanner` / `proteinscanner` |
| Bundle id | `app.proteinsnap.scanner` |
| Support | support@proteinsnap.app |
| Legal | https://proteinsnap.app/privacy · /support · /terms (or [Apple Standard EULA](https://www.apple.com/legal/internet-services/itunes/dev/stdeula/)) |
| Accent | `#22C55E` pressed `#16A34A` · forced light · iPhone only |

## What’s in the box

```
app/            Expo Router screens (Welcome → Quiz → Preparing → Paywall → Today)
src/            Theme, SQLite, free-scan math, RevenueCat stub
worker/         Cloudflare Worker: GET /health, POST /api/scan
web/            Placeholder privacy / support / terms
```

Flow: **Welcome → Quiz (3) → Preparing (3s) → Paywall → (consent on first scan) → Today → Camera → Analyzing `POST /api/scan` → Result → Save.** Tabs: Today / History / Settings.

## How to run the app

```bash
cp .env.example .env
npm install
npx expo start
```

### Desktop browser (Tester — no iPhone / Expo Go)

Web was broken on `main` (Metro 500 `transformFile`) because `babel-preset-expo` was not hoisted and `expo-sqlite` / `react-native-purchases` have no usable web bundle. This branch installs the web Babel/React deps and stubs those modules on web only.

```bash
cp .env.example .env          # leave WORKER_URL empty; web always uses the scan stub
npm install
npx expo start --web
```

Or `npm run web`. When Metro is ready, open the URL it prints (usually **http://localhost:8081**). If the browser does not open itself, paste that URL.

Walk: **Welcome → Continue → Quiz (3 questions) → Preparing → Paywall (X or “Continue with 3 free scans”) → Today → Scan → consent → Use sample plate (or Choose a photo) → Result → Save to Today → History tab.**

Camera is stubbed on web (file picker + sample plate). Purchases stay on the existing RevenueCat stub (Close X / continue free). Meals persist in `localStorage` for that browser origin. iOS / Expo Go still use the native camera, SQLite, and purchases path.

`npm run test:web-bundle` exports a static web build (`npx expo export --platform web`) as a Metro smoke check.

### Expo Go vs dev client

| | Expo Go | Dev client (`npx expo run:ios` / EAS `development`) |
| --- | --- | --- |
| Onboarding, rings, history, SQLite | Yes | Yes |
| Camera / photo library | Yes (on a device) | Yes |
| Scan stub (`EXPO_PUBLIC_SCAN_STUB=1` or no worker URL in `__DEV__`) | Yes | Yes |
| Live Gemini scans | Needs `EXPO_PUBLIC_WORKER_URL` | Same |
| Real StoreKit / RevenueCat | **No** — purchases stay on the stub | Yes, if `EXPO_PUBLIC_RC_IOS_KEY` is a real `appl_…` key |

`react-native-purchases` is behind a **dev stub**. A placeholder key, Expo Go, or a missing native module never pretends a purchase succeeded. The paywall Close **X** is visible immediately. You can **Continue with 3 free scans**. The subscribe CTA stays disabled until RevenueCat offerings load; if they fail, list prices `$39.99/year` and `$6.99/mo` show with a banner.

### Environment

See `.env.example`. Never commit `.env` or `worker/.dev.vars`.

```
EXPO_PUBLIC_WORKER_URL=          # Worker origin, no trailing slash
EXPO_PUBLIC_SCAN_STUB=0          # 1 = sample identified meal, no network
EXPO_PUBLIC_RC_IOS_KEY=placeholder
```

Products: `protein_yearly_39` ($39.99/yr, 3-day trial, default), `protein_monthly_7` ($6.99/mo). Entitlement: `premium`.

## Worker

Documented in [`worker/README.md`](worker/README.md).

```bash
cd worker
echo 'GEMINI_API_KEY=your-key' > .dev.vars   # secret — do not commit
npx wrangler dev
```

`GEMINI_MODEL` is `gemini-2.5-flash-lite` (Gemini 2.0 Flash is shut down).

The client resizes to **1024 / 0.7 JPEG** and uploads **raw bytes** (`content-type: image/jpeg`, header `x-device-id`). Photos are discarded after the request. Bodies over 1.5 MB → 413. ~40 scans / device / UTC day.

## On-device data

**SQLite**

- `days(date PK, protein_target, calorie_target)`
- `meals(id, date, slot breakfast|lunch|dinner|snack, created_at, photo_uri, name, protein_g, calories, fat_g, carbs_g, portion, confidence)`

`photo_uri` is stored `null` — the capture is deleted after `/api/scan`.

**AsyncStorage:** `onboarding_complete`, `quiz_answers`, `free_scans_used`, `ai_consent_accepted`, `device_id`, `targets`, `first_save_tip_shown`.

**Free scans:** 3 lifetime, identified-only. Failed or `identified=false` do not increment. First scan is blocked until AI consent is accepted.

**Quiz targets**

| | Protein | Calories |
| --- | --- | --- |
| GLP-1 + recomp | 100 | 1400 |
| GLP-1 + appetite | 90 | 1600 |
| No GLP-1 + protein | 140 | 2200 |
| Else | 100 | 2000 |

## Tests

```bash
npm test
```

Covers free-scan increment, local day key, portion multiplier, quiz targets, worker JSON parse / `identified=false`, and the 3.1.2 legal block.

## Icon

Original green ring + fork in `assets/`. Not a clone of MyFitnessPal, Lose It, or any pharmacy brand.

## Disclaimer

Estimates are AI-generated. They can be wrong. Protein Scanner does not diagnose, treat, or manage any condition, including GLP-1 therapy.
