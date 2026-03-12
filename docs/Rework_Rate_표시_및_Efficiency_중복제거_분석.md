# 질문 답변: Rework Rate 표시 및 Efficiency 중복 제거

## 질문 1: Rework을 제외한 Rate 표시 가능 여부

### 📋 요구사항
> "혹시 Rework이 W/O에 포함되어 있는 경우, Rework를 제외한 Rate를 표시해줄 수 있나? 엑셀로 치면 IF문 같은걸 써서 말이야. 모달페이지에의 Rate 카드 내부에만 약간 작은 글씨로 쓰면 될 것 같은데.. 가능한지 알려줘."

### ✅ **답변: 가능합니다!**

---

### 🎯 구현 가능한 방식

#### **현재 상황 분석**

**Worker Detail Modal의 Rate 카드 (Line 4689-4730)**:
```javascript
// Efficiency Mode
document.getElementById('modalWorkRate').textContent = currentRate.toFixed(1) + '%';
document.querySelector('#modalWorkRate').nextElementSibling.textContent = 'performance';

// Utilization Mode  
document.getElementById('modalWorkRate').textContent = currentRate.toFixed(1) + '%';
document.querySelector('#modalWorkRate').nextElementSibling.textContent = 'performance';
```

**데이터 필터링 (Line 4608)**:
```javascript
const rawRecords = rawDataSource.filter(r => 
    r.workerName === workerName && !r.rework  // ✅ 이미 rework 제외
);
```

---

### 💡 **구현 방법**

#### **Option 1: 추가 텍스트 표시 (권장)**

**위치**: `modalWorkRate` 카드 하단에 작은 글씨로 추가

**표시 내용**:
```
Efficiency Rate: 85.3%
(excl. rework: 82.1% | rework: 12 records)
```

**계산 로직**:
```javascript
// 1. Rework 포함 데이터
const allRecords = rawDataSource.filter(r => r.workerName === workerName);

// 2. Rework 제외 데이터 (현재 이미 사용 중)
const nonReworkRecords = rawDataSource.filter(r => 
    r.workerName === workerName && !r.rework
);

// 3. Rework만 데이터
const reworkRecords = rawDataSource.filter(r => 
    r.workerName === workerName && r.rework
);

// 4. 각각 Rate 계산
const rateWithRework = calculateRate(allRecords);
const rateWithoutRework = calculateRate(nonReworkRecords); // 현재 표시 중
const reworkCount = reworkRecords.length;

// 5. 조건부 표시
if (reworkCount > 0) {
    // Rework가 있는 경우: 양쪽 모두 표시
    displayText = `
        <div class="text-2xl font-bold text-gray-900">${rateWithoutRework.toFixed(1)}%</div>
        <div class="text-xs text-gray-500 mt-1">
            <i class="fas fa-info-circle mr-1"></i>
            Incl. rework: ${rateWithRework.toFixed(1)}% (${reworkCount} records)
        </div>
    `;
} else {
    // Rework가 없는 경우: 기존대로 표시
    displayText = `
        <div class="text-2xl font-bold text-gray-900">${rateWithoutRework.toFixed(1)}%</div>
    `;
}
```

---

#### **Option 2: Tooltip 표시**

**위치**: Rate 숫자에 마우스 오버 시 툴팁

**표시 내용**:
```
Rate: 85.3%
─────────────────
✅ Excluding rework: 82.1%
📊 Including rework: 85.3%
🔄 Rework records: 12
```

**장점**:
- UI가 깔끔함
- 필요한 사용자만 확인 가능

**단점**:
- 모바일에서 확인 어려움

---

#### **Option 3: 토글 버튼**

**위치**: Rate 카드 우측 상단에 작은 아이콘

**동작**:
- 기본: Rework 제외 Rate 표시
- 클릭: Rework 포함 Rate로 전환
- 재클릭: 다시 제외 Rate로

**장점**:
- 사용자가 직접 선택 가능
- 명확한 비교

**단점**:
- 구현 복잡도 약간 증가

---

### 📊 **데이터 계산 예시**

#### **Efficiency 모드**
```javascript
// Rework 제외 (현재 표시)
const nonReworkData = aggregateByWorker(nonReworkRecords);
const assignedSTWithoutRework = nonReworkData.reduce((sum, r) => 
    sum + r.assignedStandardTime, 0
);
const efficiencyWithoutRework = (assignedSTWithoutRework / shiftTime) * 100;

// Rework 포함
const allData = aggregateByWorker(allRecords);
const assignedSTWithRework = allData.reduce((sum, r) => 
    sum + r.assignedStandardTime, 0
);
const efficiencyWithRework = (assignedSTWithRework / shiftTime) * 100;

// 차이 계산
const reworkImpact = efficiencyWithRework - efficiencyWithoutRework;
```

