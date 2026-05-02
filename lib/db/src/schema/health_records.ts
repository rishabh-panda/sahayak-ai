import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const healthRecordsTable = pgTable("health_records", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  value: text("value").notNull(),
  unit: text("unit").notNull(),
  notes: text("notes"),
  recordedAt: timestamp("recorded_at", { withTimezone: true }).defaultNow(),
});

export const insertHealthRecordSchema = createInsertSchema(healthRecordsTable).omit({ id: true });
export type InsertHealthRecord = z.infer<typeof insertHealthRecordSchema>;
export type HealthRecord = typeof healthRecordsTable.$inferSelect;
