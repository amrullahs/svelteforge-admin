import { db } from "./db/index.js";
import { permissions, rolePermissions, roles, users } from "./db/schema.js";
import { eq, inArray, and } from "drizzle-orm";
import fs from "fs";
import path from "path";

/**
 * Scan src/routes/(app) to generate permissions based on routes
 */
export async function scanAndBuildPermissions() {
	const routesDir = path.resolve("src/routes/(app)");
	if (!fs.existsSync(routesDir)) return;

	const items = fs.readdirSync(routesDir, { withFileTypes: true });
	const resources = items
		.filter((item) => item.isDirectory())
		.map((item) => item.name);

	// Basic resources from our app structure
	const basePermissions = [
		{ key: "dashboard:view", name: "View Dashboard", description: "Access to the main dashboard" },
		...resources.flatMap((res) => [
			{ key: `${res}:view`, name: `View ${res.charAt(0).toUpperCase() + res.slice(1)}`, description: `Access to ${res} page` },
			{ key: `${res}:manage`, name: `Manage ${res.charAt(0).toUpperCase() + res.slice(1)}`, description: `Full control over ${res}` },
		]),
	];

	// Insert or update permissions
	for (const p of basePermissions) {
		const id = Buffer.from(p.key).toString("hex").slice(0, 10); // Simple deterministic ID
		await db
			.insert(permissions)
			.values({ id, ...p })
			.onDuplicateKeyUpdate({
				set: { name: p.name, description: p.description },
			});
	}

	// Ensure Admin always has all permissions
	const allPerms = await db.select().from(permissions);
	const adminRole = await db.select().from(roles).where(eq(roles.id, "admin"));
	
	if (adminRole.length > 0) {
		for (const p of allPerms) {
			await db
				.insert(rolePermissions)
				.values({ roleId: "admin", permissionId: p.id })
				.onDuplicateKeyUpdate({
					set: { roleId: "admin" }, // NOP update to handle conflict
				});
		}
	}

	return allPerms.length;
}

/**
 * Check if a user has a specific permission
 */
export async function hasPermission(userId: string, permissionKey: string): Promise<boolean> {
	// 1. Get user and their role
	const [user] = await db.select({ role: users.role }).from(users).where(eq(users.id, userId));
	if (!user) return false;

	// 2. Admin always has all permissions
	if (user.role === "admin") return true;

	// 3. Check role_permissions
	const result = await db
		.select()
		.from(rolePermissions)
		.innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
		.innerJoin(roles, eq(rolePermissions.roleId, roles.id))
		.where(
			and(
				eq(roles.id, user.role),
				eq(permissions.key, permissionKey)
			)
		);

	return result.length > 0;
}