#### **Utilization 모드**
```javascript
// Rework 제외
const totalMinutesWithoutRework = nonReworkData.reduce((sum, r) => 
    sum + r.totalMinutes, 0
);
const utilizationWithoutRework = (totalMinutesWithoutRework / availableTime) * 100;

// Rework 포함
const totalMinutesWithRework = allData.reduce((sum, r) => 
    sum + r.totalMinutes, 0
);
const utilizationWithRework = (totalMinutesWithRework / availableTime) * 100;
```

---

### 🎨 **UI 레이아웃 예시**

#### **현재 Rate 카드**
```
┌─────────────────────────────┐
│  Efficiency Rate            │
│  (Shift Productivity)       │
│                             │
│      85.3%                  │  ← 큰 글씨
│                             │
│      performance            │  ← 작은 글씨
└─────────────────────────────┘
```

#### **개선안 (Option 1)**
```
┌─────────────────────────────┐
│  Efficiency Rate            │
│  (Shift Productivity)       │
│                             │
│      82.1%                  │  ← 큰 글씨 (Rework 제외)
│                             │
│  ℹ️ Incl. rework: 85.3%     │  ← 작은 회색 글씨
│     (12 records)            │
│                             │
│      performance            │
└─────────────────────────────┘
```

---

### ✅ **권장 방안**

#### **Option 1 (추가 텍스트) 추천**

**이유**:
1. ✅ **간단 명확**: 한눈에 양쪽 비교 가능
2. ✅ **모바일 호환**: 모든 디바이스에서 확인 가능
3. ✅ **구현 용이**: 기존 코드에 몇 줄만 추가
4. ✅ **정보 제공**: Rework 레코드 개수도 표시

**표시 조건**:
- Rework 레코드가 **1개 이상** 있을 때만 표시
- 없으면 기존과 동일하게 표시

---

## 질문 2: Efficiency에서 중복 시간 제거 여부

### 📋 요구사항
> "이것도 확인만해줘. 지금 Efficiency에서는 중복 시간을 제거하지 않고있니?"

### ✅ **답변: 맞습니다! Efficiency는 중복 시간을 제거하지 않습니다.**

---

### 🔍 **상세 분석**

#### **1. 중복 제거가 적용되는 곳: Utilization만**

**mergeOverlappingIntervals() 함수 (Line 940-1042)**:
```javascript
function mergeOverlappingIntervals(records) {
    // Worker별로 그룹화
    const groupedByWorker = {};
    records.forEach(record => {
        const worker = record.workerName;
        if (!groupedByWorker[worker]) {
            groupedByWorker[worker] = [];
        }
        groupedByWorker[worker].push(record);
    });
    
    // 각 Worker의 중복 시간 제거
    Object.keys(groupedByWorker).forEach(worker => {
        const workerRecords = groupedByWorker[worker];
        // ...
        // record.workerActMins = adjustedMinutes; ← 중복 제거된 시간
    });
}
```

**적용 위치 (Line 1233)**:
```javascript
function processData(rawData) {
    // ...
    // Merge overlapping time intervals for each worker
    mergeOverlappingIntervals(processed);  // ← 여기서 workerActMins 조정
    
    return processed;
}
```

---

#### **2. Utilization 계산: 중복 제거된 시간 사용**

**aggregateByWorker() - Line 2620**:
```javascript
if (record.workerActMins > 0) {
    aggregated[key].totalMinutes += record.workerActMins;  // ← 중복 제거된 시간
}

// Utilization 계산
const utilizationRate = (item.totalMinutes / 660) * 100;
```

**✅ Utilization = 중복 제거된 workerActMins 사용**

---

#### **3. Efficiency 계산: 원본 시간 사용**

**aggregateByWorker() - Line 2643-2645**:
```javascript
const st = record['Worker S/T'] || 0;
const rate = record['Worker Rate(%)'] || 0;
const assigned = (st * rate / 100);

aggregated[key]['Worker S/T'] += st;  // ← 원본 S/T
aggregated[key].assignedStandardTime += assigned;  // ← 원본 기반 계산
aggregated[key].totalMinutesOriginal += record['Worker Act'] || 0;  // ← 원본 Actual
```

