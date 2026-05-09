import { createPool } from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "./schema.js";
import { hash } from "@node-rs/argon2";
import { generateId } from "../id.js";

// Note: For MySQL testing, you typically need a real database or a container.
// This is a placeholder for a test database connection.
export function createTestDb() {
	const connectionString = process.env.TEST_DATABASE_URL || "mysql://root:password@localhost:3306/svelteforge_test";
	const pool = createPool(connectionString);
	return drizzle(pool, { schema, mode: "default" });
}

export async function createTestUser(
	db: ReturnType<typeof createTestDb>,
	overrides: Partial<{
		id: string;
		name: string;
		email: string;
		username: string;
		role: "admin" | "editor" | "viewer";
	}> = {}
) {
	const id = overrides.id ?? generateId(10);
	const passwordHash = await hash("password123", {
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1,
	});

	await db.insert(schema.users).values({
		id,
		name: overrides.name ?? "Test User",
		email: overrides.email ?? `${id}@test.com`,
		username: overrides.username ?? `user_${id.slice(0, 8)}`,
		passwordHash,
		role: overrides.role ?? "viewer",
		createdAt: new Date(),
		updatedAt: new Date(),
	});

	return id;
}

export function createMockLocals(userId: string, role: string = "admin") {
	return {
		user: {
			id: userId,
			name: "Test User",
			email: "test@test.com",
			username: "testuser",
			role,
		},
		session: { id: "test-session", userId, expiresAt: Date.now() + 86400000 },
	};
}

export function createFormData(entries: Record<string, string>): FormData {
	const fd = new FormData();
	for (const [key, value] of Object.entries(entries)) {
		fd.set(key, value);
	}
	return fd;
}

export function createMockRequest(formData: FormData): Request {
	return new Request("http://localhost", {
		method: "POST",
		body: formData,
	});
}
