-- Add missing columns to users table
USE tradelink;

-- Add state column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS state VARCHAR(50);

-- Add currency column to orders table if not exists
ALTER TABLE orders ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'NGN' AFTER total_amount;

-- Verify the table structure
DESCRIBE users; 