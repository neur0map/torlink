import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { writeJsonAtomic, writeJsonAtomicSync } from "./atomic";

describe("writeJsonAtomic", () => {
  const dirs: string[] = [];

  afterEach(async () => {
    await Promise.all(dirs.splice(0).map((dir) => fs.rm(dir, { recursive: true, force: true })));
  });

  it("writes durable state with owner-only permissions by default", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "torlink-atomic-"));
    dirs.push(dir);
    const file = path.join(dir, "state.json");

    await writeJsonAtomic(file, { queued: true });

    expect((await fs.stat(file)).mode & 0o777).toBe(0o600);
  });

  it("keeps owner-only permissions when shutdown flushes state synchronously", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "torlink-atomic-sync-"));
    dirs.push(dir);
    const file = path.join(dir, "state.json");

    writeJsonAtomicSync(file, { queued: true });

    expect((await fs.stat(file)).mode & 0o777).toBe(0o600);
  });
});