import { pgTable, text, jsonb, timestamp, boolean } from 'drizzle-orm/pg-core';
import type { PortfolioData } from '../src/types/portfolio.js';

export const portfolios = pgTable('portfolios', {
  id: text().primaryKey(),
  content: jsonb().$type<PortfolioData>().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
export const inquiries = pgTable('inquiries', {
  id: text().primaryKey(),
  name: text().notNull(),
  email: text().notNull(),
  subject: text().notNull(),
  message: text().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  read: boolean().default(false).notNull(),
});
