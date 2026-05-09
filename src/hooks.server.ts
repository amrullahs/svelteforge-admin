import {
	validateSession,
	setSessionCookie,
	deleteSessionCookie,
	SESSION_COOKIE_NAME,
} from "$lib/server/auth.js";
import { db } from "$lib/server/db/index.js";
import { sessions } from "$lib/server/db/schema.js";
import { eq } from "drizzle-orm";
import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get(SESSION_COOKIE_NAME);
	if (!token) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	try {
		const { session, user } = await validateSession(token);

		if (session) {
			// Refresh cookie with current expiresAt (handles auto-extension)
			setSessionCookie(event.cookies, token, session.expiresAt);

			// Update session metadata
			const ua = event.request.headers.get("user-agent");
			const ip = event.getClientAddress();
			await db
				.update(sessions)
				.set({ userAgent: ua, ipAddress: ip })
				.where(eq(sessions.id, session.id));
		} else {
			deleteSessionCookie(event.cookies);
		}

		event.locals.user = user;
		event.locals.session = session;

		// --- Route Guard ---
		if (user && event.url.pathname !== "/") {
			const protectedPaths = ["users", "content", "analytics", "notifications", "settings", "roles", "database"];
			const pathParts = event.url.pathname.split("/").filter(Boolean);
			const resource = pathParts[0];

			if (protectedPaths.includes(resource)) {
				const { hasPermission } = await import("$lib/server/permissions.js");
				const allowed = await hasPermission(user.id, `${resource}:view`);
				
				if (!allowed) {
					const { error } = await import("@sveltejs/kit");
					error(403, {
						message: "Access Denied: You do not have permission to view this page."
					});
				}
			}
		}
		// -------------------

	} catch (e: any) {
		if (e?.status === 403) throw e; // Pass through our 403 error
		// DB error or corrupt session — clear the cookie and continue as unauthenticated
		deleteSessionCookie(event.cookies);
		event.locals.user = null;
		event.locals.session = null;
	}

	return resolve(event);
};
