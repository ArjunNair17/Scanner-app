import * as FileSystem from "expo-file-system/legacy";
import * as ImageManipulator from "expo-image-manipulator";

export const MAX_EDGE = 1024;
export const JPEG_QUALITY = 0.7;

export async function resizeForScan(uri: string): Promise<string> {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: MAX_EDGE } }],
    { compress: JPEG_QUALITY, format: ImageManipulator.SaveFormat.JPEG },
  );
  return result.uri;
}

export async function discardPhoto(uri: string | null | undefined): Promise<void> {
  if (!uri) return;
  if (uri.startsWith("ph://") || uri.startsWith("assets-library://") || uri.startsWith("content://")) {
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
