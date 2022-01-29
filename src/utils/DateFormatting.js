module.exports = class DateFormatting {
  /**
     * @param {Date|number} date Target date or timestamp.
     * @param {string} format Date format.
     **/
  static _format (date, style) {
    return `<t:${Math.floor(date / 1000)}` + (style ? `:${style}` : '') + '>'
  }
  
  static relative (date) {
    return this._format(date, 'R')
  }

  static date(date) {
    let dates = new Date(date)
    let year = dates.getFullYear().toString().slice(-2)
    let month = ('0' + (dates.getMonth() + 1)).slice(-2)
    let day = ('0' + dates.getDate()).slice(-2)
    let hour = ('0' + dates.getHours()).slice(-2)
    let minute = ('0' + dates.getMinutes()).slice(-2) 
    return year + '.' + month + '.' + day + '. ' + hour + ':' + minute
  }
}