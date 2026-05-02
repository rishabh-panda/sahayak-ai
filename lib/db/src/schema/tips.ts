import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const tipsTable = pgTable("tips", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull().default("health"),
  language: text("language").notNull().default("en"),
  emoji: text("emoji"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const insertTipSchema = createInsertSchema(tipsTable).omit({ id: true, createdAt: true });
export type InsertTip = z.infer<typeof insertTipSchema>;
export type Tip = typeof tipsTable.$inferSelect;
