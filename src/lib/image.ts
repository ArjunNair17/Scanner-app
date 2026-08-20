import * as FileSystem from "expo-file-system/legacy";
import * as ImageManipulator from "expo-image-manipulator";
import { isNonFilePhotoUri } from "./image-uri";

export { isNonFilePhotoUri, SAMPLE_PLATE_URI } from "./image-uri";

export const MAX_EDGE = 1024;
export const JPEG_QUALITY = 0.7;

export async function resizeForScan(uri: string): Promise<string> {
  if (uri.startsWith("stub://")) return uri;
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: MAX_EDGE } }],
    { compress: JPEG_QUALITY, format: ImageManipulator.SaveFormat.JPEG },
  );
  return result.uri;
}

export async function discardPhoto(uri: string | null | undefined): Promise<void> {
  if (!uri) return;
  if (isNonFilePhotoUri(uri)) {
    return;
  }
  try {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch {
    // Best-effort: camera roll originals are left alone; temp captures go away.
  }
}

export async function discardPhotos(uris: Array<string | null | undefined>): Promise<void> {
  await Promise.all(uris.map((uri) => discardPhoto(uri)));
}
