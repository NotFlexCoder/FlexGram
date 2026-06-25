export const Utils = {
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },
};
