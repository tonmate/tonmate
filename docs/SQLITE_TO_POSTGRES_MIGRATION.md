# Migrating from SQLite to PostgreSQL

This guide helps you migrate your existing Tonmate installation from SQLite to PostgreSQL, which is now the standard and recommended database for all deployments.

## Why PostgreSQL?

SQLite has been deprecated in Tonmate for the following reasons:

1. **Scalability**: PostgreSQL provides better performance for multi-user environments
2. **Concurrency**: Better handling of concurrent connections and writes
3. **Advanced Features**: Full SQL compliance, JSON support, and advanced indexing
4. **Production Readiness**: Built-in replication, backup, and disaster recovery
5. **Ecosystem Support**: Better integration with monitoring tools and cloud platforms

## Migration Process

### Step 1: Install PostgreSQL

If you don't have PostgreSQL installed:

**For macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**For Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**For Docker (recommended):**
```bash
# Already included in docker-compose.yml
docker-compose up -d db
```

### Step 2: Create a New PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create the database
CREATE DATABASE tonmate;

# Exit
\q
```

### Step 3: Export Data from SQLite

Create a migration script:

```bash
mkdir -p scripts/migration
touch scripts/migration/sqlite-to-postgres.js
```

Add the following content to `scripts/migration/sqlite-to-postgres.js`:

```javascript
const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuration - Update these variables
const SQLITE_PATH = './prisma/dev.db'; // Path to your SQLite database
const PG_CONNECTION_STRING = 'postgresql://postgres:postgres@localhost:5432/tonmate'; // Your PostgreSQL connection string

// Initialize connections
const db = new sqlite3.Database(SQLITE_PATH);
const pgPool = new Pool({
  connectionString: PG_CONNECTION_STRING,
});

async function main() {
  console.log('🚀 Starting SQLite to PostgreSQL migration...');
  
  try {
    // Get tables from SQLite
    const tables = await new Promise((resolve, reject) => {
      db.all(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_%'",
        (err, tables) => {
          if (err) reject(err);
          resolve(tables);
        }
      );
    });
    
    console.log(`📊 Found ${tables.length} tables to migrate`);
    
    for (const table of tables) {
      const tableName = table.name;
      console.log(`📋 Migrating table: ${tableName}`);
      
      // Get table schema
      const schema = await new Promise((resolve, reject) => {
        db.all(`PRAGMA table_info(${tableName})`, (err, columns) => {
          if (err) reject(err);
          resolve(columns);
        });
      });
      
      // Get data from SQLite table
      const rows = await new Promise((resolve, reject) => {
        db.all(`SELECT * FROM ${tableName}`, (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        });
      });
      
      if (rows.length === 0) {
        console.log(`  - Table ${tableName} is empty, skipping`);
        continue;
      }
      
      console.log(`  - Found ${rows.length} rows`);
      
      // Create column definitions for INSERT
      const columnNames = schema.map(col => col.name).join(', ');
      
      // Insert data into PostgreSQL
      const client = await pgPool.connect();
      try {
        // Begin transaction
        await client.query('BEGIN');
        
        for (const row of rows) {
          const values = schema.map(col => {
            const value = row[col.name];
            if (value === null) return 'NULL';
            if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
            if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
            return value;
          }).join(', ');
          
          await client.query(
            `INSERT INTO "${tableName}" (${columnNames}) VALUES (${values}) ON CONFLICT DO NOTHING`
          );
        }
        
        // Commit transaction
        await client.query('COMMIT');
        console.log(`  ✅ Successfully migrated ${rows.length} rows to table ${tableName}`);
      } catch (e) {
        await client.query('ROLLBACK');
        console.error(`  ❌ Error migrating table ${tableName}:`, e.message);
      } finally {
        client.release();
      }
    }
    
    console.log('✅ Migration completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    db.close();
    await pgPool.end();
  }
}

main();
```

Install the required dependencies:

```bash
npm install sqlite3 pg
```

Run the migration script:

```bash
node scripts/migration/sqlite-to-postgres.js
```

### Step 4: Update Environment Variables

Update your `.env` file to use PostgreSQL:

```bash
# Replace this
DATABASE_URL="file:./prisma/dev.db"

# With this
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tonmate"
```

If you're using Docker:

```bash
DATABASE_URL="postgresql://postgres:postgres@db:5432/tonmate"
```

### Step 5: Run Prisma Migrations

Generate and apply the Prisma schema to your new PostgreSQL database:

```bash
# Generate Prisma client
npx prisma generate

# Apply migrations
npx prisma migrate deploy
```

### Step 6: Verify Migration

Start your application and verify that everything is working correctly with PostgreSQL:

```bash
npm run dev

# Or with Docker
docker-compose up -d
```

## Troubleshooting

### Connection Issues

If you have connection issues:

1. Check that PostgreSQL is running:
   ```bash
   # For local installations
   pg_isready
   
   # For Docker
   docker-compose ps db
   ```

2. Verify your connection string:
   ```bash
   psql "postgresql://postgres:postgres@localhost:5432/tonmate"
   ```

### Data Type Errors

If you encounter data type errors during migration:

1. Check the data types in your PostgreSQL schema
2. Modify the migration script to handle type conversions
3. Consider manually migrating problematic tables

### Performance Optimization

After migration, consider optimizing your PostgreSQL database:

1. Add indexes for frequently queried fields
2. Run `ANALYZE` to update PostgreSQL statistics
3. Configure PostgreSQL settings based on your server resources

## Need Help?

If you encounter issues during migration, please:

1. Check the [GitHub issues](https://github.com/tonmate/tonmate/issues) for similar problems
2. Read the [PostgreSQL documentation](https://www.postgresql.org/docs/)
3. Open a new issue with detailed information about your problem

## Conclusion

You have successfully migrated from SQLite to PostgreSQL! This change will enable better performance, reliability, and scalability for your Tonmate installation.
