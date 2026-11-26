export const keyboard = {
  reply(button, options = {}) {
    let rows;
    if (Array.isArray(button[0])) {
      rows = button.map((row) =>
        row.map((b) => (typeof b === "string" ? { text: b } : b)),
      );
    } else {
      rows = button.map((b) => [typeof b === "string" ? { text: b } : b]);
    }

    return {
      keyboard: rows,
      resize_keyboard: options.resize ?? true,
      one_time_keyboard: options.oneTime ?? false,
      input_field_placeholder: options.placeholder ?? undefined,
      ...options.extra,
    };
  },

  remove() {
    return { remove_keyboard: true };
  },

  contact(text) {
    return { text, request_contact: true };
  },

  location(text) {
    return { text, request_location: true };
  },

  poll(text, type = "regular") {
    return { text, request_poll: { type } };
  },
};
