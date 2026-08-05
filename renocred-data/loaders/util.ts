import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { DatasetNotFoundError, InvalidDatasetError } from '../errors';

/**
 * Utility to safely read JSON files from the repository
 */
export function safeReadJson<T>(relativePath: string, contextName: string): T {
  const absolutePath = resolve(__dirname, '../../', relativePath);
  
  if (!existsSync(absolutePath)) {
    throw new DatasetNotFoundError(contextName, absolutePath);
  }
  
  try {
    const rawData = readFileSync(absolutePath, 'utf-8');
    return JSON.parse(rawData) as T;
  } catch (err: any) {
    throw new InvalidDatasetError(contextName, `Failed to parse JSON: ${err.message}`);
  }
}
