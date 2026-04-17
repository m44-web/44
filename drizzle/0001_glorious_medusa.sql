CREATE TABLE `shift_activities` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`shift_id` text NOT NULL,
	`user_id` text NOT NULL,
	`activity` text NOT NULL,
	`note` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`shift_id`) REFERENCES `shifts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `shift_activities_shift_id_idx` ON `shift_activities` (`shift_id`);