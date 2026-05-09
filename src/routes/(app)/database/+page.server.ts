import { db } from "$lib/server/db/index.js";
import { users, sessions, pages, notifications, appSettings } from "$lib/server/db/schema.js";
import { sql } from "drizzle-orm";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types.js";

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user!.role !== "admin") {
		error(403, "Admin access required");
	}

	// Get table row counts
	const [usersCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
	const [sessionsCount] = await db.select({ count: sql<number>`count(*)` }).from(sessions);
	const [pagesCount] = await db.select({ count: sql<number>`count(*)` }).from(pages);
	const [notificationsCount] = await db
		.select({ count: sql<number>`count(*)` })
		.from(notifications);
	const [settingsCount] = await db.select({ count: sql<number>`count(*)` }).from(appSettings);

	// Get MySQL Version
	const versionResult = await db.execute(sql`SELECT VERSION() as version`);
	const mysqlVersion = (versionResult[0] as any)?.[0]?.version || "Unknown";

	// Get Database Name
	const dbNameResult = await db.execute(sql`SELECT DATABASE() as db_name`);
	const databaseName = (dbNameResult[0] as any)?.[0]?.db_name || "svelteforge";

	const tables = [
		{ name: "users", rows: Number(usersCount.count) },
		{ name: "sessions", rows: Number(sessionsCount.count) },
		{ name: "pages", rows: Number(pagesCount.count) },
		{ name: "notifications", rows: Number(notificationsCount.count) },
		{ name: "app_settings", rows: Number(settingsCount.count) },
	];

	return {
		mysqlVersion,
		databaseName,
		tables,
		totalRows: tables.reduce((sum, t) => sum + t.rows, 0),
	};
};
