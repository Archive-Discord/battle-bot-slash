class DateFormatting {
  static _format (date: number | string | Date, style: String) {
    return `<t:${Math.floor(Number(date) / 1000)}` + (style ? `:${style}` : '') + '>'
  }
  
  static relative (date: number | string | Date) {
    return this._format(date, 'R')
  }

  static date(date: number | string | Date) {
    let dates = new Date(date)
    let year = dates.getFullYear().toString().slice(-2)
    let month = ('0' + (dates.getMonth() + 1)).slice(-2)
    let day = ('0' + dates.getDate()).slice(-2)
    let hour = ('0' + dates.getHours()).slice(-2)
    let minute = ('0' + dates.getMinutes()).slice(-2) 
    return year + '.' + month + '.' + day + '. ' + hour + ':' + minute
  }
}
export default DateFormatting;
