import { randomBytes } from "node:crypto";
import { writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const localSecret = randomBytes(32).toString("hex");
const files = {
  ".dev.vars": `AUTH_SECRET=${localSecret}\n`,
  ".env.local": `AUTH_SECRET=${localSecret}\nNEXT_PUBLIC_SITE_URL=https://frenaw.com\nNEXT_PUBLIC_SITE_INDEXABLE=false\n`,
};
for (const [name, contents] of Object.entries(files)) {
  try {
    await writeFile(new URL(`../${name}`, import.meta.url), contents, { flag: "wx", mode: 0o600 });
    console.log(`Created ${name} for local development.`);
  } catch (error) {
    if (error.code !== "EEXIST") throw error;
    console.log(`Kept existing ${name}.`);
  }
}

// Local D1 only. Never pull production users, secrets or messages into a sandbox.
const migration = spawnSync(process.execPath, [
  fileURLToPath(new URL("../node_modules/wrangler/bin/wrangler.js", import.meta.url)),
  "d1", "migrations", "apply", "DB", "--local",
], { cwd: root, stdio: "inherit", env: { ...process.env, CI: "true" } });
if (migration.error) throw migration.error;
if (migration.status !== 0) process.exit(migration.status ?? 1);
console.log("Local Frenaw database ready. Start with npm run dev; no production credentials required.");
