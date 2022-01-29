export default class DateFormatting {
  static _format(date: number, style: string) {
    return `<t:${Math.floor(date / 1000)}` + (style ? `:${style}` : "") + ">"
  }

  static relative(date: number): string|undefined {
    return this._format(date, "R")
  }

  static date(date: number) {
    const dates = new Date(date)
    const year = dates.getFullYear().toString().slice(-2)
    const month = ("0" + (dates.getMonth() + 1)).slice(-2)
    const day = ("0" + dates.getDate()).slice(-2)
    const hour = ("0" + dates.getHours()).slice(-2)
    const minute = ("0" + dates.getMinutes()).slice(-2)
    return year + "." + month + "." + day + ". " + hour + ":" + minute
  }
}
