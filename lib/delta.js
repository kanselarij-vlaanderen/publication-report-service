import { JOB } from '../config';

export function filterInsertedJobUris(deltas) {
  const newJobUris = [];

  for (const delta of deltas) {
    const inserts = delta.inserts;

    for (const triple of inserts) {
      const isJob =
        triple.predicate.value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' &&
        triple.object.value === JOB.RDF_TYPE;
      if (isJob) {
        const jobUri = triple.subject.value;
        newJobUris.push(jobUri);
      }
    }
  }

  return newJobUris;
}
