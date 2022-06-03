/**
 * WORKAROUND: bug in sparqlEscapeDate returns the previous day in Belgium
 * @param {Date} date
 */
export function sparqlEscapeDateLocal(date) {
  let year = date.getFullYear().toString().padStart(4, '0');
  let month = (date.getMonth() + 1).toString().padStart(2, '0');
  let day = date.getDate().toString().padStart(2, '0');
  return `"${year}-${month}-${day}"^^xsd:date`;
}

export function sparqlParseRecords(data) {
  let vars = data.head.vars;
  return data.results.bindings.map((result) => {
    let record = {};
    for (let varKey of vars) {
      let varInfo = result[varKey];
      let value = result[varKey]?.value;
      if (varInfo === 'typed-literal' && varInfo !== undefined) {
        let datatype = varInfo.datatype;
        if (datatype === 'http://www.w3.org/2001/XMLSchema#dateTime') {
          value = new Date(value);
        } else if (datatype === 'http://www.w3.org/2001/XMLSchema#date') {
          value = new Date(value);
        }
      }
      record[varKey] = value;
    }
    return record;
  });
}
