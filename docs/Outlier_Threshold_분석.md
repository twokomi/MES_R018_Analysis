# Outlier Threshold 사용 현황 분석

## 📊 현재 상태

### ✅ 설정 가능한 UI
- **위치**: Dashboard 탭 → Outlier Threshold Control
- **기본값**: 1000%
- **조정 가능**: 사용자가 원하는 값으로 변경 가능

### 🎯 실제 사용 위치

#### 1️⃣ Worker Detail Modal → Process Chart (라인 5041)
```javascript
return efficiency <= AppState.outlierThreshold; // Apply outlier threshold
```
**효과**: 
- Worker Detail 모달을 열 때 Process Chart에서 outlier 필터링
- 예: 1000% 초과 레코드는 차트에서 제외됨

#### 2️⃣ 시각적 표시만 (라인 2680, 3482, 5186)
```javascript
const isOutlier = (efficiencyRate > outlierThreshold);
// → 빨간색 아이콘(🚫) 표시만, 데이터는 포함
```
**효과**:
- Performance Bands 카드, Worker Detail 테이블에서 빨간색 표시
- 계산에는 **모두 포함**됨

### ❌ 사용되지 않는 곳

다음 항목들은 **outlier를 필터링하지 않고 모두 포함**:
- Dashboard KPI 카드 (Total Workers, Avg Utilization, Avg Efficiency)
- AI Insights & Alerts
- KPI Trend Charts (7일/14일/30일/전체)
- Process Performance Ranking
- Shift Performance Comparison
- Performance Bands 집계 (Excellent/Normal/Poor/Critical 개수)
- Worker Performance Report (날짜별 상세 레코드)
- Excel Export (모든 시트)

---

## 🤔 결론

### 현재 상황
> **"Outlier Threshold는 거의 사용되지 않음"**

1. **실제 필터링**: Worker Detail Modal의 Process Chart 단 1곳
2. **시각적 표시**: 빨간색 아이콘으로 outlier 표시만
3. **계산 포함**: Dashboard, KPI, Excel 등 **모든 주요 계산에 outlier 포함**

### User Guide 문구
> "⚠️ Important: Outliers represent real work and are **included in all calculations**. They are only highlighted in red for visual reference."

이 문구가 **정확히 현재 구현과 일치**합니다.

---

## 💭 질문에 대한 답변

**Q: "현재는 Outlier Threshold 이거 안쓰고 있지? 그냥 기능만 남겨둔거지?"**

**A: 맞습니다!**

- ✅ **UI는 있지만** 실질적 효과는 매우 제한적
- ✅ **거의 안 쓰임**: Worker Detail Modal의 Process Chart에서만 필터링
- ✅ **모든 주요 기능**에서는 outlier 포함하여 계산
- ✅ **시각적 표시용**: 빨간색 아이콘으로 "이상한 값"임을 표시만

---

## 🎯 제안

### Option 1: 현재 유지
- User Guide에 명확히 설명되어 있음
- 실제 작업(real work)이므로 포함하는 것이 합리적
- 시각적으로만 표시하여 사용자가 인지 가능

### Option 2: 완전히 제거
- Worker Detail Modal에서도 필터링 제거
- 빨간색 아이콘만 남김
- UI에서 Outlier Threshold Control 숨김

### Option 3: 전면 적용 (권장하지 않음)
- 모든 계산에서 outlier 제외
- KPI, Dashboard, Excel 모두 필터링
- ⚠️ 위험: 실제 작업 데이터 손실 가능

---

## 📝 권장 사항

**현재 상태 유지 (Option 1) 추천**

**이유**:
1. Outlier는 데이터 오류가 아닌 실제 높은 생산성일 수 있음
2. 제외하면 데이터 손실 위험
3. 시각적 표시만으로도 충분히 이상 값 인지 가능
4. User Guide에 명확히 설명되어 혼란 없음

**다만, UI 혼란 방지를 위해**:
- Outlier Threshold Control을 "Advanced Settings"로 이동
- 또는 기본적으로 숨기고 "Show Advanced" 버튼으로 표시
