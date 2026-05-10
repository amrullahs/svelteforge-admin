import * as dotenv from "dotenv";
import path from "path";
import { createPool } from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "./schema.js";

// Load .env file from the current working directory
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

/**
 * We use process.env instead of $env/dynamic/private here 
 * so that this file can be imported by external scripts like the seeder (tsx) 
 * or drizzle-kit, which don't have access to SvelteKit's virtual modules.
 */
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
	console.warn("DATABASE_URL is not set in environment. Falling back to default connection string.");
}

const pool = createPool(connectionString || "mysql://laravel:Sankei2017@localhost:3306/svelteforge");

export const db = drizzle(pool, { schema, mode: "default" });
