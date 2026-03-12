# Rework 처리 로직 분석

## 📊 Executive Summary

**현재 구현 상태**: Rework 레코드는 **대부분의 계산에 포함**되며, **Worker Detail Modal에서만 제외**됩니다.

---

## 🔍 Rework 처리 흐름

### 1️⃣ **파싱 단계** (Line 851-876)

#### Rework Flag 설정
```javascript
// Line 851-858
let reworkFlag = false;
if (colRework !== -1) {
    const reworkValue = row[colRework];
    if (reworkValue === true || reworkValue === 'true' || reworkValue === 'True' || 
        reworkValue === 'TRUE' || reworkValue === 1 || reworkValue === '1') {
        reworkFlag = true;
    }
}
```

**인식되는 Rework 값**:
- `true` (Boolean)
- `'true'`, `'True'`, `'TRUE'` (String)
- `1`, `'1'` (Number/String)

**Rework Flag 저장**:
```javascript
// Line 872
record.rework = reworkFlag;
```

#### 파싱 완료 후 로그 (Line 881)
```javascript
console.log(` Parsed ${parsed.length} records (Rework excluded: ${parsed.filter(r => r.rework).length})`);
```

**⚠️ 주의**: 이 로그 메시지는 **"Rework excluded"**라고 표시하지만, **실제로는 제외하지 않고 카운트만** 합니다!

---

## 🎯 Rework 필터링 위치 분석

### ❌ **Rework 필터링 하지 않는 곳 (포함됨)**

#### 1. `processData()` 함수 (Line 1076-1238)
```javascript
// Line 1076-1238
function processData(rawData) {
    // ...
    rawData.forEach(record => {
        // ❌ rework 체크 없음
        // 모든 레코드 처리
        processed.push(processedRecord);
    });
}
```
**결과**: 모든 rework 레코드가 `processedData`에 포함됩니다.

---

#### 2. `aggregateDataForDashboard()` 함수 (Line 1240-1331)
```javascript
// Line 1248
processedData.forEach(record => {
    if (!record.validFlag || !record.workerName || !record.workingDay) return;
    // ❌ rework 체크 없음!
    // validFlag만 체크
});
```

**체크 조건**:
- ✅ `validFlag` (Result Cnt가 유효한가?)
- ✅ `workerName` (작업자 이름이 있는가?)
- ✅ `workingDay` (작업 날짜가 있는가?)
- ❌ `rework` (체크 안 함!)

**영향받는 기능**:
- Dashboard KPI Cards (Total Workers, Avg Utilization, Avg Efficiency)
- Performance Bands (Excellent, Normal, Poor, Critical 집계)
- Process Performance Ranking
- All aggregate metrics

---

#### 3. `aggregateByWorker()` 함수 (Line 2567-2700)
```javascript
// Line 2567
function aggregateByWorker(data) {
    data.forEach(record => {
        // ❌ rework 체크 없음
        // 모든 데이터 집계
        if (record.workerActMins > 0) {
            aggregated[key].totalMinutes += record.workerActMins;
            aggregated[key].validCount += 1;
        }
    });
}
```

**영향받는 기능**:
- Worker Performance Cards
- KPI Trend Charts
- Shift Comparison Tables
- All worker-level aggregations

---

#### 4. `exportToExcel()` 함수 (Line 7639-8012)

##### KPI Summary Sheet
```javascript
// No rework filtering - includes all aggregated data
```

##### Worker Performance Sheet
```javascript
// No rework filtering - includes all worker data
```

##### Shift Comparison Sheet
```javascript
// No rework filtering - includes all shift data
```

##### Performance Bands Sheet
```javascript
// No rework filtering - includes all band data
```

##### Raw Data Sheet (Line 8054)
```javascript
// Line 8054
r.rework ? 'Yes' : 'No'
```
**처리**: Rework 레코드를 제외하지 않고, "Yes"/"No" 컬럼으로만 표시합니다.

---

### ✅ **Rework 필터링 하는 곳 (제외됨)**

#### 1. `showWorkerDetail()` - Raw Records (Line 4608)
```javascript
// Line 4608
const rawRecords = rawDataSource.filter(r => 
    r.workerName === workerName && !r.rework  // ✅ rework 제외!
);
```

**목적**: Worker Detail Modal의 Daily Trends Chart 생성

---

#### 2. `showWorkerDetail()` - Process Chart (Line 5030)
```javascript
// Line 5030
const rawRecords = (AppState.processedData || []).filter(r => {
    if (r.workerName !== workerName || r.rework || !r.startDatetime) {
        return false;  // ✅ rework 제외!
    }
    // ... efficiency calculation
    return efficiency <= AppState.outlierThreshold;
});
```

**목적**: Worker Detail Modal의 Process Distribution Chart 생성

---

## 📊 Utilization vs Efficiency 계산에서 Rework 처리

### ✅ **Utilization Rate 계산**

#### 개별 레코드 단위 (Line 1135-1136)
```javascript
// Line 1135-1136
if (workerActMins > 0) {
    utilizationRate = (workerActMins / 660) * 100;
}
```
**Rework 처리**: ❌ 체크 안 함 → **Rework 포함**

#### 집계 단위 (Line 2671-2672)
```javascript
// Line 2671-2672
const utilizationRate = (item.totalMinutes / shiftTime) * 100;
```
**Rework 처리**: ❌ 체크 안 함 → **Rework 포함**

---

### ✅ **Efficiency Rate 계산**

