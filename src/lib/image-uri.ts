/** Desktop web fixture — analyzing skips resize and the worker stub returns a sample meal. */
export const SAMPLE_PLATE_URI = "stub://sample-plate";

export function isNonFilePhotoUri(uri: string): boolean {
  return (
    uri.startsWith("stub://") ||
    uri.startsWith("ph://") ||
    uri.startsWith("assets-library://") ||
    uri.startsWith("content://") ||
    uri.startsWith("data:") ||
    uri.startsWith("blob:")
  );
}
