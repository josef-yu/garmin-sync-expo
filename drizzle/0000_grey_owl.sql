CREATE TABLE `sync_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text NOT NULL,
	`data_timestamp` integer NOT NULL,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` integer DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sync_table_type_data_timestamp_unique` ON `sync_table` (`type`,`data_timestamp`);