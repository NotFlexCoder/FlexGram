import { setDB, getDB, deleteDB, updateDB } from "./firebase.js";

const botToken = () => {
  const token = process.env.BOT_TOKEN;
  if (!token) throw new Error("BOT_TOKEN is not set");
  return token;
};

const _tempStore = new Map();
const TGApi = (method) => `https://api.telegram.org/bot${botToken()}/${method}`;

function safeName(name) {
  return String(name).replace(/[.#$[\]/]/g, "_");
}

async function TG(method, data) {
  const res = await fetch(TGApi(method), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const response = await res.json();
  if (!response.ok)
    throw new Error(`Telegram [${method}] ${response.description}`);
  return response.result;
}

function isValidUrl(url) {
  try {
    const u = new URL(url);
    return ["http:", "https:"].includes(u.protocol);
  } catch {
    return false;
  }
}

export async function buildBtn(btn) {
  if (!btn || typeof btn !== "object") throw new Error("Invalid button object");
  if (!btn.text || typeof btn.text !== "string")
    throw new Error("Button text is required");
  if (btn.url) {
    if (!isValidUrl(btn.url)) throw new Error(`Invalid button URL: ${btn.url}`);
    return { text: btn.text, url: btn.url };
  }
  if (btn.command)
    return { text: btn.text, callback_data: String(btn.command).slice(0, 64) };
  if (btn.callback_data)
    return {
      text: btn.text,
      callback_data: String(btn.callback_data).slice(0, 64),
    };
  throw new Error("Button needs url or command");
}

export async function buildMarkup(keyboard) {
  if (!keyboard) return undefined;
  if (Array.isArray(keyboard) && Array.isArray(keyboard[0]))
    return {
      inline_keyboard: await Promise.all(
        keyboard.map((row) => Promise.all(row.map(buildBtn))),
      ),
    };
  if (Array.isArray(keyboard))
    return {
      inline_keyboard: await Promise.all(
        keyboard.map(async (btn) => [await buildBtn(btn)]),
      ),
    };
  return { inline_keyboard: [[await buildBtn(keyboard)]] };
}

function autoAsync(obj) {
  return new Proxy(obj, {
    get(target, prop) {
      const val = target[prop];
      if (typeof val !== "function" || prop.startsWith("_")) return val;
      return function (...args) {
        const result = val.apply(target, args);
        if (result && typeof result.then === "function") {
          result.catch((err) =>
            console.error(`[${String(prop)}] ${err.message}`),
          );
        }
        return result;
      };
    },
  });
}

export const API = autoAsync({
  sendMessage: (options) => TG("sendMessage", options),
  editMessageText: (options) => TG("editMessageText", options),
  editMessageCaption: (options) => TG("editMessageCaption", options),
  editMessageMedia: (options) => TG("editMessageMedia", options),
  editMessageReplyMarkup: (options) => TG("editMessageReplyMarkup", options),
  deleteMessage: (options) => TG("deleteMessage", options),
  answerCallbackQuery: (options) => TG("answerCallbackQuery", options),
  sendPhoto: (options) => TG("sendPhoto", options),
  sendVideo: (options) => TG("sendVideo", options),
  sendAudio: (options) => TG("sendAudio", options),
  sendVoice: (options) => TG("sendVoice", options),
  sendDocument: (options) => TG("sendDocument", options),
  sendSticker: (options) => TG("sendSticker", options),
  sendAnimation: (options) => TG("sendAnimation", options),
  sendLocation: (options) => TG("sendLocation", options),
  sendContact: (options) => TG("sendContact", options),
  sendPoll: (options) => TG("sendPoll", options),
  forwardMessage: (options) => TG("forwardMessage", options),
  copyMessage: (options) => TG("copyMessage", options),
  pinChatMessage: (options) => TG("pinChatMessage", options),
  unpinChatMessage: (options) => TG("unpinChatMessage", options),
  getChat: (options) => TG("getChat", options),
  getChatMember: (options) => TG("getChatMember", options),
  getUserProfilePhotos: (options) => TG("getUserProfilePhotos", options),
  banChatMember: (options) => TG("banChatMember", options),
  unbanChatMember: (options) => TG("unbanChatMember", options),
  restrictChatMember: (options) => TG("restrictChatMember", options),
  leaveChat: (options) => TG("leaveChat", options),
  getFile: (options) => TG("getFile", options),
  sendInvoice: (options) => TG("sendInvoice", options),
  sendChatAction: (options) => TG("sendChatAction", options),
  answerInlineQuery: (options) => TG("answerInlineQuery", options),
  exportChatInviteLink: (options) => TG("exportChatInviteLink", options),
  createChatInviteLink: (options) => TG("createChatInviteLink", options),
  revokeChatInviteLink: (options) => TG("revokeChatInviteLink", options),
  promoteChatMember: (options) => TG("promoteChatMember", options),
  getChatAdministrators: (options) => TG("getChatAdministrators", options),
  setChatTitle: (options) => TG("setChatTitle", options),
  setChatDescription: (options) => TG("setChatDescription", options),
  setChatPhoto: (options) => TG("setChatPhoto", options),
  deleteChatPhoto: (options) => TG("deleteChatPhoto", options),
  getMe: () => TG("getMe", {}),
});

export const HTTP = autoAsync({
  async get({ url, headers = {} }) {
    const res = await fetch(url, { method: "GET", headers });
    return res.json().catch(() => res.text());
  },
  async post({ url, body = {}, headers = {} }) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(body),
    });
    return res.json().catch(() => res.text());
  },
  async custom({ url, method = "GET", header = {}, body }) {
    const options = { method, headers: header };
    if (body !== undefined && !["GET", "HEAD"].includes(method.toUpperCase())) {
      options.body = JSON.stringify(body);
      options.headers = { "Content-Type": "application/json", ...header };
    }
    const res = await fetch(url, options);
    if (!res.ok)
      throw new Error(
        `${method} ${url} failed: ${res.status} ${res.statusText}`,
      );
    return res.json().catch(() => res.text());
  },
});

