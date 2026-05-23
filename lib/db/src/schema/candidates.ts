import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const candidatesTable = pgTable("candidates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  stage: text("stage").notNull().default("applied"),
  score: integer("score"),
  notes: text("notes"),
  appliedAt: timestamp("applied_at").defaultNow().notNull(),
});

export const insertCandidateSchema = createInsertSchema(candidatesTable).omit({ id: true, appliedAt: true });
export type InsertCandidate = z.infer<typeof insertCandidateSchema>;
export type Candidate = typeof candidatesTable.$inferSelect;
