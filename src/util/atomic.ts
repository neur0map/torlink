import { promises as fs } from "node:fs";
import path from "node:path";

export function serializeWrites(): (task: () => Promise<void>) => Promise<void> {
  let chain: Promise<void> = Promise.resolve();
  return (task) => {
    chain = chain.then(task).catch(() => {});
    return chain;
  };
}

export async function writeJsonAtomic(
  file: string,
  data: unknown,
  opts: { mode?: number } = {},
): Promise<void> {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp`;
  const mode = opts.mode ?? 0o600;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
  // Set the mode before the rename so durable state is never briefly readable
  // by other local users (chmod is a no-op on Windows, hence the swallow).
  await fs.chmod(tmp, mode).catch(() => {});
  await fs.rename(tmp, file);
}
