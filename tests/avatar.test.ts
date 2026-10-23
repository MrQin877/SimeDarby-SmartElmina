import test from "node:test";
import assert from "node:assert/strict";
import { residentInitials, restoreAvatarUri } from "../src/lib/avatar";
import { initialData, restoreData } from "../src/lib/model";
test("resident initials remain consistent across header and profile, including empty names", () => {
  assert.equal(residentInitials(initialData.fullName), "AF");
  assert.equal(residentInitials("  Ahmad   Farhan Bin Roslan "), "AF");
  assert.equal(residentInitials("Farhan"), "F");
  assert.equal(residentInitials(""), "R");
});
test("profile photo replacement and removal persist without resetting other profile data", () => {
  const photo = "file:///app/documents/avatars/photo.jpg";
  const saved = restoreData(JSON.stringify({ ...initialData, avatarUri: photo }));
  assert.equal(saved.avatarUri, photo);
  assert.equal(saved.fullName, initialData.fullName);
  assert.equal(restoreData(JSON.stringify({ ...saved, avatarUri: null })).avatarUri, null);
  assert.equal(restoreData(JSON.stringify({ name: "Resident" })).avatarUri, null);
  assert.equal(restoreAvatarUri("data:image/png;base64,AAAA"), "data:image/png;base64,AAAA");
  for (const invalid of [undefined, 42, "", "javascript:alert(1)", "blob:temporary", "https://example.com/photo.jpg"]) assert.equal(restoreAvatarUri(invalid), null);
});
