import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isNonFilePhotoUri, SAMPLE_PLATE_URI } from "../image-uri.ts";

describe("web scan fixture URI", () => {
  it("sample plate is a stub URI that skip resize / discard", () => {
    assert.equal(SAMPLE_PLATE_URI.startsWith("stub://"), true);
    assert.equal(isNonFilePhotoUri(SAMPLE_PLATE_URI), true);
    assert.equal(isNonFilePhotoUri("file:///tmp/plate.jpg"), false);
  });
});
