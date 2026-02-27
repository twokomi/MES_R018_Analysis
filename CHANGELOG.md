# Changelog

All notable changes to MES R018 Analysis will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.5.1] - 2026-02-27

### 🐛 Fixed - Worker Detail Modal Data Sync
- **Modal KPI Calculation**: Fixed Worker Detail modal using stale cached data not reflecting current filter state
- **Issue**: Modal Total Work Time included filtered-out records, causing mismatch with table Adjusted sum
- **Solution**: Modal now aggregates current filtered data directly instead of using cached aggregation
- **Impact**: Modal KPIs now always match table data and reflect active filters accurately

## [3.5.0] - 2026-02-27

### 🔧 Fixed - Result CNT Logic
- **Work Time Calculation**: Changed to count all work time regardless of Result CNT value
- **Previous Issue**: Only records with Result CNT = 'X' were counted, causing some workers to show 0% utilization
- **Solution**: Removed Result CNT validation check, now includes all records with actual work time
- **Impact**: All workers with valid work time now display correct utilization and efficiency rates

## [3.4.0] - 2026-02-24

### 🎨 Added - Shift Filter Context & Clarifications
- **Total Workers Tooltip (All Filter)**: Info icon with tooltip explaining workers may appear in both Day and Night shifts due to overtime work
- **Shift Filter Warning (Day/Night Filter)**: Yellow warning banner explaining that view includes overtime workers from previous shifts
- **Context-aware UI**: Tooltip/warning visibility automatically adjusts based on Working Shift filter selection
- **Performance Context**: Clarifies that performance rates may not reflect actual efficiency when viewing Day/Night only filters

### 🎨 Improved - User Guide Visual Enhancements
- Changed all User Guide section headers to bright blue (text-blue-700) for better visibility
- Improved visual hierarchy and navigation within manual sections

### 🔍 Technical Details
- Added `kpiWorkersInfoIcon` element with Font Awesome info-circle icon
- Added `shiftFilterWarning` element with yellow warning styling
- Modified `updateKPIs()` function to show/hide elements based on `AppState.filters.workingShift`
- Info icon visible only when Working Shift = "All"
- Warning banner visible only when Working Shift = "Day" or "Night"

## [3.1.0] - 2026-02-21

### 🔧 Fixed - Critical Database Issues
- **DB Save/Load Efficiency Fields**: Fixed Worker S/T and Worker Rate(%) not being saved/loaded
  - Added database migration `0002_add_efficiency_fields.sql`
  - Added `worker_st` and `worker_rate_pct` columns to `raw_data` table
  - Backend API now saves/loads efficiency fields correctly
  - Frontend `loadUploadById` now restores all efficiency fields
- **Modal Outlier Filtering**: Fixed Worker Detail modal not reflecting Outlier Threshold
  - Modal now filters out outliers when calculating summary work rate
  - Main page % and modal % now match correctly
- **Hourly Work Distribution Chart**: Fixed chart using incorrect field names
  - Changed from `S_T`, `Rate`, `Work Rate(%)` to `Worker S/T`, `Worker Rate(%)`
  - Chart now displays hourly efficiency correctly

### 🔍 Added - Debug Logging
- Added debug logs for DB load process (rawData restoration)
- Added debug logs for processData efficiency fields tracking
- Added warning logs for Worker S/T=0 or Rate=0 (first 5 records)

### 🗑️ Breaking Changes
- **Existing DB data incompatible**: Data saved before v3.1.0 has worker_st=0, worker_rate_pct=0
- **Action required**: Delete old uploads and re-upload Excel files
- **Migration**: Run `npx wrangler d1 migrations apply mes-r018-analysis-production --local`

### 📝 Changed
- Updated cache-busting version to v=1771690200
- Cleaned local database (deleted all existing uploads for testing)

## [3.0.2] - 2026-02-21

### ✨ Fixed - Critical Outlier Filtering
- **Root Cause**: `aggregateByWorkerOnly()` was re-processing raw data, bypassing outlier filter
- **Solution**: Modified to use already-filtered `workerAgg` data only
- **Result**: Outliers removed in `aggregateByWorker()` no longer reappear in charts/bands
- **Performance**: Eliminated unnecessary data re-processing, reduced memory usage

### 📊 Improved - Data Consistency
- Ensured consistency across entire pipeline: `updateReport()` → `aggregateByWorker()` → `aggregateByWorkerOnly()`
- All components (KPIs, Performance Bands, Charts) now use same filtered data
- Filter order: UI filters → Rework exclusion → S/T > 0 validation → Outlier removal

## [3.0.1] - 2026-02-21

### 🔧 Fixed - Outlier Threshold Mode Separation
- **Work Efficiency Mode**: Outlier Threshold UI shown, filtering active
- **Time Utilization Mode**: Outlier Threshold UI hidden, filtering inactive
- Applied outlier filtering only at W/O level (removed from Worker Total level)
- Improved logging with filtering statistics

