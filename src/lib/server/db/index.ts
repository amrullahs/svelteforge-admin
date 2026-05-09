import { createPool } from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "./schema.js";

const connectionString = process.env.DATABASE_URL || "mysql://root:password@localhost:3306/svelteforge";
const pool = createPool(connectionString);

export const db = drizzle(pool, { schema, mode: "default" });
