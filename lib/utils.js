/** @param {Date} date */
export function formatDate(date) {
  let tmpDate = Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDay(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
    date.getMilliseconds()
  );
  tmpDate = new Date(tmpDate);
  let formattedDate = tmpDate.toISOString().slice(0, 23).replace('T', ' ');
  return formattedDate;
}

const parseSparqlResults = (data) => {
  if (!data) return;
  const vars = data.head.vars;
  return data.results.bindings.map((binding) => {
    const obj = {};
    vars.forEach((varKey) => {
      if (binding[varKey]) {
        obj[varKey] = binding[varKey].value;
      }
    });
    return obj;
  });
};

export {
  parseSparqlResults
};
