import { getDB, deleteDB } from "./firebase.js";

export const commandName = "__message__";

export default async function (flex) {
  const body = flex.request.body;
  const leftMember = body.message && body.message.left_chat_member;
  const chatMemberUpdate = body.chat_member;

  const farewellText = `👋 <b>Sorry to see you leave!</b>

<b>You’ve stepped away from our community, but you’re always welcome back.</b>

✨ Whether it was by accident, you needed some time away, or simply wanted a change, our doors remain open for you.

📢 Don’t miss future updates, exclusive offers, and valuable content shared with our members.

👇 Whenever you're ready, tap the button below and rejoin the community. We'd be happy to have you back!`;

  const button = [{ text: "🔗 Join Again", url: "https://t.me/Flex_Coder" }];

  if (leftMember) {
    await API.sendMessage({
      chat_id: leftMember.id,
      text: farewellText,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [button],
      },
    });
    return;
  }

  if (chatMemberUpdate) {
    const newStatus =
      chatMemberUpdate.new_chat_member &&
      chatMemberUpdate.new_chat_member.status;
    const oldStatus =
      chatMemberUpdate.old_chat_member &&
      chatMemberUpdate.old_chat_member.status;
    const leftNow =
      (newStatus === "left" || newStatus === "kicked") &&
      oldStatus !== "left" &&
      oldStatus !== "kicked";
    if (leftNow) {
      const u = chatMemberUpdate.old_chat_member.user;
      await API.sendMessage({
        chat_id: u.id,
        text: farewellText,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: button,
        },
      });
      return;
    }
  }

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
