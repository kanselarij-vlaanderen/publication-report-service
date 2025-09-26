/**
 * WORKAROUND: bug in sparqlEscapeDate returns the previous day in Belgium
 * @param {Date} date
 */
export function sparqlEscapeDateLocal(date) {
  const year = date.getFullYear().toString().padStart(4, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `"${year}-${month}-${day}"^^xsd:date`;
}

export function sparqlParseRecords(data) {
  const vars = data.head.vars;
  return data.results.bindings.map((result) => {
    const record = {};
    for (const varKey of vars) {
      const varInfo = result[varKey];
      let value = result[varKey]?.value;
      if (varInfo === 'typed-literal' && varInfo !== undefined) {
        const datatype = varInfo.datatype;
        if (datatype === 'http://www.w3.org/2001/XMLSchema#dateTime' || datatype === 'http://www.w3.org/2001/XMLSchema#date' ) {
          value = new Date(value);
        }
      }
      record[varKey] = value;
    }
    return record;
  });
}
