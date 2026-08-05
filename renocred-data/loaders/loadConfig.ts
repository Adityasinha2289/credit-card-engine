import { Configuration } from '../types';
import { safeReadJson } from './util';

/**
 * Loads a specific configuration file.
 * 
 * @param {string} configName The configuration file to load (without .json extension)
 * @returns {Readonly<Configuration>} Immutable configuration object.
 */
export function loadConfig(configName: string): Readonly<Configuration> {
  const config = safeReadJson<Configuration>(`config/${configName}.json`, `Config:${configName}`);
  return Object.freeze(config);
}
