# MES R018 Analysis - Individual Performance Report & Dashboard 📊

**CS WIND 현장 생산성 분석 및 리포트 웹 애플리케이션**

## 🌐 배포 URL

### 프로덕션
- **메인 URL**: https://mes-r018-analysis.pages.dev
- **GitHub**: https://github.com/twokomi/MES_R018_Analysis
- **최신 버전**: v4.3.2 (2026-03-02)
- **최근 수정**: Performance Bands W/O Count 표시 수정

---

## 📋 목차

1. [프로젝트 개요](#-프로젝트-개요)
2. [핵심 기능](#-핵심-기능)
3. [KPI 정의 및 계산식](#-kpi-정의-및-계산식)
4. [데이터 구조](#️-데이터-구조)
5. [Process Mapping 시스템](#-process-mapping-시스템)
6. [API 엔드포인트](#-api-엔드포인트)
7. [기술 스택](#️-기술-스택)
8. [로컬 개발 가이드](#-로컬-개발-가이드)
9. [배포 가이드](#-배포-가이드)
10. [사용 가이드](#-사용-가이드)
11. [알려진 이슈](#-알려진-이슈)
12. [개발 히스토리](#-개발-히스토리)

---

## 🎯 프로젝트 개요

MES Individual Performance Report는 제조 실행 시스템(MES)의 작업자별 생산 데이터를 분석하고, 직관적인 대시보드로 성과를 시각화하는 웹 애플리케이션입니다.

### 핵심 목표
- **작업자 개인별 생산성 추적**: 시간 활용도 및 작업 효율 측정
- **공정별 성과 분석**: FO Desc 3단계 계층 구조로 공정 분류
- **시프트별 비교**: Day/Night 시프트 간 성과 비교
- **데이터 기반 의사결정**: 통계적 이상치 감지 및 성과 밴드 분류

---

## ✨ 핵심 기능

### 🔥 **NEW! Dashboard 페이지 (v4.0.0+)**
- ✅ **AI Insights & Warnings**: 6가지 자동 경고 (저효율, 저가동, 격차, 공정 편중, 샘플 부족)
- ✅ **KPI Trend Overview**: Daily/Weekly 토글, 프로세스별 드릴다운 모달
- ✅ **Process Performance Ranking**: Top 5 / Bottom 5 프로세스 비교
- ✅ **Shift Performance Comparison (v4.3.0)**: BT/WT/IM 그룹별 Shift A/B/C/D 성과 비교 테이블
  - 펼치기/접기 기능, 기간 선택 (7d/14d/30d/전체), 천단위 구분자 표시
  - 컬럼: Workers, Shift Time, Work Time, Utilization (%), Standard Time, Efficiency (%)
- ✅ **Distribution & Outliers**: 가동률/효율 분포 히스토그램 (범위 클릭 시 작업자 목록 모달)

### 1. 데이터 업로드 & 저장
- ✅ **Excel 파일 자동 파싱**: Raw 시트에서 작업 데이터 추출
- ✅ **Cloudflare D1 저장**: 영구 데이터베이스 저장 및 불러오기
- ✅ **자동 Process Mapping**: 93개 하드코딩 매핑 규칙 자동 적용
- ✅ **업로드 진행률**: "Data uploaded successfully! Processing in background..." 메시지 표시
- ✅ **중복 제거 & 검증**: 시간 겹침 제거 (13,000+ 분 제거 케이스 처리)

### 2. 두 가지 성과 지표 시스템
#### ⏱️ Time Utilization Rate (시간 활용도)
- **정의**: 실제 작업 시간이 총 시프트 시간 중 몇 %인지 측정
- **목적**: 작업자가 할당된 시간을 얼마나 활용했는지 평가
- **계산식**: `(Total Work Time ÷ Total Shift Time) × 100`

#### ⚡ Work Efficiency Rate (작업 효율)
- **정의**: 표준 시간(S/T) 대비 실제 소요 시간 비율
- **목적**: 작업 속도 및 숙련도 평가
- **계산식**: `(Total Adjusted S/T ÷ Total Actual Time) × 100`
- **Outlier Filter**: 1000% 이상 비정상 데이터 제외 (기본값)

### 3. 고급 필터링 시스템
- 📅 **날짜 필터**: 일별(Day)/주별(Week) 선택
- 🌓 **시프트 필터**: Day/Night/All
- 🏭 **공정 필터**: FO Desc (L1) → FO Desc 2 (L2) → FO Desc 3 (L3) 계층 구조
- 👤 **작업자 필터**: 다중 선택 가능
- 🔄 **실시간 토글**: Utilization ⇄ Efficiency 전환

### 4. 시각화 & 리포트
- 📊 **4개 KPI 카드**: 총 작업자 수, 총 시프트 시간, 총 작업/S/T 시간, 평균 Rate
- 🍩 **Performance Band Donut Chart**: 5단계 밴드 분포
  - Excellent (≥80%), Normal (50-80%), Poor (30-50%), Critical (<30%)
- 📈 **Process Performance Bar Chart**: 공정별 성과 비교 (상위 30개)
- 📋 **Pivot Report**: 날짜별 × 공정별 크로스탭 테이블
- 📄 **Worker Detail Modal**: 작업자별 시간 분포, 이력, 통계

### 5. Process Mapping 탭
- 📝 **매핑 규칙 관리**: FD Desc → FO Desc 2/3 + Seq 관리
- 🔍 **정렬 기능**: 컬럼별 오름차순/내림차순
- 📊 **93개 하드코딩 규칙**: Upload 24 기준 자동 적용

---

## 📊 KPI 정의 및 계산식

### 1. Time Utilization Mode

**KPI Cards:**
```
┌─────────────┬──────────────────┬──────────────────┬────────────────────┐
│ Total       │ Total Shift Time │ Total Work Time  │ Avg Utilization    │
│ Workers     │ (Workers×660min) │ (Actual Work)    │ Rate               │
└─────────────┴──────────────────┴──────────────────┴────────────────────┘
```

**계산식:**
- **Total Shift Time** = `Σ (각 작업자별 660분 × 근무 일수)`
- **Total Work Time** = `Σ (Job On → Job Off 실제 작업 시간, 겹침 제거)`
- **Average Utilization Rate** = `(Total Work Time ÷ Total Shift Time) × 100`

**성과 밴드:**
- **Excellent**: ≥80%
- **Normal**: 50% ~ <80%
- **Poor**: 30% ~ <50%
- **At-Risk**: <30%

---

### 2. Work Efficiency Mode

**KPI Cards:**
```
┌─────────────┬──────────────────┬──────────────────┬────────────────────┐
│ Total       │ Total Adjusted   │ Total Actual     │ Avg Efficiency     │
│ Workers     │ S/T (Assigned)   │ Time             │ Rate               │
└─────────────┴──────────────────┴──────────────────┴────────────────────┘
                    [Outlier Threshold: 1000% ▼ Apply]
```

**계산식:**
- **Total Adjusted S/T** = `Σ (Worker S/T × Result Cnt, Outlier 제외)`
- **Total Actual Time** = `Σ (Worker Act 실제 소요 시간)`
- **Average Efficiency Rate** = `(Total Adjusted S/T ÷ Total Actual Time) × 100`

**Outlier Threshold:**
- **기본값**: 1000% (드롭다운에서 조정 가능)
- **목적**: 비정상적으로 높은 효율(데이터 오류 가능성) 제외
- **적용**: Efficiency 모드에서만 표시

**성과 밴드:**
- **Excellent**: ≥80%
- **Normal**: 50% ~ <80%
- **Poor**: 30% ~ <50%
- **At-Risk**: <30%

---

## 🗄️ 데이터 구조

### Cloudflare D1 Database Schema

#### `excel_uploads` - 업로드 기록
```sql
CREATE TABLE excel_uploads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT NOT NULL,
  upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  file_size INTEGER,
  total_records INTEGER,
  unique_workers INTEGER,
  date_range_start TEXT,
  date_range_end TEXT,
  upload_status TEXT DEFAULT 'processing',  -- 'processing', 'completed', 'error'
  progress_current INTEGER DEFAULT 0,
  progress_total INTEGER DEFAULT 0,
  error_message TEXT
);
```

#### `raw_data` - 작업 원본 데이터
```sql
CREATE TABLE raw_data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  upload_id INTEGER NOT NULL,
  worker_name TEXT NOT NULL,
  fo_desc TEXT,           -- FO Desc (L1)
  fd_desc TEXT,           -- FD Desc
  start_datetime TEXT,
  end_datetime TEXT,
  worker_act INTEGER,     -- 실제 작업 시간 (분)
  result_cnt INTEGER,     -- 작업 결과 수량
  valid_flag INTEGER DEFAULT 1,
  working_day TEXT,
  working_shift TEXT,     -- 'Day' or 'Night'
  actual_shift TEXT,
  work_rate REAL,
  worker_st INTEGER,      -- Worker Standard Time
  worker_rate_pct REAL,   -- Worker Rate (%)
  FOREIGN KEY (upload_id) REFERENCES excel_uploads(id)
);
```

#### `process_mapping` - 공정 매핑 규칙
```sql
CREATE TABLE process_mapping (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  upload_id INTEGER NOT NULL,
  fd_desc TEXT NOT NULL,     -- FD Desc (원본)
  fo_desc TEXT NOT NULL,     -- FO Desc (L1)
  fo_desc_2 TEXT,            -- FO Desc 2 (L2, Category)
  fo_desc_3 TEXT,            -- FO Desc 3 (L3, Sub-process)
  seq INTEGER,               -- 순서
  FOREIGN KEY (upload_id) REFERENCES excel_uploads(id)
);
```

#### `shift_calendar` - 시프트 캘린더
```sql
CREATE TABLE shift_calendar (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  upload_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  day_shift TEXT,
  night_shift TEXT,
  FOREIGN KEY (upload_id) REFERENCES excel_uploads(id)
);
```

---

## 🔄 Process Mapping 시스템

### 개요
**FO Desc (공정명)**을 3단계 계층으로 분류:
1. **FO Desc (L1)**: 원본 공정명 (예: `Bevel`, `Cut`, `Blasting`)
2. **FO Desc 2 (L2)**: 카테고리 (예: `BT Process`, `WT`, `IM QC`)
3. **FO Desc 3 (L3)**: 세부 공정 (예: `Bevel`, `FU`, `CS`)

### 하드코딩된 매핑 규칙 (93개)
**Upload 24 기준 자동 생성**

**카테고리 분포:**
- **BT Process**: 43개 (Cut, Bevel, Bend, FU-*, CSO-*, CSI-*)
- **BT Complete**: 12개 (Fitup Bracket, Flange Paint, VT/MT Repair, etc.)
- **WT**: 12개 (Blasting, Metallizing, Wash, Paint1/2, etc.)
- **IM QC**: 11개 (Final IM Inspection, QC VT1, QC UT, etc.)
- **DS**: 5개 (DS-CUT, DS-BEV, DS-BEN, DS-LS, DS-FU)
- **IM**: 4개 (IM Pre-assembly Mounting, Ring on/off, Ovality Repair)
- **WT QC**: 4개 (Final WT Inspection, Paint1 Inspection, etc.)
- **BT QC**: 2개 (Final BT Inspection, Blasting Inspection)

### 자동 매핑 로직
1. **Excel 파일에 Mapping 시트 있음** → DB에 저장 & 사용
2. **Excel 파일에 Mapping 시트 없음** → `DEFAULT_PROCESS_MAPPING` 하드코딩 규칙 자동 적용

**코드 위치:** `public/js/app.js` (Line 20-112)

---

### Dashboard 그룹 분류 기준 (v4.3.0+)

**Shift Performance Comparison 테이블**에서 사용하는 3대 그룹 분류:

#### 🔵 **BT 그룹** (Body Tower - 본체 제작)
- **포함 카테고리**: BT Process, BT Complete, BT QC
- **지원 Shift**: A, B, C, D
- **주요 공정**: Cut, Bevel, Bend, FU (Fitup), CSO/CSI (Corner Seam), Blasting Inspection, Final BT Inspection

#### 🟢 **WT 그룹** (Wind Tower - 표면 처리)
- **포함 카테고리**: WT, WT QC
- **지원 Shift**: A, B, C, D
- **주요 공정**: Blasting, Metallizing, Wash, Paint1/2, Final WT Inspection

#### 🟣 **IM 그룹** (Inner Material - 내부 자재)
- **포함 카테고리**: IM, IM QC
- **지원 Shift**: A, B, C
- **주요 공정**: IM Pre-assembly Mounting, Ring on/off, Ovality Repair, Final IM Inspection

**참고:**
- DS (Door & Stairs) 카테고리는 현재 그룹에 포함되지 않음
- 각 그룹은 `foDesc2` 필드 기준으로 필터링됨
- 코드 위치: `public/js/app.js` (refreshShiftComparison 함수)

---

## 🚀 API 엔드포인트

### POST `/api/upload`
Excel 데이터를 데이터베이스에 저장

**Request Body:**
```json
{
  "filename": "R018Worker_2026-02-27.xlsx",
  "fileSize": 6343038,
  "rawData": [...],
  "processedData": [...],
  "processMapping": [...],
  "shiftCalendar": [...]
}
```

**Response:**
```json
{
  "success": true,
  "uploadId": 47,
  "status": "completed",
  "message": "Data uploaded successfully"
}
```

---

### GET `/api/uploads`
최근 업로드 목록 조회 (최대 50개)

**Response:**
```json
{
  "success": true,
  "uploads": [
    {
      "id": 47,
      "filename": "R018Worker_2026-02-27T20-22-24-262_by_1001435.xlsx",
      "upload_date": "2026-02-28 01:49:50",
      "file_size": 6343038,
      "total_records": 32200,
      "unique_workers": 538,
      "date_range_start": "2026-02-09",
      "date_range_end": "2026-02-27"
    }
  ]
}
```

---

### GET `/api/uploads/:id`
특정 업로드 데이터 조회

**Response:**
```json
{
  "success": true,
  "upload": {...},
  "processMapping": [...],
  "shiftCalendar": [...]
}
```

---

### GET `/api/uploads/:id/raw-data`
특정 업로드의 raw_data 페이지네이션 조회

**Query Parameters:**
- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지당 개수 (기본값: 1000)

---

### GET `/api/uploads/:id/process-mapping`
특정 업로드의 Process Mapping 조회

---

### GET `/api/process-mapping`
최신 업로드의 Process Mapping 조회

---

### POST `/api/process-mapping`
Process Mapping 추가/수정

**Request Body:**
```json
{
  "uploadId": 47,
  "fd_desc": "Bevel",
  "fo_desc": "Bevel",
  "fo_desc_2": "BT Process",
  "fo_desc_3": "Bevel",
  "seq": 3
}
```

---

### DELETE `/api/process-mapping/:id`
Process Mapping 삭제

---

### DELETE `/api/uploads/:id`
업로드 데이터 삭제 (관련 raw_data, process_mapping, shift_calendar 모두 삭제)

---

## 🛠️ 기술 스택

| 구분 | 기술 |
|------|------|
| **Frontend** | HTML5, CSS3, JavaScript (ES6+) |
| **Backend** | Hono Framework v4.0 (TypeScript) |
| **Database** | Cloudflare D1 (SQLite) |
| **Deployment** | Cloudflare Pages |
| **UI Framework** | Tailwind CSS 3.4 (CDN) |
| **Charts** | Chart.js |
| **Excel Parsing** | SheetJS (xlsx.js) v0.18.5 |
| **Icons** | Font Awesome 6.4.0 |

---

## 💻 로컬 개발 가이드

### 1. 저장소 클론
```bash
git clone https://github.com/twokomi/MES_R018_Analysis.git
cd MES_R018_Analysis
```

### 2. 의존성 설치
```bash
npm install
```

### 3. D1 데이터베이스 설정
```bash
# 로컬 D1 데이터베이스 마이그레이션
npm run db:migrate:local

# (Optional) 테스트 데이터 시딩
npm run db:seed
```

### 4. 개발 서버 시작
```bash
# 빌드
npm run build

# PM2로 Wrangler Pages Dev 서버 시작
npm run dev:sandbox
# 또는
pm2 start ecosystem.config.cjs
```

### 5. 서비스 확인
```bash
# 서비스 상태 확인
pm2 list

# 로그 확인 (non-blocking)
pm2 logs webapp --nostream

# 서비스 재시작
fuser -k 3000/tcp 2>/dev/null || true
pm2 restart webapp

# 서비스 중지
pm2 delete webapp
```

### 6. 테스트
```bash
curl http://localhost:3000
```

---

## 📦 배포 가이드

### 1. Cloudflare API 키 설정
```bash
# setup_cloudflare_api_key 도구 호출 (AI Assistant가 제공)
# 실패 시: Genspark Deploy 탭에서 API 키 설정
```

### 2. 프로덕션 D1 마이그레이션 (최초 배포 시)
```bash
npm run db:migrate:prod
```

### 3. 프로젝트 빌드
```bash
npm run build
```

### 4. Cloudflare Pages 배포
```bash
# 프로덕션 배포
npm run deploy

# 또는 직접 wrangler 사용
npx wrangler pages deploy dist --project-name mes-r018-analysis
```

### 5. 배포 확인
- **Production URL**: https://mes-r018-analysis.pages.dev
- **Latest Preview**: https://[commit-hash].mes-r018-analysis.pages.dev

---

## 📖 사용 가이드

### 🔥 **NEW! Dashboard 탭 사용법**
1. **Dashboard** 탭 클릭
2. **AI Insights & Warnings** 섹션에서 자동 경고 확인
3. **KPI Trend Overview**: Daily/Weekly 버튼으로 뷰 전환
   - 차트 클릭 → 프로세스 상세 모달 표시
4. **Process Ranking**: Top 5 / Bottom 5 프로세스 카드 클릭 → 프로세스 상세 모달
5. **Shift Comparison**: Day/Night 바 클릭 → 시프트 상세 모달
6. **Distribution**: 히스토그램 막대 클릭 → 해당 범위 작업자 리스트 모달

### 1️⃣ 엑셀 파일 업로드
1. **Data Upload** 탭 클릭
2. Excel 파일 드래그 앤 드롭 또는 선택
3. 자동으로 데이터 처리 및 리포트 표시
4. **"Save to Database"** 버튼 클릭
5. 업로드 완료 메시지 확인: **"Data uploaded successfully! Processing in background..."**

### 2️⃣ 저장된 데이터 불러오기
1. **Saved Uploads** 섹션에서 파일 카드 클릭
2. 자동으로 Report 탭 이동 및 데이터 로드

### 3️⃣ 두 가지 지표 전환
- **⏱️ Time Utilization**: 시간 활용도 (파란색 테마)
- **⚡ Work Efficiency**: 작업 효율 (보라색 테마)
- 우측 상단 **"Switch to Efficiency"** / **"Switch to Utilization"** 버튼 클릭

### 4️⃣ 필터 적용
1. Shift, 날짜, 공정, 작업자 선택
2. **"Apply Filters"** 버튼 클릭
3. **"Reset"** 버튼으로 필터 초기화

### 5️⃣ 작업자 상세 보기
1. Performance Band 차트 또는 테이블에서 작업자 이름 클릭
2. 작업자 상세 모달 표시:
   - **Shift Distribution Chart** (Time Utilization)
   - **Process Distribution Chart** (Work Efficiency)
   - **Work Records Table**: 전체 작업 이력 (정렬 가능)

### 6️⃣ Process Mapping 관리
1. **Process Mapping** 탭 클릭
2. 매핑 규칙 확인/편집
3. 컬럼 헤더 클릭으로 정렬

---

## ⚠️ 알려진 이슈

### 1. Safari Tracking Prevention
- **증상**: "Tracking Prevention blocked access to storage" 경고 (무해)
- **원인**: Safari의 Cross-Site Tracking Prevention
- **해결**: 무시 가능 (기능에 영향 없음)

### 2. Cloudflare Workers Memory Limit
- **증상**: 대용량 파일 업로드 시 메모리 초과
- **해결**: 배치 처리 (50개씩) + `waitUntil` 백그라운드 처리

### 3. Process Mapping 누락
- **증상**: Upload 47번처럼 Mapping 시트가 없으면 필터 안됨
- **해결**: v3.6.0에서 자동 하드코딩 매핑 추가
- **상태**: ✅ 해결됨

---

## 📝 개발 히스토리

### v4.3.2 (2026-03-02) 🐛 **Performance Bands W/O Count 표시 수정**
- ✅ **validCount 기반 W/O Count 표시**
  - Excel 파일에 W/O 컬럼이 없을 때 `validCount` (레코드 수)를 W/O Count로 사용
  - Worker Performance Report by Date와 동일한 로직 적용
  - 이제 두 곳의 W/O Count가 일치함
- ✅ **W/O 컬럼 인식 개선**
  - `HEADER_SYNONYMS`에 W/O 관련 동의어 추가
  - 지원 컬럼명: `wo`, `w/o`, `wo#`, `wonumber`, `workorder`, `work_order`, `workordernumber`, `work_order_number`, `orderno`, `order_no`
- ✅ **디버그 로깅 강화**
  - `aggregateByWorkerOnly()` 함수에서 `validCount`, `woNumbers.size`, `final woCount` 출력
  - WO# Set 추적 로그 추가

### v4.3.1 (2026-03-02) 🔧 **Performance Bands에 W/O Count 추가 시도**
- ⚠️ **초기 구현 (작동 안 함)**
  - Performance Band 카드에 "⚙️ Process | 📄 X W/Os" 형식으로 W/O Count 표시 시도
  - Excel 파일에 W/O 컬럼이 없어 항상 0으로 표시되는 문제 발견
  - v4.3.2에서 근본 해결

### v4.3.0 (2026-03-02) 🎯 **Shift Performance Comparison 테이블 추가**
- ✅ **Process Health Matrix → Shift Performance Comparison 교체**
  - Bubble Chart 제거, 테이블 형태로 변경
  - BT (BT Process, BT Complete, BT QC) / WT (WT, WT QC) / IM (IM, IM QC) 3개 그룹 분류
  - Shift A, B, C, D 비교 (그룹별 다른 Shift 지원)
  - 펼치기/접기 기능 (Chevron 아이콘)
- ✅ **기간 선택 기능**
  - 버튼 4개: 최근 7일, 14일, 30일 (기본값), 전체 데이터
  - 실시간 날짜 범위 표시 (예: 2026-02-01 ~ 2026-03-02)
- ✅ **테이블 컬럼**
  - Shift, Workers (명), Shift Time (시간), Work Time (시간), Utilization (%), Standard Time (시간), Efficiency (%)
  - 천단위 구분자(콤마) 표시, 소수점 1자리
- ✅ **색상 코드**
  - Utilization ≥50%: 파란색 bold, <50%: 주황색
  - Efficiency ≥50%: 보라색 bold, <50%: 주황색
- ✅ **디자인**
  - BT: 파란색 그라데이션 헤더
  - WT: 녹색 그라데이션 헤더
  - IM: 보라색 그라데이션 헤더
  - 호버 효과, 반응형 레이아웃

### v4.2.0 (2026-03-02) 🐛 **Dashboard AI Insights 0% 버그 수정**
- ✅ **필드명 불일치 수정**
  - `generateWarnings()` 함수에서 `totalMinutes` → `totalActualMins` 수정
  - `assignedStandardTime` → `totalStandardTime` 수정
  - AI Insights Utilization/Efficiency 이제 정상 표시 (47.4% / 51.8%)
- ✅ **데이터 계산 로그 강화**
  - 데이터 기간, 총 레코드, 작업자, 시프트, 총 작업시간, 총 시프트시간, 총 S/T, Utilization/Efficiency 콘솔 출력

### v4.1.0 (2026-03-02) 🎨 **Dashboard Period Modal 대폭 개선**
- ✅ **Period Detail Modal 레이아웃 개선**
  - Total Records 카드 제거, 6개 주요 KPI 카드를 가로 한 줄 배치
  - Workers, Avg Utilization, Avg Efficiency, Total Shift Time, Total Work Time, Total Adjusted S/T
  - 메인 KPI (Utilization/Efficiency) 강조: 그라데이션 배경, 더 큰 폰트, 아이콘 추가
- ✅ **Process Breakdown 디자인 대폭 개선**
  - 카드 크기 확대 및 폰트 크기 증가 (text-sm → text-base)
  - 파란색 그라데이션 배경 (from-blue-50 to-indigo-50)
  - 호버 효과 강화 (shadow-md, border-blue-400)
  - Workers/Util/Eff 값을 굵은 글씨로 강조
  - 좌우 정렬 레이아웃으로 가독성 향상
- ✅ **Top Performers & Need Attention 개선**
  - 기준 명시: "(Top 3)" / "(Bottom 3)" 표시
  - 영문 설명 추가: "Ranked by combined Utilization + Efficiency score"
  - 섹션별 그라데이션 배경 (녹색/주황색)
  - 아이콘 색상 강조 (트로피/경고)
- ✅ **버그 수정**
  - modalRecords 참조 오류 수정 (제거된 요소 참조 제거)
  - Dashboard 및 Report 모달의 ID 중복 문제 해결
  - Total Shift Time 값 표시 누락 수정
- ✅ **데이터 표시 개선**
  - 모든 시간 값에 천단위 구분자(콤마) 추가
  - 시간 단위를 minutes에서 hours로 변경 (60으로 나눈 값)
  - 콘솔 로그에 분(min)과 시간(hr) 모두 표시

### v4.0.0 (2026-03-01) 🎉 **Dashboard 페이지 구현**
- ✅ **새로운 Dashboard 탭 추가**
  - AI Insights & Warnings (6가지 자동 경고)
  - KPI Trend Overview (Daily/Weekly 토글)
  - Process Performance Ranking (Top 5 / Bottom 5)
  - Shift Comparison (Day vs Night)
  - Distribution & Outliers (히스토그램)
- ✅ **3개 Drill-Down 모달 추가**
  - **Process Modal**: 트렌드 차트, Sub-Process 분포, Top 10 Workers
  - **Shift Modal**: 일별 성과 분포, 프로세스 믹스 파이 차트
  - **Distribution Modal**: 범위별 작업자 리스트 테이블
- ✅ **AI Warning 로직 구현**
  - Low Utilization (< 50%)
  - Low Efficiency (< 50%)
  - Efficiency Gap (High Util + Low Eff)
  - Process Concentration (> 60%)
  - Low Sample Size (< 100 records)
- ✅ **필터 연동**: Report 탭 필터 적용 시 Dashboard 자동 업데이트
- ✅ **Chart.js 차트**: Line, Bar, Doughnut, Pie 차트 활용

### v3.6.0 (2026-02-28) 🔧 **Process Mapping 자동화 & UI 개선**
- ✅ **93개 하드코딩 매핑 규칙 추가** (Upload 24 기준)
  - `DEFAULT_PROCESS_MAPPING` 객체 생성
  - Mapping 시트 없을 때 자동 적용
- ✅ **Process Mapping API 추가**
  - `GET /api/process-mapping`
  - `GET /api/uploads/:id/process-mapping`
  - `POST /api/process-mapping`
  - `DELETE /api/process-mapping/:id`
- ✅ **업로드 진행률 UI 단순화**
  - Progress Bar 제거
  - "Data uploaded successfully! Processing in background..." 메시지만 표시
  - 3초 후 자동 사라짐
- ✅ **D1 Database에 업로드 진행률 저장**
  - `upload_status`, `progress_current`, `progress_total`, `error_message` 컬럼 추가
  - Cloudflare Workers 인스턴스 간 상태 공유 문제 해결
- ✅ **버그 수정**: Upload 47번 WT 필터 0명 문제
  - `loadDefaultProcessMapping()` 로직 수정
  - DB에 매핑 없으면 하드코딩 규칙 자동 적용

### v3.5.1 (2026-02-27)
- ✅ Worker Detail 모달 데이터 동기화 버그 수정

### v3.5.0 (2026-02-24)
- ✅ Week 필터 개선
- ✅ 성과 밴드 정렬 기능

### v3.4.0 (2026-02-23)
- ✅ Working Shift 필터별 컨텍스트 안내 추가

### v3.3.0 (2026-02-22)
- ✅ 로딩 인디케이터 추가

### v3.2.0 (2026-02-21)
- ✅ KPI 카드 재설계 (4개 구조)
- ✅ 동적 테마 (Utilization 파란색, Efficiency 보라색)

### v3.1.0 (2026-02-21)
- ✅ DB 스키마 업데이트 (worker_st, worker_rate_pct 추가)

### v3.0.0 (2026-02-20)
- ✅ 두 가지 성과 지표 시스템 도입

### v2.0.0 (2026-02-18)
- ✅ Cloudflare D1 데이터베이스 통합

### v1.0.0 (2026-02-15)
- ✅ 초기 버전 (엑셀 파일 로드 + 기본 리포트)

---

## 🚧 향후 계획

### Dashboard 고도화 (v4.1.0)
- [ ] Weekly aggregation 구현 (현재는 Daily만)
- [ ] WoW/DoD 변화율 표시
- [ ] Process hierarchy 드릴다운 (L1 → L2 → L3)
- [ ] 시간대별 분포 (현재는 일별만)
- [ ] Export 기능 (Dashboard → PDF/Excel)

### 성능 최적화 (v4.2.0)
- [ ] Chart 렌더링 최적화
- [ ] 모달 lazy loading
- [ ] 대용량 데이터 가상 스크롤링

---

**제작자**: twokomi  
**최종 업데이트**: 2026-03-02 (v4.3.2)  
**라이선스**: MIT

---

## 📞 문의

- GitHub Issues: https://github.com/twokomi/MES_R018_Analysis/issues
- Deployment: https://mes-r018-analysis.pages.dev
