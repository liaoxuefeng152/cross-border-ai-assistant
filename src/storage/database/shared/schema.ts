import { pgTable, unique, uuid, text, timestamp, serial, integer, jsonb } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	email: text().notNull(),
	phone: text(),
	password: text().notNull(),
	name: text(),
	avatar: text(),
	role: text().default('user').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("users_email_key").on(table.email),
]);

export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const favorites = pgTable("favorites", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	productName: text("product_name").notNull(),
	category: text().notNull(),
	market: text().notNull(),
	trendScore: integer("trend_score"),
	competition: text(),
	profitMargin: text("profit_margin"),
	sourcePrice: text("source_price"),
	suggestedPrice: text("suggested_price"),
	monthlySales: text("monthly_sales"),
	sourceUrl: text("source_url"),
	sourceKeyword: text("source_keyword"),
	aiAnalysis: text("ai_analysis"),
	actionAdvice: text("action_advice"),
	supplierInfo: jsonb("supplier_info"),
	logisticsAdvice: text("logistics_advice"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const products = pgTable("products", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	name: text().notNull(),
	category: text().notNull(),
	market: text().notNull(),
	sourceUrl: text("source_url"),
	sourcePrice: text("source_price"),
	suggestedPrice: text("suggested_price"),
	status: text().default('draft').notNull(),
	platform: text(),
	platformProductId: text("platform_product_id"),
	data: jsonb(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const listings = pgTable("listings", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	productId: uuid("product_id"),
	sourceUrl: text("source_url"),
	platform: text().notNull(),
	shopId: uuid("shop_id"),
	status: text().default('pending').notNull(),
	result: jsonb(),
	error: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const assets = pgTable("assets", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	name: text().notNull(),
	type: text().notNull(),
	url: text().notNull(),
	thumbnail: text(),
	size: integer(),
	productId: uuid("product_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const shops = pgTable("shops", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	platform: text().notNull(),
	shopName: text("shop_name").notNull(),
	shopId: text("shop_id"),
	status: text().default('pending').notNull(),
	token: text(),
	data: jsonb(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const subscriptions = pgTable("subscriptions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	plan: text().notNull(),
	status: text().default('active').notNull(),
	startDate: timestamp("start_date", { mode: 'string' }).notNull(),
	endDate: timestamp("end_date", { mode: 'string' }),
	amount: integer(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("subscriptions_user_id_key").on(table.userId),
]);

export const bills = pgTable("bills", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	subscriptionId: uuid("subscription_id"),
	amount: integer().notNull(),
	status: text().default('pending').notNull(),
	description: text(),
	paidAt: timestamp("paid_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const chatSessions = pgTable("chat_sessions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	title: text(),
	mode: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const chatMessages = pgTable("chat_messages", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	sessionId: uuid("session_id").notNull(),
	role: text().notNull(),
	content: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});
