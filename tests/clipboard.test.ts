import test from "node:test";
import assert from "node:assert/strict";
import { writeClipboard } from "../src/lib/clipboard-shared";

test("copy degrades safely when a development build lacks native clipboard support", async () => {
  assert.equal(await writeClipboard(null, "ELM-8829-RIDGE"), false);
  assert.equal(await writeClipboard({}, "ELM-8829-RIDGE"), false);
  assert.equal(await writeClipboard({ setStringAsync: async () => { throw new Error("Native module unavailable"); } }, "ELM-8829-RIDGE"), false);
});

test("copy writes the exact unit ID when native clipboard support is available", async () => {
  let copied = "";
  assert.equal(await writeClipboard({ setStringAsync: async (value) => { copied = value; return true; } }, "ELM-8829-RIDGE"), true);
  assert.equal(copied, "ELM-8829-RIDGE");
});
