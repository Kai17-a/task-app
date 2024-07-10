/**
 * 日付比較
 * @param date1
 * @param date2
 * @returns date1 > date2: 1, date1 = date2: 0, date1 < date2: -1
 */
export const compareDate = (date1: Date | string, date2: Date | string): number | void => {
  if (date1 > date2) return 1
  if (date1 = date2) return 0
  if (date1 < date2) return -1
}
