import * as FileSystem from "expo-file-system/legacy";
import type { FoodEstimate, ScanErrorCode } from "../types";

export type ScanOk = { ok: true; food: FoodEstimate };
export type ScanErr = { ok: false; code: ScanErrorCode; message?: string };
export type ScanResponse = ScanOk | ScanErr;

const SAMPLE_FOOD: FoodEstimate = {
  identified: true,
  name: "Grilled chicken plate",
  ingredients: ["chicken breast", "rice", "broccoli"],
  calories: 520,
  protein_g: 42,
  fat_g: 14,
  carbs_g: 48,
  serving_description: "1 plate, visible portion",
  confidence: 78,
};

export function workerUrl(): string {
  return (process.env.EXPO_PUBLIC_WORKER_URL ?? "").replace(/\/$/, "");
}

export function useScanStub(): boolean {
  const stub = process.env.EXPO_PUBLIC_SCAN_STUB === "1";
  const missing = !workerUrl();
  return stub || (__DEV__ && missing);
}

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function stubScan(): Promise<ScanResponse> {
  await delay(900);
  return { ok: true, food: { ...SAMPLE_FOOD } };
}

function mapStatus(status: number, body: { error?: string } | null): ScanErr {
  const code = (body?.error as ScanErrorCode | undefined) ?? undefined;
  if (status === 413) return { ok: false, code: "too_large" };
  if (status === 429 || code === "rate_limited") return { ok: false, code: "rate_limited" };
  if (status === 504 || code === "timeout") return { ok: false, code: "timeout" };
  if (code === "bad_image" || code === "model_parse" || code === "upstream") {
    return { ok: false, code };
  }
  return { ok: false, code: "upstream" };
}

/**
 * POST raw JPEG bytes. Never JSON-wraps base64.
 */
export async function scanPlate(jpegUri: string, deviceId: string): Promise<ScanResponse> {
  if (useScanStub()) {
    return stubScan();
  }

  const url = `${workerUrl()}/api/scan`;
  try {
    const uploaded = await FileSystem.uploadAsync(url, jpegUri, {
      httpMethod: "POST",
      uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
      headers: {
        "Content-Type": "image/jpeg",
        "x-device-id": deviceId,
      },
    });

    let parsed: Record<string, unknown> | null = null;
    try {
      parsed = uploaded.body ? (JSON.parse(uploaded.body) as Record<string, unknown>) : null;
    } catch {
      parsed = null;
    }

    if (uploaded.status < 200 || uploaded.status >= 300) {
      return mapStatus(uploaded.status, parsed as { error?: string } | null);
    }
    if (!parsed || typeof parsed.identified !== "boolean") {
      return { ok: false, code: "model_parse" };
    }
    return { ok: true, food: parsed as unknown as FoodEstimate };
  } catch {
    return { ok: false, code: "network" };
  }
}