### 🗄️ Enhanced - D1 Database Error Handling
- Added graceful fallback for local dev without D1 binding
- Strengthened error handling for `/api/uploads` endpoint

### ✅ Verified - Working Day/Shift Calculation
- Day shift: 06:00-17:59 (same date)
- Night shift: 18:00-05:59 (00:00-05:59 belongs to previous day)
- actualShift correctly mapped from ShiftCalendar

## [3.0.0] - 2026-02-20

### 🎊 Added - Dual Metric System
- **Time Utilization Rate**: Actual work time / Available shift time × 100%
- **Work Efficiency Rate**: Assigned standard time / Actual work time × 100%
- Real-time metric toggle with icons (clock ⇄ lightning)

### 🎨 Changed - Metric-Specific UI/UX
- Time Utilization: Blue theme, time in minutes
- Work Efficiency: Purple theme, efficiency in percentage
- Redesigned Performance Bands: Excellent (≥15%/120%), Good, Normal, Poor, Critical

### 🔍 Enhanced - Data Filtering
- Automatic Rework exclusion (W column = true)
- Worker S/T > 0 condition for Work Efficiency mode
- Worker Rate(%) 0% handling (not missing)

### 👤 Improved - Worker Detail Modal
- Time Utilization: Daily/hourly work time charts, overlap removal display
- Work Efficiency: Daily/hourly efficiency charts, S/T·Rate·Assigned·Efficiency display

### 🐛 Fixed
- Overlap removal applied per worker (not merged across workers)
- Performance Band empty ranges removed
- Worker Rate(%) missing handled as 0%

### 💔 Breaking Changes
- Removed previous Valid-only work rate calculation

## [2.6.0] - 2026-02-18

### ✨ Added - Week Filter
- Week-based date selection (ISO Week, Monday start)
- Week number display (e.g., WK7: 02-10 ~ 02-16)
- Quick selection with Month and Week buttons

### 🎨 Improved - Filter UX
- Enhanced hover effects (darker colors + white text)
- Active click effects (scale-95, darker background)
- Auto-close dropdown after selection
- Close all dropdowns on Apply Filter

### 📊 Fixed - Average Work Rate Calculation
- Changed from worker count based to total shift count based
- Accurate average work rate per process
- Fixed abnormal values (457% → normal range like 65%)

### 🎯 Enhanced - Pivot Table Header
- Used rowspan for Worker Name cell merging
- Sticky header for scroll lock
- Clean 2-line header structure

## [2.5.0] - 2026-02-18

### 🎯 Added - Performance Band Sorting
- Sort each band (Excellent/Poor/Critical) ascending/descending

### 👤 Added - Worker Detail Modal
- Total work time, work rate, record count, performance band
- Daily work time line chart
- Process work time donut chart
- Detailed work history table

### 🎨 Improved - UI/UX
- Sort buttons, clickable worker cards, responsive modal design

## [2.4.0] - 2026-02-18

### ✨ Added - Upload Deletion
- Delete button on each upload card
- Confirmation dialog before deletion
- CASCADE deletion (removes all related data)

### ✅ Verified - Time Overlap Removal
- Successfully removed 436 overlaps, 33,604 minutes

## [2.3.0] - 2026-02-18

### ✨ Added - Worker-Specific Time Overlap Removal
- Automatic merging of overlapping time intervals for multi-job work
- Interval Merging algorithm for accurate work time calculation
- Overlap removal statistics in console logs

## [2.2.0] - 2026-02-17

### ✨ Added - Upload List & Load
- Upload file list UI
- Click card to load data
- Auto-switch to Report tab after load

### 🐛 Fixed
- Month display bug (now correctly shows Feb 2026)
- Added global switchTab function
- Fixed data field mapping (foDesc2, foDesc3)

## [2.1.0] - 2026-02-17

### 🗄️ Added - Cloudflare D1 Integration
- Hono backend framework
- Manual data save feature (Save to Database button)
- REST API endpoints
- Cloudflare Pages deployment

## [2.0.0] - 2026-02-16

### ✨ Initial Release
- Checkbox filter system
- 3-month Shift Calendar
- Process mapping management
- JSON export/import

---

[3.1.0]: https://github.com/twokomi/MES_R018_Analysis/compare/v3.0.2...v3.1.0
[3.0.2]: https://github.com/twokomi/MES_R018_Analysis/compare/v3.0.1...v3.0.2
[3.0.1]: https://github.com/twokomi/MES_R018_Analysis/compare/v3.0.0...v3.0.1
[3.0.0]: https://github.com/twokomi/MES_R018_Analysis/compare/v2.6.0...v3.0.0
