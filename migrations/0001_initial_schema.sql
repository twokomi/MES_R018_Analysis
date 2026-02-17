-- Excel 업로드 기록 테이블
CREATE TABLE IF NOT EXISTS excel_uploads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT NOT NULL,
  upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  file_size INTEGER,
  total_records INTEGER,
  unique_workers INTEGER,
  date_range_start TEXT,
  date_range_end TEXT
);

-- Raw 데이터 테이블
CREATE TABLE IF NOT EXISTS raw_data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  upload_id INTEGER NOT NULL,
  worker_name TEXT NOT NULL,
  fo_desc TEXT,
  fd_desc TEXT,
  start_datetime TEXT,
  end_datetime TEXT,
  worker_act INTEGER,
  result_cnt TEXT,
  working_day TEXT,
  working_shift TEXT,
  actual_shift TEXT,
  work_rate REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (upload_id) REFERENCES excel_uploads(id)
);

-- 공정 매핑 테이블
CREATE TABLE IF NOT EXISTS process_mapping (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  upload_id INTEGER,
  fd_desc TEXT,
  fo_desc TEXT,
  fo_desc_2 TEXT,
  fo_desc_3 TEXT,
  seq INTEGER,
  FOREIGN KEY (upload_id) REFERENCES excel_uploads(id)
);

-- Shift Calendar 테이블
CREATE TABLE IF NOT EXISTS shift_calendar (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  upload_id INTEGER,
  date TEXT NOT NULL,
  day_shift TEXT,
  night_shift TEXT,
  FOREIGN KEY (upload_id) REFERENCES excel_uploads(id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_raw_data_upload_id ON raw_data(upload_id);
CREATE INDEX IF NOT EXISTS idx_raw_data_worker_name ON raw_data(worker_name);
CREATE INDEX IF NOT EXISTS idx_raw_data_working_day ON raw_data(working_day);
CREATE INDEX IF NOT EXISTS idx_process_mapping_upload_id ON process_mapping(upload_id);
CREATE INDEX IF NOT EXISTS idx_shift_calendar_upload_id ON shift_calendar(upload_id);
CREATE INDEX IF NOT EXISTS idx_shift_calendar_date ON shift_calendar(date);
