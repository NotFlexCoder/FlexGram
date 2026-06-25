import "dotenv/config";
import express from "express";
import { createContext } from "./core/context.js";
import { addGlobal, injectRouter } from "./core/global.js";
import { buildRouter, watchCommandFolder } from "./core/loader.js";
import { isValidUpdate } from "./core/security.js";
import { genSuggest } from "./auto-generate/gen-suggest.js";
import { generateSnippets } from "./auto-generate/gen-snippet.js";

const app = express();
app.use(express.json());

await watchCommandFolder();
genSuggest();
async function getRouter() {
  const router = await buildRouter();
  injectRouter(router);
  return router;
}

app.post("*", async (req, res) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");

  try {
    const body = req.body;

    if (!isValidUpdate(body)) {
      return res.status(400).send("Bad Request");
    }

    const flex = createContext(body, req.headers);
    addGlobal(flex);

    const router = await getRouter();
    await router.dispatch(flex);

    res.status(200).send("OK");
  } catch (err) {
    console.error("[error]", err.message, err.stack);
    res.status(200).send("OK");
  }
});

app.get("/", (_req, res) => res.send("OK"));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
export default app;
