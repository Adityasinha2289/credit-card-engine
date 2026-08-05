import { DatasetStatistics, DatasetVersion } from '../types';
import { safeReadJson } from './util';

/**
 * Loads the dataset statistics.
 * 
 * @returns {Readonly<DatasetStatistics>} Immutable dataset statistics.
 */
export function loadStatistics(): Readonly<DatasetStatistics> {
  const stats = safeReadJson<DatasetStatistics>('datasets/dataset_statistics.json', 'DatasetStatistics');
  return Object.freeze(stats);
}

/**
 * Loads the dataset version tracking info.
 * 
 * @returns {Readonly<DatasetVersion>} Immutable dataset version info.
 */
export function loadVersion(): Readonly<DatasetVersion> {
  const ver = safeReadJson<DatasetVersion>('datasets/dataset_version.json', 'DatasetVersion');
  return Object.freeze(ver);
}
