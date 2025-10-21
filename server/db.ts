import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  tarotConsultations,
  dreamInterpretations,
  radinicTables,
  energyGuidance,
  payments,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.id) {
    throw new Error("User ID is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      id: user.id,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role === undefined) {
      if (user.id === ENV.ownerId) {
        user.role = 'admin';
        values.role = 'admin';
        updateSet.role = 'admin';
      }
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUser(id: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Tarot Consultations
 */
export async function createTarotConsultation(
  userId: string,
  context: string,
  questions: string[],
  numberOfQuestions: number,
  price: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const id = crypto.randomUUID();
  await db.insert(tarotConsultations).values({
    id,
    userId,
    context,
    questions: JSON.stringify(questions),
    responses: JSON.stringify([]),
    numberOfQuestions,
    price,
    paymentStatus: "pending",
    status: "pending",
  });

  return id;
}

export async function getTarotConsultation(id: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(tarotConsultations)
    .where(eq(tarotConsultations.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateTarotConsultation(
  id: string,
  updates: {
    responses?: string[];
    paymentStatus?: "pending" | "completed" | "failed";
    status?: "pending" | "completed" | "archived";
    paymentId?: string;
    completedAt?: Date;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateData: any = {};
  if (updates.responses) updateData.responses = JSON.stringify(updates.responses);
  if (updates.paymentStatus) updateData.paymentStatus = updates.paymentStatus;
  if (updates.status) updateData.status = updates.status;
  if (updates.paymentId) updateData.paymentId = updates.paymentId;
  if (updates.completedAt) updateData.completedAt = updates.completedAt;

  await db
    .update(tarotConsultations)
    .set(updateData)
    .where(eq(tarotConsultations.id, id));
}

export async function getUserTarotConsultations(userId: string) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(tarotConsultations)
    .where(eq(tarotConsultations.userId, userId))
    .orderBy(desc(tarotConsultations.createdAt));
}

/**
 * Dream Interpretations
 */
export async function createDreamInterpretation(
  userId: string,
  dreamDescription: string,
  interpretation: string,
  symbols: string[]
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const id = crypto.randomUUID();
  await db.insert(dreamInterpretations).values({
    id,
    userId,
    dreamDescription,
    interpretation,
    symbols: JSON.stringify(symbols),
  });

  return id;
}

export async function getUserDreamInterpretations(userId: string) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(dreamInterpretations)
    .where(eq(dreamInterpretations.userId, userId))
    .orderBy(desc(dreamInterpretations.createdAt));
}

/**
 * Radinic Tables
 */
export async function createRadinicTable(
  userId: string,
  question: string,
  response: string,
  energyFrequency?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const id = crypto.randomUUID();
  await db.insert(radinicTables).values({
    id,
    userId,
    question,
    response,
    energyFrequency,
  });

  return id;
}

export async function getUserRadinicTables(userId: string) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(radinicTables)
    .where(eq(radinicTables.userId, userId))
    .orderBy(desc(radinicTables.createdAt));
}

/**
 * Energy Guidance
 */
export async function createEnergyGuidance(
  userId: string,
  topic: string,
  guidance: string,
  chakraFocus?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const id = crypto.randomUUID();
  await db.insert(energyGuidance).values({
    id,
    userId,
    topic,
    guidance,
    chakraFocus,
  });

  return id;
}

export async function getUserEnergyGuidance(userId: string) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(energyGuidance)
    .where(eq(energyGuidance.userId, userId))
    .orderBy(desc(energyGuidance.createdAt));
}

/**
 * Payments
 */
export async function createPayment(
  userId: string,
  consultationId: string,
  amount: string,
  paymentMethod: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const id = crypto.randomUUID();
  await db.insert(payments).values({
    id,
    userId,
    consultationId,
    amount,
    paymentMethod,
    status: "pending",
  });

  return id;
}

export async function updatePayment(
  id: string,
  updates: {
    status?: "pending" | "approved" | "failed" | "refunded";
    externalPaymentId?: string;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateData: any = {};
  if (updates.status) updateData.status = updates.status;
  if (updates.externalPaymentId) updateData.externalPaymentId = updates.externalPaymentId;

  await db.update(payments).set(updateData).where(eq(payments.id, id));
}

export async function getPayment(id: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(payments)
    .where(eq(payments.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}