export const BOT = autoAsync({
  _chatId: null,
  _userId: null,

  _cid(options) {
    const id = options?.chat_id ?? BOT._chatId;
    if (!id)
      throw new Error(
        "No chat_id available. Make sure addGlobal() ran before calling BOT methods.",
      );
    return id;
  },

  async sendMessage(text, options = {}) {
    const payload = {
      chat_id: BOT._cid(options),
      text,
      parse_mode: options.parse_mode ?? "HTML",
    };
    if (options.reply_to_message_id)
      payload.reply_to_message_id = options.reply_to_message_id;
    if (options.disable_web_page_preview)
      payload.disable_web_page_preview = options.disable_web_page_preview;
    const markup = await buildMarkup(options.buttons ?? null);
    if (markup) payload.reply_markup = markup;
    return API.sendMessage(payload);
  },

  async sendPhoto(photo, options = {}) {
    const payload = {
      chat_id: BOT._cid(options),
      photo,
      caption: options.caption ?? "",
      parse_mode: options.parse_mode ?? "HTML",
    };
    if (options.reply_to_message_id)
      payload.reply_to_message_id = options.reply_to_message_id;
    const markup = await buildMarkup(options.buttons ?? null);
    if (markup) payload.reply_markup = markup;
    return API.sendPhoto(payload);
  },

  async sendVideo(video, options = {}) {
    const { buttons, chat_id, ...rest } = options;
    const payload = {
      chat_id: BOT._cid(options),
      video,
      parse_mode: "HTML",
      ...rest,
    };
    const markup = await buildMarkup(buttons ?? null);
    if (markup) payload.reply_markup = markup;
    return API.sendVideo(payload);
  },

  async sendAudio(audio, options = {}) {
    const { buttons, chat_id, ...rest } = options;
    const payload = {
      chat_id: BOT._cid(options),
      audio,
      parse_mode: "HTML",
      ...rest,
    };
    const markup = await buildMarkup(buttons ?? null);
    if (markup) payload.reply_markup = markup;
    return API.sendAudio(payload);
  },

  async sendVoice(voice, options = {}) {
    const { buttons, chat_id, ...rest } = options;
    const payload = {
      chat_id: BOT._cid(options),
      voice,
      parse_mode: "HTML",
      ...rest,
    };
    const markup = await buildMarkup(buttons ?? null);
    if (markup) payload.reply_markup = markup;
    return API.sendVoice(payload);
  },

  async sendDocument(document, options = {}) {
    const { buttons, chat_id, ...rest } = options;
    const payload = {
      chat_id: BOT._cid(options),
      document,
      parse_mode: "HTML",
      ...rest,
    };
    const markup = await buildMarkup(buttons ?? null);
    if (markup) payload.reply_markup = markup;
    return API.sendDocument(payload);
  },

  async sendSticker(sticker, options = {}) {
    return API.sendSticker({ chat_id: BOT._cid(options), sticker });
  },

  async sendAnimation(animation, options = {}) {
    const { buttons, chat_id, ...rest } = options;
    const payload = {
      chat_id: BOT._cid(options),
      animation,
      parse_mode: "HTML",
      ...rest,
    };
    const markup = await buildMarkup(buttons ?? null);
    if (markup) payload.reply_markup = markup;
    return API.sendAnimation(payload);
  },

  async sendLocation(latitude, longitude, options = {}) {
    return API.sendLocation({
      chat_id: BOT._cid(options),
      latitude,
      longitude,
    });
  },

  async sendContact(phone_number, first_name, options = {}) {
    return API.sendContact({
      chat_id: BOT._cid(options),
      phone_number,
      first_name,
    });
  },

  async sendPoll(question, pollOptions, options = {}) {
    return API.sendPoll({
      chat_id: BOT._cid(options),
      question,
      options: pollOptions,
    });
  },

  async sendChatAction(action, options = {}) {
    return API.sendChatAction({ chat_id: BOT._cid(options), action });
  },

  async editMessage(messageId, text, options = {}) {
    const payload = {
      chat_id: BOT._cid(options),
      message_id: messageId,
      text,
      parse_mode: options.parse_mode ?? "HTML",
    };
    const markup = await buildMarkup(options.buttons ?? null);
    if (markup) payload.reply_markup = markup;
    return API.editMessageText(payload);
  },

  async editCaption(messageId, caption, options = {}) {
    const payload = {
      chat_id: BOT._cid(options),
      message_id: messageId,
      caption,
      parse_mode: options.parse_mode ?? "HTML",
    };
    const markup = await buildMarkup(options.buttons ?? null);
    if (markup) payload.reply_markup = markup;
    return API.editMessageCaption(payload);
  },

  async editMedia(messageId, media, options = {}) {
    if (!media || typeof media !== "object")
      throw new Error("Media object required");
    if (!media.type) throw new Error("Media type missing");
    if (!media.media) throw new Error("Media URL or file_id missing");
    const allowed = ["photo", "video", "animation", "audio", "document"];
    if (!allowed.includes(media.type))
      throw new Error(`Invalid media type: ${media.type}`);
    const payload = {
      chat_id: BOT._cid(options),
      message_id: messageId,
      media: {
        type: media.type,
        media: media.media,
        caption: media.caption || "",
        parse_mode: options.parse_mode ?? "HTML",
      },
    };
    const markup = await buildMarkup(options.buttons ?? null);
    if (markup) payload.reply_markup = markup;
    return API.editMessageMedia(payload);
  },

  async editButtons(messageId, buttons = null, options = {}) {
    const payload = { chat_id: BOT._cid(options), message_id: messageId };
    const markup = await buildMarkup(buttons);
    payload.reply_markup = markup ?? { inline_keyboard: [] };
    return API.editMessageReplyMarkup(payload);
  },

  async editCallbackMessage(
    messageId,
    text,
    hasMedia,
    buttons = null,
    options = {},
  ) {
    if (hasMedia)
      return BOT.editCaption(messageId, text, { ...options, buttons });
    return BOT.editMessage(messageId, text, { ...options, buttons });
  },

  async deleteMessage(messageId, options = {}) {
    return API.deleteMessage({
      chat_id: BOT._cid(options),
      message_id: messageId,
    });
  },

  async answerCallback(callbackQueryId, text = "", showAlert = false) {
    return API.answerCallbackQuery({
      callback_query_id: callbackQueryId,
      text,
      show_alert: showAlert,
    });
  },

  async forwardMessage(toChatId, messageId, options = {}) {
    return API.forwardMessage({
      chat_id: toChatId,
      from_chat_id: options.from_chat_id ?? BOT._chatId,
      message_id: messageId,
    });
  },

  async copyMessage(toChatId, messageId, options = {}) {
    return API.copyMessage({
      chat_id: toChatId,
      from_chat_id: options.from_chat_id ?? BOT._chatId,
      message_id: messageId,
    });
  },

  async pinMessage(messageId, options = {}) {
    return API.pinChatMessage({
      chat_id: BOT._cid(options),
      message_id: messageId,
    });
  },

  async unpinMessage(options = {}) {
    return API.unpinChatMessage({ chat_id: BOT._cid(options) });
  },

  async banUser(userId, options = {}) {
    return API.banChatMember({
      chat_id: BOT._cid(options),
      user_id: userId,
      ...options,
    });
  },

  async unbanUser(userId, options = {}) {
    return API.unbanChatMember({ chat_id: BOT._cid(options), user_id: userId });
  },

  async restrictUser(userId, permissions, options = {}) {
    return API.restrictChatMember({
      chat_id: BOT._cid(options),
      user_id: userId,
      permissions,
    });
  },

  async getMember(userId, options = {}) {
    return API.getChatMember({ chat_id: BOT._cid(options), user_id: userId });
  },

  async isAdmin(userId, options = {}) {
    try {
      const member = await BOT.getMember(userId, options);
      return ["administrator", "creator"].includes(member?.status);
    } catch {
      return false;
    }
  },

  async getAdmins(options = {}) {
    return API.getChatAdministrators({ chat_id: BOT._cid(options) });
  },

  async getChat(options = {}) {
    return API.getChat({ chat_id: BOT._cid(options) });
  },

  async leaveChat(options = {}) {
    return API.leaveChat({ chat_id: BOT._cid(options) });
  },

  async createInviteLink(options = {}) {
    return API.createChatInviteLink({ chat_id: BOT._cid(options), ...options });
  },

  async setProp(name, value, type = "string") {
    await setDB(`bot_properties/${safeName(name)}`, { value, type });
  },

  getProp(name) {
    const fetchValue = async () => {
      try {
        return await getDB(`bot_properties/${safeName(name)}`);
      } catch {
        return null;
      }
    };
    return {
      async value() {
        return fetchValue();
      },
      async add(extra) {
        const current = (await fetchValue()) ?? { value: "", type: "string" };
        let newVal;
        if (typeof current.value === "number") newVal = current.value + extra;
        else if (typeof current.value === "string")
          newVal = current.value + String(extra);
        else if (Array.isArray(current.value))
          newVal = [...current.value, extra];
        else
          throw new Error(`Unsupported type for add: ${typeof current.value}`);
        await updateDB("bot_properties", {
          [safeName(name)]: { value: newVal, type: typeof newVal },
        });
        return newVal;
      },
      async remove(target) {
        const current = (await fetchValue()) ?? { value: "", type: "string" };
        let newVal;
        if (typeof current.value === "number") newVal = current.value - target;
        else if (typeof current.value === "string")
          newVal = current.value.replace(target, "");
        else if (Array.isArray(current.value))
          newVal = current.value.filter((i) => i !== target);
        else
          throw new Error(
            `Unsupported type for remove: ${typeof current.value}`,
          );
        await updateDB("bot_properties", {
          [safeName(name)]: { value: newVal, type: typeof newVal },
        });
        return newVal;
      },
    };
  },

  async deleteProp(name) {
    await deleteDB(`bot_properties/${safeName(name)}`);
  },
  async setProperty(name, value, type = "string") {
    return BOT.setProp(name, value, type);
  },
  getProperty(name) {
    return BOT.getProp(name);
  },
  async deleteProperty(name) {
    return BOT.deleteProp(name);
  },
});

