/**
 * sparqlEscapeDate uses toISOString()
 *  which takes the time in UTC
 *  and then takes only the date portion
 *  resulting in the previous day
 * @param {Date} date
 */
export function sparqlEscapeDateLocal(date) {
  let year = date.getFullYear().toString().padStart(4, '0');
  let month = (date.getMonth() + 1).toString().padStart(2, '0');
  let day = date.getDate().toString().padStart(2, '0');
  return `"${year}-${month}-${day}"^^xsd:date`;
}
