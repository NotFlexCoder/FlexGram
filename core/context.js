export function createContext(body, header = {}) {
  const msg = body.message || body.edited_message || {};
  const callback = body.callback_query || {};
  const cbMsg = callback.message || {};
  const inline = body.inline_query || {};
  const from = msg.from || callback.from || inline.from || {};
  const chatData = msg.chat || cbMsg.chat || {};
  const text = msg.text || callback.data || inline.query || "";
  const command = text.startsWith("/")
    ? text.split(" ")[0].split("@")[0]
    : null;
  const params = text.split(" ").slice(1).join(" ");
  const incoming_message_id = msg.message_id || cbMsg.message_id || null;
  const isCallback = !!callback.id;
  const callbackMessageHasMedia =
    isCallback &&
    !!(
      cbMsg.photo ||
      cbMsg.video ||
      cbMsg.document ||
      cbMsg.animation ||
      cbMsg.audio ||
      cbMsg.voice ||
      cbMsg.sticker
    );

  return {
    user: {
      id: from.id,
      telegramid: `${from.id}`,
      first_name: from.first_name ?? "",
      last_name: from.last_name ?? "",
      username: from.username ?? "",
      language_code: from.language_code ?? "en",
      chatid: chatData.id,
      created_at: new Date(),
    },
    chat: {
      id: chatData.id,
      chat_type: chatData.type,
    },
    message: text,
    message_id: incoming_message_id,
    reply_to_message_id: incoming_message_id,
    command,
    params,
    isCallback,
    callbackData: callback.data ?? null,
    callbackQueryId: callback.id ?? null,
    callbackMessageHasMedia,
    isInlineQuery: !!inline.id,
    inlineQuery: inline.query ?? null,
    inlineQueryId: inline.id ?? null,
    request: {
      body,
      headers: header,
      method: "POST",
      data: callback.data,
      text,
      caption: msg.caption,
      entities: msg.entities,
      photo: msg.photo,
      video: msg.video,
      audio: msg.audio,
      document: msg.document,
      sticker: msg.sticker,
      location: msg.location,
      contact: msg.contact,
      voice: msg.voice,
      animation: msg.animation,
      game: msg.game,
      poll: msg.poll,
      venue: msg.venue,
      message: isCallback ? { message_id: cbMsg.message_id } : null,
      from: callback.from
        ? {
            id: callback.from.id,
            username: callback.from.username,
            first_name: callback.from.first_name,
            last_name: callback.from.last_name,
          }
        : null,
    },
  };
}
