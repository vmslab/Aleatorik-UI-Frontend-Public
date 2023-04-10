import dayjs, { ConfigType, Dayjs, OpUnitType, QUnitType, ManipulateType } from "dayjs";

/**
 * DayjsRange Instance
 */
export class DayjsRange {
  /**
   * Required `startDate` `endDate`
   */
  constructor(public startDate: Dayjs, public endDate: Dayjs) {}

  /**
   * This returns a boolean indicating whether the DayjsRange object contains a valid date or not.
   * ```
   * dayjsRange('', '').isValidRange() // => boolean
   * ```
   */
  isValidRange(): boolean {
    return this.startDate.isValid() && this.endDate.isValid();
  }

  /**
   * All DayjsRange objects are immutable. Still, `dayjsRange#clone` can create a clone of the current object if you need one.
   * ```
   * dayjsRange().clone()// => DayjsRange
   * ```
   */
  clone(): DayjsRange {
    return new DayjsRange(this.startDate, this.endDate);
  }

  /**
   * Compare between DayjsRange objects.
   * ```
   * dayjsRange().isOverlap(dayjsRange()) // => boolean
   * ```
   */
  isOverlap(other?: DayjsRange): boolean {
    if (!(other instanceof DayjsRange) || !other.isValidRange()) {
      return false;
    }

    return this.startDate < other.endDate && this.endDate > other.startDate;
  }

  /**
   * This indicates whether the DayjsRange object is the same as the other supplied Date range.
   * ```
   * dayjsRange().isEqual(dayjsRange()) // => boolean
   * ```
   */
  isEqual(other: DayjsRange): Boolean {
    return this.startDate.isSame(other.startDate) && this.endDate.isSame(other.endDate);
  }

  /**
   * Returns a cloned DayjsRange object with a start-date amount of time added.
   * ```
   * dayjsRange().addStartRange(7, 'day')// => DayjsRange
   * ```
   * Units are case insensitive, and support plural and short forms.
   */
  addStartRange(number: number, unit: ManipulateType): DayjsRange {
    return new DayjsRange(this.startDate.add(number, unit), this.endDate);
  }

  /**
   * Returns a cloned DayjsRange object with a end-date amount of time added.
   * ```
   * dayjsRange().addEndRange(7, 'day')// => DayjsRange
   * ```
   * Units are case insensitive, and support plural and short forms.
   */
  addEndRange(number: number, unit: ManipulateType): DayjsRange {
    return new DayjsRange(this.startDate, this.endDate.add(number, unit));
  }

  /**
   * Returns a cloned DayjsRange object with a start-date amount of time subtracted.
   * ```
   * dayjsRange().subtractStartRange(7, 'day')// => DayjsRange
   * ```
   * Units are case insensitive, and support plural and short forms.
   */
  subtractStartRange(number: number, unit: ManipulateType): DayjsRange {
    return new DayjsRange(this.startDate.subtract(number, unit), this.endDate);
  }

  /**
   * Returns a cloned DayjsRange object with a end-date amount of time subtracted.
   * ```
   * dayjsRange().subtractEndRange(7, 'day')// => DayjsRange
   * ```
   * Units are case insensitive, and support plural and short forms.
   */
  subtractEndRange(number: number, unit?: ManipulateType): DayjsRange {
    return new DayjsRange(this.startDate, this.endDate.subtract(number, unit));
  }

  diff(unit?: QUnitType | OpUnitType, precise?: boolean) {
    return this.endDate.diff(this.startDate, unit, precise);
  }

  duration(unit?: QUnitType | OpUnitType, precise?: boolean) {
    return this.diff(unit, precise);
  }

  intersect(other: DayjsRange) {
    const start = this.startDate.valueOf();
    const end = this.endDate.valueOf();
    const otherStart = other.startDate.valueOf();
    const otherEnd = other.endDate.valueOf();
    const isZeroLength = start === end;
    const isOtherZeroLength = otherStart === otherEnd;

    // Zero-length ranges
    if (isZeroLength) {
      const point = start;

      if (point === otherStart || point === otherEnd) {
        return null;
      } else if (point > otherStart && point < otherEnd) {
        return this.clone();
      }
    } else if (isOtherZeroLength) {
      const point = otherStart;

      if (point === start || point === end) {
        return null;
      } else if (point > start && point < end) {
        return new DayjsRange(dayjs(point), dayjs(point));
      }
    }

    // Non zero-length ranges
    if (start <= otherStart && otherStart < end && end < otherEnd) {
      return new DayjsRange(dayjs(otherStart), dayjs(end));
    } else if (otherStart < start && start < otherEnd && otherEnd <= end) {
      return new DayjsRange(dayjs(start), dayjs(otherEnd));
    } else if (otherStart < start && start <= end && end < otherEnd) {
      return this.clone();
    } else if (start <= otherStart && otherStart <= otherEnd && otherEnd <= end) {
      return new DayjsRange(dayjs(otherStart), dayjs(otherEnd));
    }

    return null;
  }

  subtract(other: DayjsRange): DayjsRange[] {
    const start = this.startDate.valueOf();
    const end = this.endDate.valueOf();
    const oStart = other.startDate.valueOf();
    const oEnd = other.endDate.valueOf();

    if (this.intersect(other) === null) {
      return [this];
    } else if (oStart <= start && start < end && end <= oEnd) {
      return [];
    } else if (oStart <= start && start < oEnd && oEnd < end) {
      return [new DayjsRange(dayjs(oEnd), dayjs(end))];
    } else if (start < oStart && oStart < end && end <= oEnd) {
      return [new DayjsRange(dayjs(start), dayjs(oStart))];
    } else if (start < oStart && oStart < oEnd && oEnd < end) {
      return [new DayjsRange(dayjs(start), dayjs(oStart)), new DayjsRange(dayjs(oEnd), dayjs(end))];
    } else if (start < oStart && oStart < end && oEnd < end) {
      return [
        new DayjsRange(dayjs(start), dayjs(oStart)),
        new DayjsRange(dayjs(oStart), dayjs(end)),
      ];
    }

    return [];
  }
}

/**
 * Return `DayjsRange` Instance
 */
export function dayjsRange(first?: ConfigType, second?: ConfigType): DayjsRange {
  const { firstDate, secondDate } = {
    firstDate: dayjs(first),
    secondDate: dayjs(second),
  };
  const { startDate, endDate } =
    firstDate > secondDate
      ? { startDate: secondDate, endDate: firstDate }
      : { startDate: firstDate, endDate: secondDate };

  return new DayjsRange(startDate, endDate);
}