export const TEMP = autoAsync({
  _userId: null,

  async setProperty(name, value) {
    if (!TEMP._userId) throw new Error("TEMP._userId not set");
    _tempStore.set(`${TEMP._userId}:${name}`, value);
  },

  getProperty(name) {
    if (!TEMP._userId) throw new Error("TEMP._userId not set");
    const fetchValue = async () => {
      try {
        return _tempStore.get(`${TEMP._userId}:${name}`) ?? null;
      } catch {
        return null;
      }
    };
    return {
      async value() {
        return fetchValue();
      },
      async add(extra) {
        const current = (await fetchValue()) ?? "";
        let newVal;
        if (typeof current === "number") newVal = current + extra;
        else if (typeof current === "string") newVal = current + String(extra);
        else if (Array.isArray(current)) newVal = [...current, extra];
        else throw new Error(`Unsupported type for add: ${typeof current}`);
        _tempStore.set(`${TEMP._userId}:${name}`, newVal);
        return newVal;
      },
      async remove(target) {
        const current = (await fetchValue()) ?? "";
        let newVal;
        if (typeof current === "number") newVal = current - target;
        else if (typeof current === "string")
          newVal = current.replace(target, "");
        else if (Array.isArray(current))
          newVal = current.filter((i) => i !== target);
        else throw new Error(`Unsupported type for remove: ${typeof current}`);
        _tempStore.set(`${TEMP._userId}:${name}`, newVal);
        return newVal;
      },
    };
  },

  async deleteProperty(name) {
    if (!TEMP._userId) throw new Error("TEMP._userId not set");
    _tempStore.delete(`${TEMP._userId}:${name}`);
  },

  async setProp(name, value) {
    return TEMP.setProperty(name, value);
  },
  getProp(name) {
    return TEMP.getProperty(name);
  },
  async deleteProp(name) {
    return TEMP.deleteProperty(name);
  },
});

