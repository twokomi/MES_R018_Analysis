# MES R018 Required Columns - Final Analysis

## Executive Summary
Based on code analysis, **9 out of 40 columns** from MES R018 are actually used in the application.

---

## ✅ REQUIRED COLUMNS (9 columns)

### 📊 Core Required (6 columns)
These columns are **absolutely essential** for the application to function:

| # | MES R018 Column Name | Code Field Name | Usage Count | Purpose |
|---|---------------------|-----------------|-------------|---------|
| 1 | **Worker Name** | `workerName` | 80 | Worker identification, grouping, filtering |
| 2 | **FO Desc** | `fdDesc` | 9 | Process mapping, category classification |
| 3 | **Start Datetime** | `startDatetime` | 13 | Date/shift extraction, overlap detection |
| 4 | ***End Datetime** | `endDatetime` | 8 | Time range calculation, overlap detection |
| 5 | **Worker Act** | `workerAct` / `workerActMins` | 31 | Actual work time (minutes), utilization calculation |
| 6 | **Result Cnt** | `resultCnt` | 3 | Valid record filtering (non-zero = valid work) |

### 📈 Enhanced Metrics (3 columns)
These columns enable efficiency calculations and detailed analysis:

| # | MES R018 Column Name | Code Field Name | Usage Count | Purpose |
|---|---------------------|-----------------|-------------|---------|
| 7 | **Worker S/T** | `workerST` | 5 | Standard time for efficiency calculation |
| 8 | **Worker Rate(%)** | `workerRate` | 3 | Worker rate for adjusted standard time |
| 9 | **Rework** | `rework` | 3 | Filter out rework records from analysis |

### 🎯 Optional Display (2 columns)
These columns are only used for UI display, not calculations:

| # | MES R018 Column Name | Code Field Name | Usage Count | Purpose |
|---|---------------------|-----------------|-------------|---------|
| 10 | **Actual Shift** | `actualShift` | 19 | Shift classification (A/B/C/D), shift comparison charts |
| 11 | **Section ID** | `sectionId` | 2 | Displayed in Worker Detail table only |

---

## ❌ UNUSED COLUMNS (31 columns)

These columns are **NOT used** in the current application:

```
Plant, Operation Code, Result Date, Shift Group Desc, Machine Code, 
Machine Desc, Work Team Desc, Worker Code, Inside Pass Count, 
Outside Pass Count, Order Total Inside, Order Total Outside, Status, 
Machine S/T, Rework Reason Code, Rework Reason Desc, Created By, 
Created On, Modified By, Modified On, Created IP, Modified IP, 
SAP PO No, Worker Input, Sub FlowOp Desc, Heat No, Plate No, 
Thickness(mm), Length shorter side(mm), Length longer side(mm)
```

### 🔍 Special Note: SAP PO No
- **Status**: Parsed but NEVER used
- **Reason**: `validCount` is always available, so the fallback logic `worker.validCount || worker.woNumbers.size` never executes the second branch
- **Code location**: Line 2316 in app.js
- **Conclusion**: Safe to exclude from API

---

## 📋 API Response Format Recommendation

### Minimum Required API Response
```json
{
  "recordsCount": 117,
  "period": {
    "start": "2026-02-01",
    "end": "2026-03-02"
  },
  "rawData": [
    {
      "Worker Name": "WYANT",
      "FO Desc": "Bevel",
      "Start Datetime": "2026-02-01 08:00:00",
      "*End Datetime": "2026-02-01 10:30:00",
      "Worker Act": 150,
      "Result Cnt": 5,
      "Worker S/T": 120,
      "Worker Rate(%)": 95.5,
      "Rework": ""
    }
  ]
}
```

### Enhanced API Response (with optional fields)
```json
{
  "recordsCount": 117,
  "period": {
    "start": "2026-02-01",
    "end": "2026-03-02"
  },
  "rawData": [
    {
      "Worker Name": "WYANT",
      "FO Desc": "Bevel",
      "Start Datetime": "2026-02-01 08:00:00",
      "*End Datetime": "2026-02-01 10:30:00",
      "Worker Act": 150,
      "Result Cnt": 5,
      "Worker S/T": 120,
      "Worker Rate(%)": 95.5,
      "Rework": "",
      "Actual Shift": "A",
      "Section ID": "SK01-001"
    }
  ]
}
```

---

## 🎯 Key Calculations Using These Columns

### 1. **Utilization Rate (%)**
```
Utilization = (Total Worker Act) / (Total Available Time) × 100
```
- Uses: `Worker Act` (adjusted for overlaps)
- Uses: `Start Datetime`, `*End Datetime` for shift time calculation

### 2. **Efficiency Rate (%)**
```
Efficiency = (Adjusted Standard Time) / (Total Worker Act) × 100
where: Adjusted Standard Time = Worker S/T × Worker Rate(%) / 100
```
- Uses: `Worker S/T`, `Worker Rate(%)`, `Worker Act`
- Note: If these columns are missing, efficiency will be 0%

### 3. **W/O Count**
```
W/O Count = COUNT(records WHERE Worker Act > 0 AND Result Cnt is valid)
```
- Uses: `Worker Act`, `Result Cnt`
- Note: SAP PO No is NOT used for this calculation

### 4. **Valid Record Filtering**
```
Valid = (Result Cnt != null) AND (Result Cnt != "-") AND (Rework is empty)
```
- Uses: `Result Cnt`, `Rework`

---

## 📝 Migration Checklist for Vendor

### Phase 1: Minimum Required (Week 1-2)
- [ ] Extract 6 core columns from MES R018 table
- [ ] Return JSON format matching example above
- [ ] Test with current Excel upload structure
- [ ] **Expected Result**: Dashboard works, but efficiency = 0%

### Phase 2: Full Features (Week 2-3)
- [ ] Add Worker S/T and Worker Rate(%) columns
- [ ] Add Rework column for filtering
- [ ] **Expected Result**: All features work, efficiency calculated correctly

### Phase 3: Enhanced UI (Week 3-4)
- [ ] Add Actual Shift column for shift comparison charts
- [ ] Add Section ID column for detail table display
- [ ] **Expected Result**: 100% feature parity with current beta

---

## 🚀 Recommended Vendor Scope

### ✅ In Scope (9 columns)
```
1. Worker Name       ← MUST
2. FO Desc           ← MUST
3. Start Datetime    ← MUST
4. *End Datetime     ← MUST
5. Worker Act        ← MUST
6. Result Cnt        ← MUST
7. Worker S/T        ← RECOMMENDED
8. Worker Rate(%)    ← RECOMMENDED
9. Rework            ← RECOMMENDED
10. Actual Shift     ← OPTIONAL (for shift charts)
11. Section ID       ← OPTIONAL (for UI display)
```

### ❌ Out of Scope (31 columns)
All other columns including SAP PO No can be safely excluded from the API.

---

## 📞 Contact Information
- **Current Beta**: https://mes-r018-analysis.pages.dev
- **GitHub**: https://github.com/twokomi/MES_R018_Analysis
- **Target Completion**: 2026-04-15
- **Last Updated**: 2026-03-10

---

## 🔐 Security Note
The vendor should implement:
- JWT authentication for API endpoints
- HTTPS only (no HTTP)
- Rate limiting (recommended: 60 requests/minute)
- Input validation on date ranges
- SQL injection prevention on database queries

---

**Document Version**: 1.0  
**Analysis Date**: 2026-03-10  
**Analyzed By**: Code Analysis Tool  
**Lines of Code Analyzed**: 8,000+ (app.js)
