import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

// Create Neon SQL client - uses serverless connection pooling
const sql: NeonQueryFunction<false, false> = neon(process.env.DATABASE_URL!);

// Query helper - returns array of rows
export async function query<T = Record<string, unknown>>(
  text: string,
  params?: unknown[],
): Promise<{ rows: T[]; rowCount: number }> {
  const start = Date.now();

  // Convert $1, $2, etc. placeholders to the values
  let queryText = text;
  const values: unknown[] = [];

  if (params && params.length > 0) {
    // Replace $1, $2, etc. with actual values for tagged template
    values.push(...params);
  }

  try {
    // Use sql.query() for all queries to avoid tagged template ambiguity
    const rows = (await (sql as any).query(text, params || [])) as T[];
    const duration = Date.now() - start;

    if (process.env.NODE_ENV === "development") {
      // console.log("Params", params);
      // console.log("Text", text);
      // console.log("Duration", duration);
      // console.log("Rows", rows);
      console.log("Executed query", {
        text: text.substring(0, 50),
        duration,
        rows: rows.length,
      });
    }

    return { rows, rowCount: rows.length };
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
}

// Simple query execution using tagged template literal
export { sql };

// Transaction helper using multiple statements
export async function transaction<T>(
  callback: (executeSql: typeof sql) => Promise<T>,
): Promise<T> {
  // Note: Neon serverless doesn't support traditional transactions
  // For transaction support, consider using Neon's transaction API
  // or the @neondatabase/serverless Pool for full transaction support
  try {
    const result = await callback(sql);
    return result;
  } catch (e) {
    throw e;
  }
}

export default sql;