export const USER = autoAsync({
  _userId: null,

  async setProperty(name, value, type = "string") {
    if (!USER._userId) throw new Error("USER._userId not set");
    await setDB(`user_properties/${USER._userId}/${safeName(name)}`, {
      value,
      type,
    });
  },

  getProperty(key) {
    if (!USER._userId) throw new Error("USER._userId not set");
    const fetchValue = async () => {
      try {
        return await getDB(`user_properties/${USER._userId}/${safeName(key)}`);
      } catch {
        return null;
      }
    };
    return {
      async value() {
        return fetchValue();
      },
      async add(extra) {
        const current = (await fetchValue()) ?? { value: "", type: "string" };
        let newVal;
        if (typeof current.value === "number") newVal = current.value + extra;
        else if (typeof current.value === "string")
          newVal = current.value + String(extra);
        else if (Array.isArray(current.value))
          newVal = [...current.value, extra];
        else
          throw new Error(`Unsupported type for add: ${typeof current.value}`);
        await updateDB(`user_properties/${USER._userId}`, {
          [safeName(key)]: { value: newVal, type: typeof newVal },
        });
        return newVal;
      },
      async remove(target) {
        const current = (await fetchValue()) ?? { value: "", type: "string" };
        let newVal;
        if (typeof current.value === "number") newVal = current.value - target;
        else if (typeof current.value === "string")
          newVal = current.value.replace(target, "");
        else if (Array.isArray(current.value))
          newVal = current.value.filter((i) => i !== target);
        else
          throw new Error(
            `Unsupported type for remove: ${typeof current.value}`,
          );
        await updateDB(`user_properties/${USER._userId}`, {
          [safeName(key)]: { value: newVal, type: typeof newVal },
        });
        return newVal;
      },
    };
  },

  async deleteProperty(name) {
    if (!USER._userId) throw new Error("USER._userId not set");
    await deleteDB(`user_properties/${USER._userId}/${safeName(name)}`);
  },

  async setProp(name, value, type = "string") {
    return USER.setProperty(name, value, type);
  },
  getProp(name) {
    return USER.getProperty(name);
  },
  async deleteProp(name) {
    return USER.deleteProperty(name);
  },
});

