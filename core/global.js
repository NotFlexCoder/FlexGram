import { AssetGlobal } from "./assets-helper.js";
import { API, HTTP, USER, BOT, TEMP, FLEX } from "./bot.js";
import { getDB, setDB, deleteDB, updateDB, pushDB } from "./firebase.js";
import { Utils } from "./utils.js";
import { keyboard } from "./keyboard.js";

export function addGlobal(flex) {
  const chatId = flex.chat.id;
  const userId = flex.user.id;

  USER._userId = userId;
  FLEX._userId = userId;
  BOT._userId = userId;
  BOT._chatId = chatId;

  AssetGlobal();

  global.sendMessage = (text, options = {}) => BOT.sendMessage(text, options);
  global.sendPhoto = (photo, options = {}) => BOT.sendPhoto(photo, options);
  global.sendVideo = (video, options = {}) => BOT.sendVideo(video, options);
  global.sendAudio = (audio, options = {}) => BOT.sendAudio(audio, options);
  global.sendVoice = (voice, options = {}) => BOT.sendVoice(voice, options);
  global.sendDocument = (document, options = {}) =>
    BOT.sendDocument(document, options);
  global.sendSticker = (sticker, options = {}) =>
    BOT.sendSticker(sticker, options);
  global.sendAnimation = (animation, options = {}) =>
    BOT.sendAnimation(animation, options);
  global.sendLocation = (lat, lng, options = {}) =>
    BOT.sendLocation(lat, lng, options);
  global.sendContact = (phone, name, options = {}) =>
    BOT.sendContact(phone, name, options);
  global.sendPoll = (question, opts, options = {}) =>
    BOT.sendPoll(question, opts, options);
  global.sendChatAction = (action, options = {}) =>
    BOT.sendChatAction(action, options);

  global.sendReplyKeyboard = (text, keyboardRows, parse = "HTML", opts = {}) =>
    API.sendMessage({
      chat_id: chatId,
      text,
      parse_mode: parse,
      reply_markup: keyboard.reply(keyboardRows, opts),
    });

  global.removeKeyboard = (text, parse = "HTML") =>
    API.sendMessage({
      chat_id: chatId,
      text,
      parse_mode: parse,
      reply_markup: keyboard.remove(),
    });

  global.editMessage = (messageId, text, options = {}) =>
    BOT.editMessage(messageId, text, options);
  global.editCaption = (messageId, caption, options = {}) =>
    BOT.editCaption(messageId, caption, options);
  global.editMedia = (messageId, media, options = {}) =>
    BOT.editMedia(messageId, media, options);
  global.editButton = (messageId, buttons = null, options = {}) =>
    BOT.editButtons(messageId, buttons, options);

  global.editCallbackMessage = (text, buttons = null, messageId = null) =>
    BOT.editCallbackMessage(
      messageId ?? flex.message_id,
      text,
      flex.callbackMessageHasMedia,
      buttons,
    );

  global.deleteMessage = (messageId, options = {}) =>
    BOT.deleteMessage(messageId, options);
  global.answerCallback = (text = "", alert = false) =>
    BOT.answerCallback(flex.callbackQueryId ?? "", text, alert);

  global.answerInlineQuery = (results, opts = {}) =>
    API.answerInlineQuery({
      inline_query_id: flex.inlineQueryId ?? "",
      results,
      ...opts,
    });

  global.forwardMessage = (toChatId, messageId, options = {}) =>
    BOT.forwardMessage(toChatId, messageId, options);
  global.copyMessage = (toChatId, messageId, options = {}) =>
    BOT.copyMessage(toChatId, messageId, options);
  global.pinMessage = (messageId, options = {}) =>
    BOT.pinMessage(messageId, options);
  global.unpinMessage = (options = {}) => BOT.unpinMessage(options);

  global.broadcast = async (userIds, text, buttons = null, delayMs = 50) => {
    const results = { sent: 0, failed: 0, errors: [] };
    for (const uid of userIds) {
      try {
        await BOT.sendMessage(text, { chat_id: uid, buttons });
        results.sent++;
        if (delayMs > 0) await Utils.sleep(delayMs);
      } catch (err) {
        results.failed++;
        results.errors.push({ uid, error: err.message });
      }
    }
    return results;
  };

  global.runCommand = async (command, params = "") => {
    const syntheticCtx = {
      ...flex,
      command,
      params,
      message: `${command} ${params}`.trim(),
    };
    addGlobal(syntheticCtx);
    if (global.__router__) await global.__router__.dispatch(syntheticCtx);
    addGlobal(flex);
  };

  global.waitForAnswer = async (nextCommand, options = {}) => {
    await setDB(`wait_for_answer/${userId}`, {
      command: nextCommand,
      expires_at: Date.now() + (options.timeout_ms ?? 5 * 60 * 1000),
      created_at: Date.now(),
    });
  };

  global.clearWait = () => deleteDB(`wait_for_answer/${userId}`);

  global.setUserProperty = (name, value) => USER.setProperty(name, value);
  global.getUserProperty = (name) => USER.getProperty(name);
  global.deleteUserProperty = (name) => USER.deleteProperty(name);
  global.setBotProperty = (name, value) => BOT.setProperty(name, value);
  global.getBotProperty = (name) => BOT.getProperty(name);

  TEMP._userId = flex.user?.id ?? null;
  if (USER._userId !== undefined) USER._userId = flex.user?.id ?? null;
  if (FLEX._userId !== undefined) FLEX._userId = flex.user?.id ?? null;

  global.API = API;
  global.FLEX = FLEX;
  global.TEMP = TEMP;
  global.HTTP = HTTP;
  global.BOT = BOT;
  global.USER = USER;
  global.keyboard = keyboard;

  global.flex = flex;
  global.user = flex.user;
  global.chat = flex.chat;
  global.message = flex.message;
  global.message_id = flex.message_id;
  global.reply_to_message_id = flex.reply_to_message_id;
  global.command = flex.command;
  global.params = flex.params;
  global.request = flex.request;

  global.isCallback = flex.isCallback ?? false;
  global.callbackData = flex.callbackData ?? null;
  global.callbackQueryId = flex.callbackQueryId ?? null;
  global.callbackMessageHasMedia = flex.callbackMessageHasMedia ?? false;

  global.isInlineQuery = flex.isInlineQuery ?? false;
  global.inlineQuery = flex.inlineQuery ?? null;
  global.inlineQueryId = flex.inlineQueryId ?? null;
}

export function injectRouter(router) {
  global.__router__ = router;
}
