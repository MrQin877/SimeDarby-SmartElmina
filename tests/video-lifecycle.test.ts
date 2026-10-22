import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { URL } from "node:url";
import { runInNewContext } from "node:vm";
import ts from "typescript";

function player() {
  return {
    released: false, plays: 0, pauses: 0,
    play() { if (this.released) throw new Error("NativeSharedObjectNotFoundException"); this.plays++; },
    pause() { if (this.released) throw new Error("NativeSharedObjectNotFoundException"); this.pauses++; },
  };
}
function harness() {
  const slots: any[] = [];
  const pending: (() => void)[] = [];
  let cursor = 0;
  let focusCallback: (() => () => void) | undefined;
  let focusCleanup: (() => void) | undefined;
  const react = {
    useState(initial: unknown) { const i = cursor++; if (!(i in slots)) slots[i] = initial; return [slots[i], (value: unknown) => { slots[i] = value; }]; },
    useCallback(fn: () => unknown, deps: unknown[]) { const i = cursor++; if (!slots[i] || deps.some((d, index) => d !== slots[i].deps[index])) slots[i] = { fn, deps }; return slots[i].fn; },
    useEffect(fn: () => void | (() => void), deps: unknown[]) { const i = cursor++; const old = slots[i]; if (!old || deps.some((d, index) => d !== old.deps[index])) pending.push(() => { old?.cleanup?.(); slots[i] = { deps, cleanup: fn() }; }); },
  };
  const deps: Record<string, any> = {
    react,
    "expo-router": { useFocusEffect(callback: () => () => void) { react.useEffect(() => { focusCallback = callback; focusCleanup = callback(); return () => focusCleanup?.(); }, [callback]); } },
  };
  const exports: Record<string, any> = {};
  const source = ts.transpileModule(readFileSync(new URL("../src/hooks/useFocusedVideoPlayback.ts", import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  runInNewContext(source, { exports, require(name: string) { assert.ok(name in deps, name); return deps[name]; } });
  return {
    render(video: ReturnType<typeof player>) { cursor = 0; exports.useFocusedVideoPlayback(video); while (pending.length) pending.shift()!(); },
    blur() { focusCleanup?.(); },
    focus() { focusCleanup = focusCallback?.(); },
    unmount() { for (const slot of slots) slot?.cleanup?.(); },
  };
}

test("video pauses on tab blur and resumes on refocus while still mounted", () => {
  const app = harness(); const video = player();
  app.render(video); app.render(video);
  assert.equal(video.plays, 1);
  const pauses = video.pauses;
  app.blur(); app.render(video);
  assert.equal(video.pauses, pauses + 1);
  app.focus(); app.render(video);
  assert.equal(video.plays, 2);
});

test("focus cleanup never calls pause after Expo has released the native video", () => {
  const app = harness(); const video = player();
  app.render(video); app.render(video);
  const pauses = video.pauses;
  video.released = true; // Expo's release cleanup runs before focus cleanup.
  assert.doesNotThrow(() => app.unmount());
  assert.equal(video.pauses, pauses);
});

test("changing sources does not command an old, already released player", () => {
  const app = harness(); const first = player();
  app.render(first); app.render(first);
  first.released = true;
  const next = player();
  assert.doesNotThrow(() => app.render(next));
  assert.equal(next.plays, 1);
  next.released = true;
  assert.doesNotThrow(() => app.unmount());
});
