import * as dotenv from "dotenv";
import { createPool } from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "./schema.js";

// Load .env if not already loaded (useful for seeder and non-SvelteKit environments)
dotenv.config();

/**
 * We use process.env to be compatible with both SvelteKit and external scripts (tsx).
 * SvelteKit's adapter-node also populates process.env in production.
 */
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
	throw new Error("DATABASE_URL must be set in environment variables or .env file");
}

const pool = createPool(connectionString);

export const db = drizzle(pool, { schema, mode: "default" });
