export interface UnifiedDB {
    query: (sql: string, params?: any[]) => Promise<any[]>;
    execute: (sql: string, params?: any[]) => Promise<{ lastInsertRowid: number | bigint, changes: number }>;
    get: (sql: string, params?: any[]) => Promise<any>;
}

let localDB: any = null;

export const getDB = async (): Promise<UnifiedDB> => {

    // BUT for "next dev" (local Node.js), we use better-sqlite3
    if (process.env.NODE_ENV === 'development') {
        if (!localDB) {
            const Database = require('better-sqlite3');
            localDB = new Database('local_dev.db');
            // Ensure table exists locally for dev
            localDB.exec(`
                CREATE TABLE IF NOT EXISTS daily_production_records (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  date TEXT NOT NULL UNIQUE,
                  production REAL NOT NULL, outdone REAL NOT NULL,
                  paper_quantity_kg REAL, paper_rate REAL, paper_cost REAL, paper_cost_per_tube REAL,
                  paste_quantity REAL, paste_rate REAL, paste_cost REAL, paste_cost_per_tube REAL,
                  outer_paste_quantity REAL, outer_paste_rate REAL, outer_paste_cost REAL, outer_paste_cost_per_tube REAL,
                  packing_quantity REAL, packing_rate REAL, packing_cost REAL, packing_cost_per_tube REAL,
                  labour_count REAL, labour_wage REAL, labour_cost REAL, labour_cost_per_tube REAL,
                  eb_units REAL, eb_amount REAL, eb_cost_per_tube REAL,
                  overheads_amount REAL, overheads_cost_per_tube REAL,
                  food_amount REAL, food_cost_per_tube REAL,
                  grand_total_cost_per_tube REAL NOT NULL,
                  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
                );
            `);
        }

        return {
            query: async (sql, params = []) => localDB.prepare(sql).all(...params),
            execute: async (sql, params = []) => localDB.prepare(sql).run(...params),
            get: async (sql, params = []) => localDB.prepare(sql).get(...params),
        };
    }

    // For Production (Cloudflare D1)
    // We'll trust that the platform passes the DB binding.
    // However, calling D1 from standard Next.js App Router (not edge runtime) is hard.
    // We should enable edge runtime for these routes.

    // Placeholder for now. In Next.js + Cloudflare Pages, we access bindings via `getRequestContext`.
    const { getRequestContext } = await import('@cloudflare/next-on-pages');
    const { env } = getRequestContext();
    const DB = (env as any).DB;

    return {
        query: async (sql, params = []) => {
            const result = await DB.prepare(sql).bind(...params).all();
            return result.results;
        },
        execute: async (sql, params = []) => {
            const result = await DB.prepare(sql).bind(...params).run();
            return { lastInsertRowid: result.meta.last_row_id, changes: result.meta.changes };
        },
        get: async (sql, params = []) => {
            return await DB.prepare(sql).bind(...params).first();
        }
    };
};
