import { mysqlTable, varchar, text, timestamp, boolean, mysqlEnum, uniqueIndex, int, bigint } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
	id: varchar("id", { length: 255 }).primaryKey(),
	email: varchar("email", { length: 255 }).notNull().unique(),
	username: varchar("username", { length: 255 }).notNull().unique(),
	passwordHash: text("password_hash").notNull(),
	name: varchar("name", { length: 255 }).notNull(),
	avatarUrl: text("avatar_url"),
	role: mysqlEnum("role", ["admin", "editor", "viewer"])
		.notNull()
		.default("viewer"),
	createdAt: timestamp("created_at")
		.notNull()
		.$defaultFn(() => new Date()),
	updatedAt: timestamp("updated_at")
		.notNull()
		.$defaultFn(() => new Date()),
});

export const sessions = mysqlTable("sessions", {
	id: varchar("id", { length: 255 }).primaryKey(),
	userId: varchar("user_id", { length: 255 })
		.notNull()
		.references(() => users.id),
	expiresAt: bigint("expires_at", { mode: "number" }).notNull(),
	userAgent: text("user_agent"),
	ipAddress: varchar("ip_address", { length: 45 }),
	createdAt: timestamp("created_at").$defaultFn(() => new Date()),
});

export const pages = mysqlTable("pages", {
	id: varchar("id", { length: 255 }).primaryKey(),
	title: varchar("title", { length: 255 }).notNull(),
	slug: varchar("slug", { length: 255 }).notNull().unique(),
	content: text("content").notNull(),
	template: mysqlEnum("template", ["default", "landing", "blog"])
		.notNull()
		.default("default"),
	status: mysqlEnum("status", ["draft", "published", "archived"])
		.notNull()
		.default("draft"),
	authorId: varchar("author_id", { length: 255 })
		.notNull()
		.references(() => users.id),
	createdAt: timestamp("created_at")
		.notNull()
		.$defaultFn(() => new Date()),
	updatedAt: timestamp("updated_at")
		.notNull()
		.$defaultFn(() => new Date()),
	publishedAt: timestamp("published_at"),
});

export const notifications = mysqlTable("notifications", {
	id: varchar("id", { length: 255 }).primaryKey(),
	userId: varchar("user_id", { length: 255 }).references(() => users.id),
	title: varchar("title", { length: 255 }).notNull(),
	message: text("message").notNull(),
	type: mysqlEnum("type", ["info", "warning", "error", "success"])
		.notNull()
		.default("info"),
	read: boolean("read").notNull().default(false),
	createdAt: timestamp("created_at")
		.notNull()
		.$defaultFn(() => new Date()),
});

export const passwordResetTokens = mysqlTable("password_reset_tokens", {
	id: varchar("id", { length: 255 }).primaryKey(),
	userId: varchar("user_id", { length: 255 })
		.notNull()
		.references(() => users.id),
	tokenHash: text("token_hash").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
});

export const oauthAccounts = mysqlTable(
	"oauth_accounts",
	{
		id: varchar("id", { length: 255 }).primaryKey(),
		userId: varchar("user_id", { length: 255 })
			.notNull()
			.references(() => users.id),
		provider: mysqlEnum("provider", ["google", "github"]).notNull(),
		providerUserId: varchar("provider_user_id", { length: 255 }).notNull(),
		createdAt: timestamp("created_at")
			.notNull()
			.$defaultFn(() => new Date()),
	},
	(table) => [uniqueIndex("oauth_provider_user_idx").on(table.provider, table.providerUserId)]
);

export const appSettings = mysqlTable("app_settings", {
	key: varchar("key", { length: 255 }).primaryKey(),
	value: text("value").notNull(),
	updatedAt: timestamp("updated_at")
		.notNull()
		.$defaultFn(() => new Date()),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type Page = typeof pages.$inferSelect;
export type NewPage = typeof pages.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type OAuthAccount = typeof oauthAccounts.$inferSelect;
export type AppSetting = typeof appSettings.$inferSelect;
