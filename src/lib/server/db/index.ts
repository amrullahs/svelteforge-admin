import { createPool } from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "./schema.js";

/**
 * We use process.env instead of $env/dynamic/private here 
 * so that this file can be imported by external scripts like the seeder (tsx) 
 * or drizzle-kit, which don't have access to SvelteKit's virtual modules.
 */
const connectionString = process.env.DATABASE_URL || "mysql://laravel:Sankei2017@localhost:3306/svelteforge";

const pool = createPool(connectionString);

export const db = drizzle(pool, { schema, mode: "default" });
