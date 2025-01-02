import { sql } from 'drizzle-orm'
import {
  sqliteTable,
  int,
  integer,
  text,
  unique,
} from 'drizzle-orm/sqlite-core'

export const syncTable = sqliteTable(
  'sync_table',
  {
    id: int().primaryKey({ autoIncrement: true }),
    type: text({ enum: ['steps'] }).notNull(),
    data_timestamp: integer({ mode: 'timestamp' }).notNull(),
    created_at: integer({ mode: 'timestamp' }).default(
      sql`(CURRENT_TIMESTAMP)`,
    ),
    updated_at: integer({ mode: 'timestamp' }).default(
      sql`(CURRENT_TIMESTAMP)`,
    ),
  },
  t => ({
    data_unique: unique().on(t.type, t.data_timestamp),
  }),
)

export type SyncTableSelectType = typeof syncTable.$inferSelect
