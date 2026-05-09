import { redirect, error } from "@sveltejs/kit";
import { db } from "$lib/server/db/index.js";
import { notifications, appSettings, roles, permissions, rolePermissions } from "$lib/server/db/schema.js";
import { eq, and, or, isNull, sql, desc } from "drizzle-orm";
import type { LayoutServerLoad } from "./$types.js";

export const load: LayoutServerLoad = async ({ locals }) => {
	if (!locals.user) {
		redirect(302, "/login");
	}

	// Check maintenance mode
	const maintenanceSetting = await db.query.appSettings.findFirst({
		where: eq(appSettings.key, "maintenanceMode"),
	});
	if (maintenanceSetting?.value === "true" && locals.user.role !== "admin") {
		error(503, "The application is currently under maintenance. Please check back later.");
	}

	const userNotificationFilter = or(
		eq(notifications.userId, locals.user.id),
		isNull(notifications.userId)
	);

	const [countResult] = await db
		.select({ count: sql<number>`count(*)` })
		.from(notifications)
		.where(and(eq(notifications.read, false), userNotificationFilter));

	const recentNotifications = await db
		.select({
			id: notifications.id,
			title: notifications.title,
			message: notifications.message,
			type: notifications.type,
			createdAt: notifications.createdAt,
		})
		.from(notifications)
		.where(and(eq(notifications.read, false), userNotificationFilter))
		.orderBy(desc(notifications.createdAt))
		.limit(5);

	// Get user permissions
	let userPermissions: string[] = [];
	if (locals.user.role === "admin") {
		// Admin gets all virtual permissions for UI
		const allPerms = await db.select({ key: permissions.key }).from(permissions);
		userPermissions = allPerms.map(p => p.key);
	} else {
		const perms = await db
			.select({ key: permissions.key })
			.from(rolePermissions)
			.innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
			.innerJoin(roles, eq(rolePermissions.roleId, roles.id))
			.where(eq(roles.id, locals.user.role));
		userPermissions = perms.map(p => p.key);
	}

	return {
		user: locals.user,
		permissions: userPermissions,
		unreadNotificationCount: countResult?.count ?? 0,
		recentNotifications,
	};
};
