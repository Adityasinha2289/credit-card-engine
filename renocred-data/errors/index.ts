export class DatasetNotFoundError extends Error {
  constructor(datasetName: string, path: string) {
    super(`Dataset not found: ${datasetName} at path: ${path}`);
    this.name = 'DatasetNotFoundError';
  }
}

export class InvalidDatasetError extends Error {
  constructor(datasetName: string, reason: string) {
    super(`Invalid dataset structure for ${datasetName}: ${reason}`);
    this.name = 'InvalidDatasetError';
  }
}

export class InvalidConfigurationError extends Error {
  constructor(configName: string, reason: string) {
    super(`Invalid configuration for ${configName}: ${reason}`);
    this.name = 'InvalidConfigurationError';
  }
}
