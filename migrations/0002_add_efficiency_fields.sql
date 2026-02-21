-- Add Worker S/T and Worker Rate(%) columns for efficiency calculation
ALTER TABLE raw_data ADD COLUMN worker_st REAL DEFAULT 0;
ALTER TABLE raw_data ADD COLUMN worker_rate_pct REAL DEFAULT 0;

-- Create index for efficiency calculations
CREATE INDEX IF NOT EXISTS idx_raw_data_efficiency ON raw_data(worker_st, worker_rate_pct);
