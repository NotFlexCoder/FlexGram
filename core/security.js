const webSecret = () => {
  const secret = process.env.WEBHOOK_SECRET;
  if (!secret) throw new Error("WEBHOOK_SECRET is not set");
  return secret;
};

const ALLOWED_UPDATES = [
  "message",
  "edited_message",
  "callback_query",
  "inline_query",
  "pre_checkout_query",
  "shipping_query",
  "poll",
  "poll_answer",
  "my_chat_member",
  "chat_member",
];

export function verifyTGRequest(req) {
  const secret = webSecret();
  const token = req.headers["x-telegram-bot-api-secret-token"];
  if (!token) return false;
  return secret === token;
}

export function secureInput(value) {
  if (typeof value !== "string") return value;
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function isValidUpdate(body) {
  if (!body || typeof body !== "object") return false;
  return ALLOWED_UPDATES.some((key) => key in body);
}

export function rateLimit(userid) {
  return `rate_${userid}_${Math.floor(Date.now() / 60000)}`;
}
