import { env } from "cloudflare:workers";

for (const key of Object.keys(env)) {
  if (typeof env[key] === "string") process.env[key] = env[key];
}
