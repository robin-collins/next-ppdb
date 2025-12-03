# Migration Overview

> [!NOTE]
> **Automated Migration**: The migration process is now fully automated via the application's `/setup` page. Manual execution of migration scripts is no longer required for standard deployments.

## How to Migrate

Please refer to the **[Production Deployment Guide](PRODUCTION_DEPLOYMENT.md)** for step-by-step instructions on how to:

1.  Backup your old database.
2.  Launch the new application.
3.  Use the `/setup` page to import and migrate your data.

## Technical Details (Under the Hood)

The `/setup` page performs the following operations automatically:

1.  **Import**: Loads your raw SQL dump into a temporary staging area.
2.  **Schema Normalization**:
    - Converts legacy `MyISAM` tables to `InnoDB`.
    - Updates character sets to `utf8mb4`.
    - Fixes invalid dates (e.g., `0000-00-00` becomes `NULL`).
    - Standardizes column names (e.g., `SEX` -> `sex`).
3.  **Validation**: Runs integrity checks to ensure no data was lost during transformation.

For advanced troubleshooting or manual migration scenarios, please inspect the `prisma/migrations` folder in the source code.
