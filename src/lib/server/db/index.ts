import { env } from "$env/dynamic/private";
import { createPool } from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "./schema.js";

/**
 * We prioritize SvelteKit's environment variables ($env/dynamic/private) 
 * but fall back to process.env for external scripts like the seeder (tsx) 
 * or drizzle-kit.
 */
const connectionString = env.DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
	console.warn("DATABASE_URL is not set in environment. Falling back to default connection string.");
}

const pool = createPool(connectionString || "mysql://laravel:Sankei2017@localhost:3306/svelteforge");

export const db = drizzle(pool, { schema, mode: "default" });
