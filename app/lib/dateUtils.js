/**
 * Returns the start of the day for a given date.
 * @param {Date} date The input date.
 * @returns {Date} The date set to 00:00:00.
 */
export function getStartOfDay(date) {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
}

/**
 * Returns the end of the day for a given date.
 * @param {Date} date The input date.
 * @returns {Date} The date set to 23:59:59.999.
 */
export function getEndOfDay(date) {
  const newDate = new Date(date);
  newDate.setHours(23, 59, 59, 999);
  return newDate;
}
