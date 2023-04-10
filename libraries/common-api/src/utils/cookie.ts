import Cookies, { CookieChangeListener, CookieGetOptions, CookieSetOptions } from "universal-cookie";
import dayjs from "dayjs";

const cookies = new Cookies();

export function setCookie(key: string, value: any, options?: CookieSetOptions) {
  cookies.set(key, value, options);
}

export function getCookie(key: string, options?: CookieGetOptions) {
  return cookies.get(key, options);
}

export function removeCookie(key: string, options?: CookieSetOptions) {
  cookies.remove(key, options);
}

export function addCookieEvent(callback: CookieChangeListener) {
  cookies.addChangeListener(callback);
}

export function removeCookieEvent(callback: CookieChangeListener) {
  cookies.removeChangeListener(callback);
}

export function parseExpires(expires: string): Date {
  if (/^(?:\d{1,}(y|m|d|h|min|s))$/i.test(expires as string)) {
    // get capture number group
    const _expireTime = (expires as string).replace(/^(\d{1,})(?:y|m|d|h|min|s)$/i, "$1");
    // get capture type group , to lower case
    switch ((expires as string).replace(/^(?:\d{1,})(y|m|d|h|min|s)$/i, "$1").toLowerCase()) {
      // Frequency sorting
      case "m":
        // 60 * 60 * 24 * 30
        return dayjs()
          .add(+_expireTime * 2592000, "s")
          .toDate();
      case "d":
        // 60 * 60 * 24
        return dayjs()
          .add(+_expireTime * 86400, "s")
          .toDate();
        break;
      case "h":
        // 60 * 60
        return dayjs()
          .add(+_expireTime * 3600, "s")
          .toDate();
      case "min":
        // 60
        return dayjs()
          .add(+_expireTime * 60, "s")
          .toDate();
      case "s":
        return dayjs()
          .add(+_expireTime, "s")
          .toDate();
      case "y":
        // 60 * 60 * 24 * 30 * 12
        return dayjs()
          .add(+_expireTime * 31104000, "s")
          .toDate();
      default:
        return new Date();
    }
  } else {
    return new Date();
  }
}
