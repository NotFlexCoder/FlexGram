import { getDB, deleteDB } from "./firebase.js";

export const commandName = "__message__";

export default async function (flex) {
  const userId = flex.user.id;

  let pending = null;
  try {
    pending = await getDB(`wait_for_answer/${userId}`);
  } catch {}

  if (pending?.command) {
    if (Date.now() > pending.expires_at) {
      await deleteDB(`wait_for_answer/${userId}`).catch(() => {});
      await sendMessage("⏰ Session timed out. Please start again.");
      return;
    }
    await deleteDB(`wait_for_answer/${userId}`).catch(() => {});
    await runCommand(pending.command, flex.message);
    return;
  }
}
