export const decodeEscapeAtob = (text?: string) => {
  if (!text) return "";
  return decodeURIComponent(atob(text));
};

export const encodeUnescapeBtoa = (text?: string) => {
  if (!text) return "";
  return btoa(encodeURIComponent(text));
};