#### 개별 레코드 단위 (Line 1141-1143)
```javascript
// Line 1141-1143
if (workerST > 0) {
    efficiencyRate = (workerST / workerActMins) * 100;
}
```
**Rework 처리**: ❌ 체크 안 함 → **Rework 포함**

#### 집계 단위 - Adjusted Standard Time 사용 (Line 2643-2648)
```javascript
// Line 2643-2648
const st = record['Worker S/T'] || 0;
const rate = record['Worker Rate(%)'] || 0;
const assigned = (st * rate) / 100;

aggregated[key]['Worker S/T'] += st;
aggregated[key].assignedStandardTime += assigned;
aggregated[key].totalMinutesOriginal += record['Worker Act'] || 0;
```

**Efficiency 최종 계산 (Line 2676-2678)**:
```javascript
// Line 2676-2678
const shiftTime = 660;
const efficiencyRate = (item.assignedStandardTime / shiftTime) * 100;
```

**Rework 처리**: ❌ 체크 안 함 → **Rework 포함**

---

## 🎯 결론

### 📌 **Rework 포함 여부 요약**

| 기능 | Utilization | Efficiency | Rework 포함? |
|------|-------------|------------|-------------|
| **Dashboard KPI** | ✅ | ✅ | ✅ **포함** |
| **AI Insights** | ✅ | ✅ | ✅ **포함** |
| **KPI Trend Charts** | ✅ | ✅ | ✅ **포함** |
| **Performance Bands** | ✅ | ✅ | ✅ **포함** |
| **Worker Performance** | ✅ | ✅ | ✅ **포함** |
| **Shift Comparison** | ✅ | ✅ | ✅ **포함** |
| **Worker Detail Modal** | ❌ | ❌ | ❌ **제외** |
| **Excel Export (All Sheets)** | ✅ | ✅ | ✅ **포함** |
| **Excel Raw Data (Display)** | - | - | ✅ **포함 (Yes/No 표시)** |

---

### 💡 **현재 로직 해석**

#### ✅ **Rework 레코드의 의미**
1. **Rework = 재작업**: 불량으로 인한 재작업 시간
2. **실제 작업 시간**: 작업자가 실제로 투입한 시간임
3. **생산성에 포함**: 작업자의 총 작업 시간에 포함되는 것이 맞음

#### 📊 **계산 로직**
```
Utilization = (Total Work Time including Rework) / (Total Shift Time) × 100
Efficiency = (Adjusted Standard Time including Rework) / (Total Shift Time) × 100
```

**Rework 포함 이유**:
- 재작업도 작업자의 실제 작업 시간이므로 Utilization에 포함
- 재작업에도 표준 시간이 적용되므로 Efficiency에 포함
- Worker Detail Modal에서만 제외하여 "순수 작업" vs "재작업 포함" 비교 가능

---

### ⚠️ **오해의 소지**

#### 파싱 로그 메시지 (Line 881)
```javascript
console.log(` Parsed ${parsed.length} records (Rework excluded: ${parsed.filter(r => r.rework).length})`);
```

**문제점**: 
- "Rework excluded"라고 표시하지만 **실제로는 제외하지 않음**
- 단순히 rework 레코드 개수를 카운트하는 것일 뿐

**제안**:
```javascript
// 더 명확한 메시지로 변경
console.log(` Parsed ${parsed.length} records (Rework detected: ${parsed.filter(r => r.rework).length})`);
```

---

## 📋 검증 체크리스트

### ✅ **Utilization 계산 확인**
- [x] 개별 레코드: `workerActMins / 660 × 100`
- [x] Rework 포함: validFlag만 체크, rework 체크 안 함
- [x] Dashboard KPI: rework 포함된 집계 데이터 사용
- [x] Excel Export: rework 포함된 데이터 출력

### ✅ **Efficiency 계산 확인**
- [x] 개별 레코드: `workerST / workerActMins × 100`
- [x] 집계: `assignedStandardTime / shiftTime × 100`
- [x] Rework 포함: validFlag만 체크, rework 체크 안 함
- [x] Dashboard KPI: rework 포함된 집계 데이터 사용
- [x] Excel Export: rework 포함된 데이터 출력

### ✅ **Rework 제외 위치**
- [x] Worker Detail Modal - Daily Trends Chart
- [x] Worker Detail Modal - Process Distribution Chart

---

## 🎯 권장 사항

### ✅ **현재 로직 유지 (권장)**

**이유**:
1. **논리적 타당성**: Rework도 실제 작업 시간이므로 포함이 합리적
2. **투명성**: Raw Data에 "Yes"/"No" 표시로 구분 가능
3. **유연성**: Worker Detail에서 Rework 제외 보기 가능
4. **일관성**: Utilization과 Efficiency 모두 동일하게 처리

### 📝 **문서화 개선**

1. **User Guide에 명시**:
   > "⚠️ Rework records are **included in all calculations** (Utilization and Efficiency) as they represent actual work time. Worker Detail Modal excludes rework for focused analysis."

2. **파싱 로그 메시지 수정**:
   ```javascript
   console.log(` Parsed ${parsed.length} records (Rework detected: ${parsed.filter(r => r.rework).length})`);
   ```

---

## 📞 Reference
- **Beta Site**: https://mes-r018-analysis.pages.dev
- **GitHub**: https://github.com/twokomi/MES_R018_Analysis
- **Document**: `/home/user/webapp/docs/Rework_처리_로직_분석.md`
- **Last Updated**: 2026-03-10
