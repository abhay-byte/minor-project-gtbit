# Cloud Database Migrations

This directory contains scripts to run Clinico database migrations on a cloud PostgreSQL server.

## Files

- `run_cloud_migrations.sh` - Linux/macOS script to run migrations
- `run_cloud_migrations.bat` - Windows batch script to run migrations
- `.env` - Environment file for database connection (stored in `documentation/database/`)

## Setup

1. Update the `.env` file in `documentation/database/` with your cloud database connection string:
   ```
   DATABASE_URL=postgresql://username:password@your-cloud-host:5432/your-database-name
   ```

2. Make the shell script executable (Linux/macOS):
   ```bash
   chmod +x run_cloud_migrations.sh
   ```

## Usage

### Linux/macOS:
```bash
./run_cloud_migrations.sh
```

### Windows:
```cmd
run_cloud_migrations.bat
```

## Requirements

- PostgreSQL client tools (psql) must be installed and available in PATH
- Proper network access to your cloud database
- Appropriate database permissions to create tables and run migrations

## Migration Files

The scripts will run all SQL files in the `migrations/` directory in alphabetical order:
- `001_create_users_tables.sql`
- `002_create_appointments_tables.sql`
- `003_create_discovery_and_records_tables.sql`
- `004_create_interaction_tables.sql`
- `05_add_missing_tables.sql`
- `06_update_id_columns_to_uuid.sql`