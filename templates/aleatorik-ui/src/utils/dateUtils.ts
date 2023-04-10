declare global {
  interface Date {
    toDateTimeString(): string;
    trimDate(): Date;
    addDays(days: number): Date;
  }
}

export default (() => {
  Date.prototype.trimDate = function () {
    return new Date(this.getFullYear(), this.getMonth(), this.getDate());
  };

  Date.prototype.toJSON = function () {
    const hoursDiff = this.getHours() - this.getTimezoneOffset() / 60;
    const date = new Date(this);
    date.setHours(hoursDiff);
    return date.toISOString();
  };

  Date.prototype.toDateString = function () {
    const year = yearLeftPad(this.getFullYear());
    const month = leftPad(this.getMonth() + 1);
    const day = leftPad(this.getDate());
    return [year, month, day].join("-");
  };

  Date.prototype.toDateTimeString = function () {
    const year = yearLeftPad(this.getFullYear());
    const month = leftPad(this.getMonth() + 1);
    const day = leftPad(this.getDate());
    const dateString = [year, month, day].join("-");

    const hour = ("0" + this.getHours()).slice(-2);
    const minute = ("0" + this.getMinutes()).slice(-2);
    const second = ("0" + this.getSeconds()).slice(-2);
    const timeString = [hour, minute, second].join(":");

    return dateString + " " + timeString;
  };

  Date.prototype.addDays = function (days = 0) {
    const date = new Date(this);
    date.setDate(this.getDate() + days);
    return date;
  };

  const leftPad = (value: any) => {
    if (value >= 10) {
      return value;
    }
    return `0${value}`;
  };

  const yearLeftPad = (value: any) => {
    if (value >= 1000) {
      return value;
    }
    if (value >= 100) {
      return `0${value}`;
    }
    if (value >= 10) {
      return `00${value}`;
    }
    return `000${value}`;
  };
})();