**Efficiency 계산 (Line 2676-2678)**:
```javascript
const shiftTime = 660;
const efficiencyRate = (item.assignedStandardTime / shiftTime) * 100;
```

**❌ Efficiency = 원본 Worker S/T, Worker Rate, Worker Act 사용**
**❌ 중복 제거 적용 안 됨!**

---

### 📊 **구체적 예시**

#### **작업자 WYANT의 하루 작업**

**원본 데이터**:
| 시간 | Worker Act | Worker S/T | Worker Rate | 중복? |
|------|-----------|------------|-------------|-------|
| 08:00-10:00 | 120분 | 100분 | 95% | - |
| 09:30-11:00 | 90분 | 80분 | 95% | ✅ 30분 중복 |
| 11:00-12:00 | 60분 | 50분 | 95% | - |

**합계**:
- 원본 Worker Act: 120 + 90 + 60 = **270분**
- 원본 Worker S/T: 100 + 80 + 50 = **230분**
- 원본 Adjusted S/T: (100×95% + 80×95% + 50×95%) = **218.5분**

**중복 제거 후**:
- 중복 제거 Worker Act: 120 + 60 + 60 = **240분** (30분 중복 제거)

---

#### **계산 결과**

**Utilization (중복 제거 사용)**:
```
Utilization = 240분 / 660분 × 100 = 36.4%
✅ 중복 제거된 240분 사용
```

**Efficiency (원본 사용)**:
```
Efficiency = 218.5분 / 660분 × 100 = 33.1%
❌ 원본 Adjusted S/T 218.5분 사용 (중복 포함)
```

---

### 🤔 **왜 Efficiency는 중복 제거 안 하나?**

#### **논리적 근거**

**1. Efficiency의 정의**:
```
Efficiency = (표준 시간 기준 생산량) / (투입 시간) × 100
```
- **표준 시간(Worker S/T)**: 각 작업마다 개별적으로 정의됨
- **중복 작업 = 실제로 수행한 작업**: 표준 시간도 그만큼 발생함

**2. 중복의 의미**:
- 08:00-10:00: Bevel 작업 (S/T 100분)
- 09:30-11:00: Weld 작업 (S/T 80분)
- **동시 수행**: 두 작업 모두 실제로 수행 → 표준 시간 모두 발생

**3. Utilization과의 차이**:
- **Utilization**: 작업자가 얼마나 바빴는가? (시간 기준)
  - 중복 시간은 한 번만 카운트 (동시에 일했으므로)
- **Efficiency**: 작업자가 얼마나 많이 생산했는가? (생산량 기준)
  - 각 작업의 표준 시간 모두 카운트 (두 작업 모두 수행했으므로)

---

### 📋 **정리**

| 구분 | Utilization | Efficiency |
|------|-------------|-----------|
| **계산 기준** | 실제 작업 시간 | 표준 시간 기준 생산량 |
| **중복 제거** | ✅ **적용** (workerActMins) | ❌ **미적용** (Worker S/T, Rate) |
| **의미** | 작업자가 얼마나 바빴는가? | 작업자가 얼마나 생산했는가? |
| **중복 처리** | 한 번만 카운트 | 각 작업 모두 카운트 |
| **코드 위치** | Line 2620 (totalMinutes) | Line 2643-2645 (assignedStandardTime) |

---

### ✅ **결론**

#### **질문 1: Rework Rate 표시**
- ✅ **가능**: Option 1 (작은 글씨 추가 텍스트) 추천
- 📍 **위치**: Worker Detail Modal의 Rate 카드 하단
- 💡 **표시 내용**: "Incl. rework: 85.3% (12 records)"
- 🔄 **조건**: Rework 레코드가 1개 이상일 때만 표시

#### **질문 2: Efficiency 중복 제거**
- ✅ **확인됨**: Efficiency는 **중복 시간을 제거하지 않음**
- 📊 **Utilization**: 중복 제거 적용 (workerActMins)
- 📈 **Efficiency**: 중복 제거 미적용 (Worker S/T, Rate)
- 💡 **이유**: 각 작업의 표준 시간은 독립적으로 발생하므로 모두 카운트하는 것이 맞음

---

## 📞 Reference
- **Beta Site**: https://mes-r018-analysis.pages.dev
- **GitHub**: https://github.com/twokomi/MES_R018_Analysis
- **Document**: `/home/user/webapp/docs/`
- **Last Updated**: 2026-03-10
