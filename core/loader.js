import { getDB, deleteDB } from "./firebase.js";
import { commands } from "./commands.js";

const commandMap = new Map(commands);

let router = null;

export async function buildRouter() {
  if (router) return router;
  router = {
    async dispatch(flex) {
      if (flex.isInlineQuery) {
        const inlineHandler = commandMap.get("__inline__");
        if (inlineHandler) return inlineHandler(flex);
        return;
      }

      const handler = commandMap.get(flex.command);
      if (handler) return handler(flex);

      if (!flex.isCallback && !flex.command) {
        const userId = flex.user?.id;
        if (userId != null) {
          let wait = null;
          try {
            wait = await getDB(`wait_for_answer/${userId}`);
          } catch {
            wait = null;
          }

          if (wait && wait.command) {
            if (wait.expires_at && Date.now() > wait.expires_at) {
              await deleteDB(`wait_for_answer/${userId}`).catch(() => {});
            } else {
              const waitHandler = commandMap.get(wait.command);
              if (waitHandler) {
                return waitHandler({ ...flex, command: wait.command });
              }
            }
          }
        }
      }

      const onMessage = commandMap.get("__message__");
      if (onMessage) return onMessage(flex);
    },
    commandMap,
  };
  return router;
}
