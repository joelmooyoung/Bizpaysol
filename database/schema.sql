-- ACH Processing System Database Schema for Supabase
-- This file should be executed in the Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
ALTER ROLE authenticated SET row_security = on;

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'operator',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ACH Transactions table
CREATE TABLE IF NOT EXISTS ach_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Debit Information
    dr_routing_number VARCHAR(9) NOT NULL,
    dr_account_number_encrypted TEXT NOT NULL,
    dr_id VARCHAR(15) NOT NULL,
    dr_name VARCHAR(22) NOT NULL,
    -- Credit Information
    cr_routing_number VARCHAR(9) NOT NULL,
    cr_account_number_encrypted TEXT NOT NULL,
    cr_id VARCHAR(15) NOT NULL,
    cr_name VARCHAR(22) NOT NULL,
    -- Transaction Details
    amount DECIMAL(12,2) NOT NULL,
    effective_date DATE NOT NULL,
    -- Metadata
    sender_ip INET,
    sender_details TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_amount_positive CHECK (amount > 0),
    CONSTRAINT chk_status_valid CHECK (status IN ('pending', 'processed', 'failed', 'cancelled')),
    CONSTRAINT chk_routing_numbers CHECK (
        dr_routing_number ~ '^\d{9}$' AND 
        cr_routing_number ~ '^\d{9}$'
    )
);

-- NACHA Files table
CREATE TABLE IF NOT EXISTS nacha_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    effective_date DATE NOT NULL,
    transaction_count INTEGER NOT NULL DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    transmitted BOOLEAN DEFAULT false,
    transmitted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_transaction_count_positive CHECK (transaction_count >= 0),
    CONSTRAINT chk_total_amount_positive CHECK (total_amount >= 0)
);

-- Federal Holidays table
CREATE TABLE IF NOT EXISTS federal_holidays (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    year INTEGER NOT NULL,
    recurring BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_year_valid CHECK (year >= 2020 AND year <= 2050),
    CONSTRAINT unique_holiday_date UNIQUE (date, name)
);

-- System Configuration table
CREATE TABLE IF NOT EXISTS system_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ach_transactions_effective_date ON ach_transactions(effective_date);
CREATE INDEX IF NOT EXISTS idx_ach_transactions_status ON ach_transactions(status);
CREATE INDEX IF NOT EXISTS idx_ach_transactions_created_at ON ach_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_nacha_files_effective_date ON nacha_files(effective_date);
CREATE INDEX IF NOT EXISTS idx_nacha_files_transmitted ON nacha_files(transmitted);
CREATE INDEX IF NOT EXISTS idx_federal_holidays_date ON federal_holidays(date);
CREATE INDEX IF NOT EXISTS idx_federal_holidays_year ON federal_holidays(year);
CREATE INDEX IF NOT EXISTS idx_system_config_key ON system_config(key);

-- Triggers for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ach_transactions_updated_at 
    BEFORE UPDATE ON ach_transactions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_config_updated_at 
    BEFORE UPDATE ON system_config 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ach_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE nacha_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE federal_holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Admin can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'admin'
        )
    );

-- RLS Policies for ach_transactions table
CREATE POLICY "Authenticated users can view transactions" ON ach_transactions
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Operators can insert transactions" ON ach_transactions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role IN ('admin', 'operator')
            AND active = true
        )
    );

CREATE POLICY "Operators can update transactions" ON ach_transactions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role IN ('admin', 'operator')
            AND active = true
        )
    );

-- RLS Policies for nacha_files table
CREATE POLICY "Authenticated users can view NACHA files" ON nacha_files
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Operators can manage NACHA files" ON nacha_files
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role IN ('admin', 'operator')
            AND active = true
        )
    );

-- RLS Policies for federal_holidays table
CREATE POLICY "Authenticated users can view holidays" ON federal_holidays
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can manage holidays" ON federal_holidays
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'admin'
            AND active = true
        )
    );

-- RLS Policies for system_config table
CREATE POLICY "Admin can manage system config" ON system_config
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'admin'
            AND active = true
        )
    );

-- Insert default system configuration
INSERT INTO system_config (key, value, description) VALUES
    ('sftp_host', '', 'SFTP server hostname'),
    ('sftp_port', '22', 'SFTP server port'),
    ('sftp_username', '', 'SFTP username'),
    ('sftp_password', '', 'SFTP password (encrypted)'),
    ('sftp_private_key_path', '', 'Path to SFTP private key file'),
    ('ach_immediate_destination', '123456789', 'ACH Immediate Destination (receiving bank routing number)'),
    ('ach_immediate_origin', '987654321', 'ACH Immediate Origin (originating bank routing number)'),
    ('ach_company_name', 'Your Company', 'ACH Company Name'),
    ('ach_company_id', '1234567890', 'ACH Company Identification Number'),
    ('ach_company_discretionary_data', '', 'ACH Company Discretionary Data'),
    ('encryption_enabled', 'true', 'Enable encryption for sensitive data'),
    ('max_transaction_amount', '100000.00', 'Maximum transaction amount allowed'),
    ('auto_transmission_enabled', 'false', 'Enable automatic NACHA file transmission'),
    ('notification_email', '', 'Email address for system notifications')
ON CONFLICT (key) DO NOTHING;

-- Create default admin user (password should be changed immediately)
-- Password is 'admin123' hashed with bcrypt
INSERT INTO users (email, password, name, role, active) VALUES 
    ('admin@achprocessing.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3QJL6VJt9u', 'System Administrator', 'admin', true)
ON CONFLICT (email) DO NOTHING;

-- Grant permissions to authenticated role
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;