import "./core/boot.js";
import { createContext } from "./core/context.js";
import { addGlobal, injectRouter } from "./core/global.js";
import { buildRouter } from "./core/loader.js";
import { isValidUpdate } from "./core/security.js";

let chain = Promise.resolve();

function serial(fn) {
  const run = chain.then(fn, fn);
  chain = run.catch(() => {});
  return run;
}

async function handle(body, headers) {
  if (!isValidUpdate(body)) return 400;
  const flex = createContext(body, headers);
  addGlobal(flex);
  const router = await buildRouter();
  injectRouter(router);
  await router.dispatch(flex);
  return 200;
}

export default {
  async fetch(request, env) {
    if (request.method !== "POST") return new Response("OK");

    if (
      request.headers.get("x-telegram-bot-api-secret-token") !==
      env.WEBHOOK_SECRET
    )
      return new Response("Unauthorized", { status: 401 });

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response("Bad Request", { status: 400 });
    }

    let code = 200;
    await serial(async () => {
      try {
        code = await handle(body, Object.fromEntries(request.headers));
      } catch (err) {
        console.error("[error]", err.message, err.stack);
      }
    });

    return new Response(code === 400 ? "Bad Request" : "OK", { status: code });
  },
};