export const FLEX = autoAsync({
  _userId: null,

  async setProperty(key, value) {
    if (!FLEX._userId) throw new Error("FLEX._userId not set");
    await setDB(`users/${FLEX._userId}/${safeName(key)}`, value);
  },

  getProperty(key) {
    if (!FLEX._userId) throw new Error("FLEX._userId not set");
    return {
      async value() {
        try {
          return await getDB(`users/${FLEX._userId}/${safeName(key)}`);
        } catch {
          return null;
        }
      },
      async add(extra) {
        const current = (await this.value()) ?? "";
        let newVal;
        if (typeof current === "number") newVal = current + extra;
        else if (typeof current === "string") newVal = current + String(extra);
        else if (Array.isArray(current)) newVal = [...current, extra];
        else throw new Error(`Unsupported type for add: ${typeof current}`);
        await updateDB(`users/${FLEX._userId}`, { [safeName(key)]: newVal });
        return newVal;
      },
      async remove(target) {
        const current = (await this.value()) ?? "";
        let newVal;
        if (typeof current === "number") newVal = current - target;
        else if (typeof current === "string")
          newVal = current.replace(target, "");
        else if (Array.isArray(current))
          newVal = current.filter((i) => i !== target);
        else throw new Error(`Unsupported type for remove: ${typeof current}`);
        await updateDB(`users/${FLEX._userId}`, { [safeName(key)]: newVal });
        return newVal;
      },
    };
  },

  async deleteProperty(key) {
    if (!FLEX._userId) throw new Error("FLEX._userId not set");
    await deleteDB(`users/${FLEX._userId}/${safeName(key)}`).catch(() => {});
  },

  async getAllProperties() {
    if (!FLEX._userId) throw new Error("FLEX._userId not set");
    try {
      return (await getDB(`users/${FLEX._userId}`)) ?? {};
    } catch {
      return {};
    }
  },
});
