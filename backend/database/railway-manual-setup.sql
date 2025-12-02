-- ============================================================================
-- RAILWAY DATABASE MANUAL SETUP
-- ============================================================================
-- Run these commands in the Railway database console to fix the migration
-- issue and manually create the discount code tables.
-- ============================================================================

-- STEP 1: Clean up any existing orphaned tables
-- ----------------------------------------------------------------------------
-- These tables may exist from failed migration attempts and need to be removed
-- so we can create them properly.

DROP TABLE IF EXISTS `tbl_discount_code_usage`;
DROP TABLE IF EXISTS `tbl_discount_codes`;


-- STEP 2: Create the discount codes table
-- ----------------------------------------------------------------------------
-- This table stores discount codes that can be applied to orders.

CREATE TABLE `tbl_discount_codes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Discount code (e.g., WELCOME10, SAVE5)',
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Admin note about this code',
  `discount_type` enum('fixed','percentage') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'fixed' COMMENT 'Type of discount',
  `discount_value` decimal(10,2) NOT NULL COMMENT 'Dollar amount or percentage value',
  `max_uses` int DEFAULT NULL COMMENT 'Maximum total uses (NULL = unlimited)',
  `max_uses_per_customer` int NOT NULL DEFAULT '1' COMMENT 'Max uses per customer (default 1)',
  `current_uses` int NOT NULL DEFAULT '0' COMMENT 'Current number of times used',
  `valid_from` timestamp NULL DEFAULT NULL COMMENT 'When code becomes active (NULL = immediately)',
  `valid_until` timestamp NULL DEFAULT NULL COMMENT 'When code expires (NULL = never)',
  `minimum_order_amount` decimal(10,2) DEFAULT NULL COMMENT 'Minimum order total required',
  `maximum_discount_amount` decimal(10,2) DEFAULT NULL COMMENT 'Cap for percentage discounts',
  `is_active` tinyint(1) NOT NULL DEFAULT '1' COMMENT '1 = Active, 0 = Cancelled/Disabled',
  `created_by_admin_id` bigint unsigned DEFAULT NULL COMMENT 'Admin who created this code',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tbl_discount_codes_code_unique` (`code`),
  KEY `idx_active_valid` (`is_active`,`valid_from`,`valid_until`),
  KEY `idx_created_by` (`created_by_admin_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- STEP 3: Create the discount code usage table
-- ----------------------------------------------------------------------------
-- This table tracks when discount codes are used on orders.

CREATE TABLE `tbl_discount_code_usage` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `discount_code_id` bigint unsigned NOT NULL COMMENT 'FK to tbl_discount_codes',
  `order_id` bigint unsigned NOT NULL COMMENT 'FK to tbl_orders',
  `customer_user_id` bigint unsigned NOT NULL COMMENT 'FK to tbl_users',
  `discount_amount` decimal(10,2) NOT NULL COMMENT 'Actual discount applied',
  `order_total_before_discount` decimal(10,2) NOT NULL COMMENT 'Original order total',
  `order_total_after_discount` decimal(10,2) NOT NULL COMMENT 'Final order total',
  `used_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_discount_code` (`discount_code_id`),
  KEY `idx_order` (`order_id`),
  KEY `idx_customer` (`customer_user_id`),
  CONSTRAINT `fk_usage_discount_code` FOREIGN KEY (`discount_code_id`) REFERENCES `tbl_discount_codes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- STEP 4: Add foreign key to tbl_orders (only if table exists)
-- ----------------------------------------------------------------------------
-- If tbl_orders exists in your database, uncomment and run this line.
-- If you haven't imported your database dump yet, skip this step and run it
-- after importing.

-- ALTER TABLE `tbl_discount_code_usage`
--   ADD CONSTRAINT `fk_usage_order`
--   FOREIGN KEY (`order_id`)
--   REFERENCES `tbl_orders` (`id`)
--   ON DELETE CASCADE;


-- STEP 5: Mark migrations as completed in the migrations table
-- ----------------------------------------------------------------------------
-- This tells Laravel that these migrations have already been run, so it won't
-- try to run them again on the next deployment.

INSERT INTO `migrations` (`migration`, `batch`) VALUES
('2025_12_02_100001_create_discount_codes_table', (SELECT COALESCE(MAX(batch), 0) + 1 FROM (SELECT batch FROM migrations) AS temp)),
('2025_12_02_100002_create_discount_code_usage_table', (SELECT COALESCE(MAX(batch), 0) + 1 FROM (SELECT batch FROM migrations) AS temp)),
('2025_12_02_100003_add_foreign_key_to_discount_usage_if_missing', (SELECT COALESCE(MAX(batch), 0) + 1 FROM (SELECT batch FROM migrations) AS temp));


-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these to verify everything was created correctly:

-- Check that tables exist:
-- SHOW TABLES LIKE 'tbl_discount%';

-- Check table structures:
-- DESCRIBE tbl_discount_codes;
-- DESCRIBE tbl_discount_code_usage;

-- Check foreign keys:
-- SELECT
--   TABLE_NAME,
--   CONSTRAINT_NAME,
--   REFERENCED_TABLE_NAME
-- FROM information_schema.KEY_COLUMN_USAGE
-- WHERE TABLE_SCHEMA = DATABASE()
--   AND TABLE_NAME = 'tbl_discount_code_usage'
--   AND REFERENCED_TABLE_NAME IS NOT NULL;

-- Check migrations were recorded:
-- SELECT * FROM migrations WHERE migration LIKE '%discount%';

-- ============================================================================
-- DONE!
-- ============================================================================
