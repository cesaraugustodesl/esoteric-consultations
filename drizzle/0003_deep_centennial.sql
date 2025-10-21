CREATE TABLE `astral_maps` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`birthDate` varchar(10) NOT NULL,
	`birthTime` varchar(5) NOT NULL,
	`birthLocation` varchar(255) NOT NULL,
	`mapData` text NOT NULL,
	`interpretation` text NOT NULL,
	`packageType` enum('basic','premium') DEFAULT 'basic',
	`price` varchar(10) NOT NULL,
	`paymentStatus` enum('pending','completed','failed') DEFAULT 'pending',
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `astral_maps_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `oracles` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`oracleType` varchar(64) NOT NULL,
	`question` text NOT NULL,
	`numberOfSymbols` int NOT NULL,
	`symbols` text NOT NULL,
	`interpretations` text NOT NULL,
	`price` varchar(10) NOT NULL,
	`paymentStatus` enum('pending','completed','failed') DEFAULT 'pending',
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `oracles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
DROP TABLE `radinic_tables`;