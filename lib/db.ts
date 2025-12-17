import { neon } from '@neondatabase/serverless';

// Lazy-initialize to allow dotenv to load first in migration scripts
let sqlInstance: ReturnType<typeof neon> | null = null;

function getSql() {
  if (!sqlInstance) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set. Please set it in your .env.local file.');
    }
    sqlInstance = neon(databaseUrl);
  }
  return sqlInstance;
}

// Create sql as a callable template literal function
export const sql = ((strings: TemplateStringsArray, ...values: any[]) => {
  return getSql()(strings, ...values);
}) as ReturnType<typeof neon>;

