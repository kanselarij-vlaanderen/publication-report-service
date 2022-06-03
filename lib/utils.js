/**
 * @template T
 * @param {() => Promise<T>)} fn function to retry
 *  Return the result when function returns.
 *  Retry when an error is thrown.
 * @param {Iterable<number>} intervals iterable yielding the number of milliseconds to wait between tries
 * @returns {T} result of successful call of fn
 */
export async function retry(fn, intervals) {
  let iterator = intervals[Symbol.iterator]();
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      let result = await fn();
      return result;
    } catch (err) {
      console.log(`try failed: ${err}`);
      let next = iterator.next();
      if (next.done) throw err;
      await timeout(next.value);
    }
  }
}

export function timeout(milliseconds) {
  return new Promise((res) => {
    setTimeout(res, milliseconds);
  });
}
