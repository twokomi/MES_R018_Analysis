-- Add progress tracking columns to excel_uploads table
ALTER TABLE excel_uploads ADD COLUMN upload_status TEXT DEFAULT 'processing';
ALTER TABLE excel_uploads ADD COLUMN progress_current INTEGER DEFAULT 0;
ALTER TABLE excel_uploads ADD COLUMN progress_total INTEGER DEFAULT 0;
