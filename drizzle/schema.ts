import { mysqlEnum, mysqlTable, text, timestamp, varchar, int } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Consultas de Tarot (pagas)
 */
export const tarotConsultations = mysqlTable("tarot_consultations", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  questions: text("questions").notNull(), // JSON array de perguntas
  responses: text("responses").notNull(), // JSON array de respostas
  numberOfQuestions: int("numberOfQuestions").notNull(),
  price: varchar("price", { length: 10 }).notNull(),
  paymentId: varchar("paymentId", { length: 255 }),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "completed", "failed"]).default("pending"),
  status: mysqlEnum("status", ["pending", "completed", "archived"]).default("pending"),
  createdAt: timestamp("createdAt").defaultNow(),
  completedAt: timestamp("completedAt"),
});

/**
 * Interpretações de Sonhos (gratuitas)
 */
export const dreamInterpretations = mysqlTable("dream_interpretations", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  dreamDescription: text("dreamDescription").notNull(),
  interpretation: text("interpretation").notNull(),
  symbols: text("symbols"), // JSON array de símbolos identificados
  createdAt: timestamp("createdAt").defaultNow(),
});

/**
 * Mesas Radiônicas (gratuitas)
 */
export const radinicTables = mysqlTable("radinic_tables", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  question: text("question").notNull(),
  response: text("response").notNull(),
  energyFrequency: varchar("energyFrequency", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow(),
});

/**
 * Orientações Energéticas (gratuitas)
 */
export const energyGuidance = mysqlTable("energy_guidance", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  topic: varchar("topic", { length: 255 }).notNull(),
  guidance: text("guidance").notNull(),
  chakraFocus: varchar("chakraFocus", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow(),
});

/**
 * Histórico de Pagamentos
 */
export const payments = mysqlTable("payments", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  consultationId: varchar("consultationId", { length: 64 }).notNull(),
  amount: varchar("amount", { length: 10 }).notNull(),
  paymentMethod: varchar("paymentMethod", { length: 64 }).notNull(),
  externalPaymentId: varchar("externalPaymentId", { length: 255 }),
  status: mysqlEnum("status", ["pending", "approved", "failed", "refunded"]).default("pending"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").onUpdateNow(),
});

export type TarotConsultation = typeof tarotConsultations.$inferSelect;
export type InsertTarotConsultation = typeof tarotConsultations.$inferInsert;

export type DreamInterpretation = typeof dreamInterpretations.$inferSelect;
export type InsertDreamInterpretation = typeof dreamInterpretations.$inferInsert;

export type RadinicTable = typeof radinicTables.$inferSelect;
export type InsertRadinicTable = typeof radinicTables.$inferInsert;

export type EnergyGuidance = typeof energyGuidance.$inferSelect;
export type InsertEnergyGuidance = typeof energyGuidance.$inferInsert;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;
