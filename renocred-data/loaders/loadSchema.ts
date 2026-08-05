import { safeReadJson } from './util';

/**
 * Loads the inferred dataset JSON schema.
 * 
 * @returns {Readonly<Record<string, any>>} Immutable schema definition.
 */
export function loadSchema(): Readonly<Record<string, any>> {
  const schema = safeReadJson<Record<string, any>>('datasets/dataset_schema.json', 'DatasetSchema');
  return Object.freeze(schema);
}
