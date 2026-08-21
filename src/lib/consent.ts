import { STORAGE_KEYS } from "./storage";

export type KeyValueStore = {
  getItem(key: string): Promise<string | null>;
};

/** Only the stored flag `"1"` counts as accepted. Anything else is unset. */
export function parseAiConsentAccepted(raw: string | null | undefined): boolean {
  return raw === "1";
}

export async function readAiConsentAccepted(store: KeyValueStore): Promise<boolean> {
  const raw = await store.getItem(STORAGE_KEYS.aiConsentAccepted);
  return parseAiConsentAccepted(raw);
}
