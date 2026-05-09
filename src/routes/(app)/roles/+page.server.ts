import { db } from "$lib/server/db/index.js";
import { roles, permissions, rolePermissions, users } from "$lib/server/db/schema.js";
import { fail, type Actions } from "@sveltejs/kit";
import { eq, sql, and } from "drizzle-orm";
import type { PageServerLoad } from "./$types.js";
import { scanAndBuildPermissions } from "$lib/server/permissions.js";

export const load: PageServerLoad = async () => {
	let allPermissions = await db.select().from(permissions).orderBy(permissions.key);
	
	// Auto-scan if no permissions found
	if (allPermissions.length === 0) {
		await scanAndBuildPermissions();
		allPermissions = await db.select().from(permissions).orderBy(permissions.key);
	}

	const allRoles = await db.select().from(roles);
	const allRolePermissions = await db.select().from(rolePermissions);
	
	// Get user counts per role
	const userCounts = await db
		.select({
			role: users.role,
			count: sql<number>`count(*)`
		})
		.from(users)
		.groupBy(users.role);

	const rolesWithMeta = allRoles.map(role => ({
		...role,
		userCount: userCounts.find(c => c.role === role.id)?.count || 0,
		permissions: allRolePermissions
			.filter(rp => rp.roleId === role.id)
			.map(rp => rp.permissionId)
	}));

	return {
		roles: rolesWithMeta,
		permissions: allPermissions
	};
};

export const actions: Actions = {
	scan: async () => {
		const count = await scanAndBuildPermissions();
		return { success: true, count };
	},

	createRole: async ({ request }) => {
		const formData = await request.formData();
		const name = formData.get("name") as string;
		const description = formData.get("description") as string;

		if (!name) return fail(400, { message: "Name is required" });

		const id = name.toLowerCase().replace(/\s+/g, "-");
		
		try {
			await db.insert(roles).values({
				id,
				name,
				description
			});
			return { success: true };
		} catch (e) {
			return fail(500, { message: "Role already exists or database error" });
		}
	},

	updatePermissions: async ({ request }) => {
		const formData = await request.formData();
		const roleId = formData.get("roleId") as string;
		const selectedPerms = formData.getAll("permissions") as string[];

		if (!roleId) return fail(400, { message: "Role ID is required" });
		if (roleId === "admin") return fail(400, { message: "Cannot modify admin permissions" });

		// Delete existing and insert new
		await db.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));
		
		if (selectedPerms.length > 0) {
			const values = selectedPerms.map(pId => ({
				roleId,
				permissionId: pId
			}));
			await db.insert(rolePermissions).values(values);
		}

		return { success: true };
	},

	deleteRole: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get("id") as string;

		if (["admin", "editor", "viewer"].includes(id)) {
			return fail(400, { message: "Cannot delete system roles" });
		}

		await db.delete(roles).where(eq(roles.id, id));
		return { success: true };
	}
};
