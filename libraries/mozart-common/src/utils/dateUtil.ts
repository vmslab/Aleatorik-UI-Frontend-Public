import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import duration, { DurationUnitsObjectType } from "dayjs/plugin/duration";
import LocalizedFormat from "dayjs/plugin/localizedFormat";

dayjs.extend(utc);
dayjs.extend(LocalizedFormat);
dayjs.extend(duration);

const dateTimeMax = "9999-12-31T23:59:59Z";
const dateTimeMin = "0001-01-01T00:00:00Z";

export interface IDateItem {
  key: number;
  text: string;
}

export const DateTimeMax = new Date(dateTimeMax);
export const DateTimeMin = new Date(dateTimeMin);

export const IsDateTimeMax = (date?: any | null): boolean => {
  if (!date) return false;
  const source = dayjs(date);
  const sourceUTC = source.add(source.local().utcOffset(), "m");
  if (!source.isValid()) return false;
  const target = dayjs(DateTimeMax);
  const format: string = "YYYY-MM-DD HH:mm:ss";
  return (
    sourceUTC.format(format) === target.format(format) ||
    source.format(format) === target.format(format)
  );
};

export const IsDateTimeMin = (date?: any | null): boolean => {
  if (!date) return false;
  const source = dayjs(date);
  if (!source.isValid()) return false;
  const target = dayjs(DateTimeMin);
  return source.isSame(target);
};

export const ConvertToMoment = (source: any): Dayjs | null => {
  if (!source) return null;
  const mmt = IsDateTimeMin(source) || IsDateTimeMax(source) ? dayjs(source).utc() : dayjs(source);
  if (!mmt.isValid()) return null;
  return mmt;
};

export const ConvertToDateTime = (source: any): Date | null => {
  const mmt = ConvertToMoment(source);
  if (!mmt) return null;
  return mmt.toDate();
};

export const ConvertToDateTimeString = (
  source: any,
  options?: {
    format: string;
  },
): string | null => {
  const { format } = options || {};
  const mmt = ConvertToMoment(source);
  if (!mmt) return null;
  return mmt.format(format || "YYYY-MM-DD LT");
};

export const GetWeeks = (format: "d" | "dd" | "ddd" | "dddd"): IDateItem[] => {
  const date = dayjs("0001-01-06");
  return [...Array(7).keys()].reduce((arr: IDateItem[], num: number) => {
    arr.push({
      key: Math.pow(2, num),
      text: date.add(num, "d").format(format),
    });
    return arr;
  }, []);
};

export const GetMonths = (format: "M" | "MM" | "MMM" | "MMMM"): IDateItem[] => {
  const date = dayjs("0001-01-01");
  return [...Array(12).keys()].reduce((arr: IDateItem[], num: number) => {
    arr.push({
      key: Math.pow(2, num),
      text: date.add(num, "M").format(format),
    });
    return arr;
  }, []);
};

export const GetDates = (format: "D" | "DD"): IDateItem[] => {
  const date = dayjs("0001-01-01");
  return [...Array(31).keys()].reduce((arr: IDateItem[], num: number) => {
    arr.push({
      key: num + 1,
      text: date.add(num, "d").format(format),
    });
    return arr;
  }, []);
};

export const durationToTicks = (value: DurationUnitsObjectType) => {
  const converted = dayjs.duration(value);
  return converted.asMilliseconds() * 10000;
};

export const ticksToString = (value: number, format: string) => {
  if (value === 0) return "0";
  const ms = value / 10000;
  const val = dayjs.duration(ms, "ms");
  return val.format(format);
};

export const ticksToDuration = (value: number) => {
  if (value === 0) return dayjs.duration(0, "ms");
  const ms = value / 10000;
  return dayjs.duration(ms, "ms");
};
