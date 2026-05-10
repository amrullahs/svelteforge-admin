import { generateSessionToken, createSession, setSessionCookie } from "$lib/server/auth.js";
import { getEnabledProviders } from "$lib/server/oauth.js";
import { db } from "$lib/server/db/index.js";
import { users } from "$lib/server/db/schema.js";
import { fail, redirect } from "@sveltejs/kit";
import { verify } from "@node-rs/argon2";
import { eq, or } from "drizzle-orm";
import type { Actions, PageServerLoad } from "./$types.js";

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) redirect(302, "/");
	return {
		enabledProviders: getEnabledProviders(),
	};
};

export const actions: Actions = {
	default: async ({ request, cookies, getClientAddress }) => {
		const formData = await request.formData();
		const username = formData.get("username");
		const password = formData.get("password");

		if (typeof username !== "string" || username.length < 3 || username.length > 31) {
			return fail(400, { message: "Invalid username (3-31 characters required)" });
		}
		if (typeof password !== "string" || password.length < 6 || password.length > 255) {
			return fail(400, { message: "Invalid password (6-255 characters required)" });
		}

		let existingUser;
		try {
			const results = await db
				.select()
				.from(users)
				.where(or(eq(users.username, username.toLowerCase()), eq(users.email, username.toLowerCase())));
			
			existingUser = results[0];
		} catch (e: any) {
			console.error("Database Login Error:", e);
			return fail(500, { message: "Database connection error. Please try again later." });
		}

		if (!existingUser) {
			return fail(400, { message: "Incorrect username or password" });
		}

		const validPassword = await verify(existingUser.passwordHash, password, {
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1,
		});

		if (!validPassword) {
			return fail(400, { message: "Incorrect username or password" });
		}

		const token = generateSessionToken();
		const ua = request.headers.get("user-agent");
		const ip = getClientAddress();
		const session = await createSession(token, existingUser.id, {
			userAgent: ua,
			ipAddress: ip,
		});
		setSessionCookie(cookies, token, session.expiresAt);

		redirect(302, "/");
	},
};
