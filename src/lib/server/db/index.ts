import { env } from "$env/dynamic/private";
import { createPool } from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "./schema.js";

/**
 * We prioritize SvelteKit's environment variables ($env/dynamic/private) 
 * but fall back to process.env for external scripts like the seeder (tsx).
 */
let connectionString = env.DATABASE_URL || process.env.DATABASE_URL;

// Fallback for external scripts (seed, drizzle-kit) that don't have $env
if (!connectionString) {
	try {
		const dotenv = await import("dotenv");
		dotenv.config();
		connectionString = process.env.DATABASE_URL;
	} catch (e) {
		// dotenv not available or failed, ignore
	}
}

if (!connectionString) {
	throw new Error("DATABASE_URL must be set in environment variables or .env file");
}

const pool = createPool(connectionString);

export const db = drizzle(pool, { schema, mode: "default" });
