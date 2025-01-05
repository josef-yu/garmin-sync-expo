PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_sync_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text NOT NULL,
	`data_timestamp` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
INSERT INTO `__new_sync_table`("id", "type", "data_timestamp", "created_at", "updated_at") SELECT "id", "type", "data_timestamp", "created_at", "updated_at" FROM `sync_table`;--> statement-breakpoint
DROP TABLE `sync_table`;--> statement-breakpoint
ALTER TABLE `__new_sync_table` RENAME TO `sync_table`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `sync_table_type_data_timestamp_unique` ON `sync_table` (`type`,`data_timestamp`);