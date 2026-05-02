import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const profileTable = pgTable("profile", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().default(""),
  age: integer("age").notNull().default(60),
  city: text("city"),
  language: text("language").notNull().default("en"),
  emergencyPhone: text("emergency_phone"),
  avatar: text("avatar"),
  fontSize: text("font_size").notNull().default("large"),
  theme: text("theme").notNull().default("light"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const insertProfileSchema = createInsertSchema(profileTable).omit({ id: true, createdAt: true });
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profileTable.$inferSelect;
