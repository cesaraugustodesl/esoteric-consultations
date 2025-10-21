CREATE TABLE `dream_interpretations` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`dreamDescription` text NOT NULL,
	`interpretation` text NOT NULL,
	`symbols` text,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `dream_interpretations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `energy_guidance` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`topic` varchar(255) NOT NULL,
	`guidance` text NOT NULL,
	`chakraFocus` varchar(255),
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `energy_guidance_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`consultationId` varchar(64) NOT NULL,
	`amount` varchar(10) NOT NULL,
	`paymentMethod` varchar(64) NOT NULL,
	`externalPaymentId` varchar(255),
	`status` enum('pending','approved','failed','refunded') DEFAULT 'pending',
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `radinic_tables` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`question` text NOT NULL,
	`response` text NOT NULL,
	`energyFrequency` varchar(255),
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `radinic_tables_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tarot_consultations` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`questions` text NOT NULL,
	`responses` text NOT NULL,
	`numberOfQuestions` int NOT NULL,
	`price` varchar(10) NOT NULL,
	`paymentId` varchar(255),
	`paymentStatus` enum('pending','completed','failed') DEFAULT 'pending',
	`status` enum('pending','completed','archived') DEFAULT 'pending',
	`createdAt` timestamp DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `tarot_consultations_id` PRIMARY KEY(`id`)
);
