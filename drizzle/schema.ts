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
  context: text("context").notNull(), // Contexto da situacao
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
 * Mapa Astral (pago)
 */
export const astralMaps = mysqlTable("astral_maps", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  birthDate: varchar("birthDate", { length: 10 }).notNull(), // YYYY-MM-DD
  birthTime: varchar("birthTime", { length: 5 }).notNull(), // HH:MM
  birthLocation: varchar("birthLocation", { length: 255 }).notNull(),
  mapData: text("mapData").notNull(), // JSON com dados do mapa
  interpretation: text("interpretation").notNull(),
  packageType: mysqlEnum("packageType", ["basic", "premium"]).default("basic"),
  price: varchar("price", { length: 10 }).notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "completed", "failed"]).default("pending"),
  createdAt: timestamp("createdAt").defaultNow(),
});

/**
 * Oráculos (pago)
 */
export const oracles = mysqlTable("oracles", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  oracleType: varchar("oracleType", { length: 64 }).notNull(), // runas, anjos, buzios
  question: text("question").notNull(),
  numberOfSymbols: int("numberOfSymbols").notNull(),
  symbols: text("symbols").notNull(), // JSON array
  interpretations: text("interpretations").notNull(), // JSON array
  price: varchar("price", { length: 10 }).notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "completed", "failed"]).default("pending"),
  createdAt: timestamp("createdAt").defaultNow(),
});

/**
 * Numerologia (paga)
 */
export const numerologies = mysqlTable("numerologies", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  fullName: varchar("fullName", { length: 255 }).notNull(),
  birthDate: varchar("birthDate", { length: 10 }).notNull(), // YYYY-MM-DD
  destinyNumber: int("destinyNumber").notNull(),
  soulNumber: int("soulNumber").notNull(),
  personalityNumber: int("personalityNumber").notNull(),
  expressionNumber: int("expressionNumber").notNull(),
  personalYear: int("personalYear").notNull(),
  destinyInterpretation: text("destinyInterpretation").notNull(),
  soulInterpretation: text("soulInterpretation").notNull(),
  personalityInterpretation: text("personalityInterpretation").notNull(),
  expressionInterpretation: text("expressionInterpretation").notNull(),
  yearInterpretation: text("yearInterpretation").notNull(),
  price: varchar("price", { length: 10 }).notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "completed", "failed"]).default("pending"),
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

export type AstralMap = typeof astralMaps.$inferSelect;
export type InsertAstralMap = typeof astralMaps.$inferInsert;

export type Oracle = typeof oracles.$inferSelect;
export type InsertOracle = typeof oracles.$inferInsert;

export type EnergyGuidance = typeof energyGuidance.$inferSelect;
export type InsertEnergyGuidance = typeof energyGuidance.$inferInsert;

export type Numerology = typeof numerologies.$inferSelect;
export type InsertNumerology = typeof numerologies.$inferInsert;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;
