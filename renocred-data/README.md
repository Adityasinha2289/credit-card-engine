# RenoCred Data Repository

## Purpose
This repository acts as the single source of truth for all RenoCred data assets, completely independent of the application logic.

## Folder Overview
- `datasets/`: Master datasets and schemas.
- `config/`: System configuration mappings.
- `metadata/`: Taxonomies and entity definitions.
- `validation/`: Quality reports and metrics.
- `docs/`: Documentation for data structures.
- `scripts/`: Data utility scripts.
- `examples/`: Sample data structures.

## Integration
This repository is designed to be consumed by the RenoCred recommendation engine and backend services via direct data ingestion or CI/CD pipelines.

## Repository Philosophy
Clean, decoupled, production-grade data storage. No application code, no business logic, just data.

## Versioning Strategy
Semantic versioning (MAJOR.MINOR.PATCH) is used to track schema breaking changes, data additions, and fixes.

## Future Roadmap
- Automated data validation pipelines.
- Schema registry integration.

## Current Dataset Statistics
- Total Cards: 210
- Total Issuers: 32
- Total Networks: 5

## Validation Workflow
Datasets are validated automatically to ensure no structural drift before merging.

## Replacing Data
Future dataset versions should overwrite `datasets/master_dataset.json` and automatically regenerate statistics via CI scripts.
