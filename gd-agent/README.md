# GD Agent AI Dashboard

## 프로젝트 개요
- **목적**: 60개 게이트(Gate)의 제작 진행 상황을 실시간으로 시각화
- **회사**: CS Wind AM
- **배포 경로**: https://mes-r018-analysis.pages.dev/gd-agent/
- **데이터 소스**: Excel 파일 업로드 (`GD AI Agent sample 1.xlsx`)

---

## Excel 파일 구조

### 기본 정보
- **총 행 수**: 60개 (Gate G01 ~ G60)
- **총 컬럼 수**: 58개

### 컬럼 구조 (A열부터)

#### A~Q: 기본 정보 (17개)
| Excel | 컬럼명 | 설명 | 예시 |
|-------|--------|------|------|
| A | `mcn_no` | Gate 번호 | G01, G02, G60 |
| B | `serial_no2` | Section ID | VB087-U, VB094-U |
| C | `rev_flag` | Revision Flag | 0 |
| D | `wo_dtl_id` | Work Order ID | M42100000006355708 |
| E | `fo_desc` | Process 설명 | VT/MT Repair, CSO-C02 |
| F | `sts` | Status | S (Started), R (Reserved), H (Holding) |
| G | `working_rate` | Working Rate (%) | 30.0 |
| H | `start_dt` | 시작 일시 | 2026-02-19 09:24:00 |
| I | `end_dt` | 종료 일시 | NaN (진행 중) |
| J | `plan_start_dt` | 계획 시작 일시 | 2026-02-22 09:50:00 |
| K | `plan_end_dt` | 계획 종료 일시 | 2026-02-22 11:32:00 |
| L | `work_st` | Work Status 코드 | 102.0, 64.0, 45.0 |
| M | `worker_id` | 작업자 ID | 8639.0 |
| N | `worker_nm` | 작업자 이름 | BERUMEN, KRIS ELIAS |
| O | `skirt_qty` | Skirt 개수 | 11, 5 |
| P | `proj_color` | 프로젝트 색상 코드 | 14 |
| Q | `cur_time` | 데이터 추출 시각 | 2026-02-19 09:51:44 |

#### R~AK: Joint Status (20개 컬럼)
- `joint_status1` (R열) ~ `joint_status20` (AK열)
- 각 Joint의 용접 상태를 나타냄
- 빈 값: `NaN` 또는 `B` (Blank)

#### AL: Plant (1개)
- `plant`: 공장 코드 (예: 4210)

#### AM~A`: Skirt Status (20개 컬럼)
- `skirt_status1` (AM열) ~ `skirt_status20` (A`열)
- 각 Skirt의 제작 상태를 나타냄
- 빈 값: `B` (Blank)

---

## 상태 코드 정의

### F열 Status 코드 (sts)
Gate의 전체 진행 상태를 나타냅니다.

| 코드 | 의미 | 개수 | 설명 |
|------|------|------|------|
| **S** | Started | 25개 | 작업 시작됨, 진행 중 |
| **R** | Reserved | 33개 | 예약됨, 작업 대기 |
| **H** | **Holding** | 1개 | **보류 상태** (예: G06 - Flatness Inspection) |
| **NaN** | 정보 없음 | 1개 | Status 정보 없음 |

**Holding 예시 (Gate G06):**
- Section: VB088-U
- Process: Flatness Inspection
- Status: H (Holding)
- Working Rate: 50%
- Worker: COLLINS, TOMMY
- 작업은 시작되었으나 어떤 이유로 보류된 상태

---

### Joint Status 코드
Joint Status는 용접 진행 상태를 나타내며, 여러 코드가 조합되어 표시됩니다.

| 코드 | 의미 | 설명 |
|------|------|------|
| **FD** | Fit-up Done | 핏업 완료 |
| **ID** | Inside Done | 내부 용접 완료 |
| **OD** | Outside Done | 외부 용접 완료 |
| **W** | Waiting | 대기 중 (작업 필요) |

#### 조합 예시:
- `FDIDOD` = FD + ID + OD (핏업 + 내부 + 외부 모두 완료)
- `FDOW` = FD + OD + W (핏업 + 외부 완료, 대기 중)
- `FD` = 핏업만 완료
- `B` = Blank (해당 Joint 없음)

### Skirt Status 코드
Skirt Status는 Skirt 제작 진행 상태를 나타냅니다.

| 코드 | 의미 | 진행률 바 색상 |
|------|------|----------------|
| **SD** | (Skirt Done?) | 노란색 (#F7CD42) - 완료 |
| **SW\|FU** | (진행 중?) | 회색 (#5a6b78) |
| **SN\|BN** | (진행 중?) | 회색 (#5a6b78) |
| **SN\|LS** | (진행 중?) | 회색 (#5a6b78) |
| **B** | Blank | 표시 안 함 (빈 칸) |

**Note**: 파이프(`|`) 구분자는 여러 상태를 동시에 나타냄

---

## Mod 계산 규칙

Gate 번호로 Mod를 자동 계산합니다:

```javascript
const gateNumber = parseInt(mcn_no.replace('G', '')); // "G01" → 1
const mod = Math.ceil(gateNumber / 20);
```

| Gate 범위 | Mod |
|-----------|-----|
| G01 ~ G20 | Mod 1 |
| G21 ~ G40 | Mod 2 |
| G41 ~ G60 | Mod 3 |

---

## UI 구성 요소

### Gate Card 구조
```
┌─────────────────────────────────┐
│ Section: VB094-U   Gate: G02    │
│ Process: CSO-C02   Mod: 1       │
│                                 │
│ [진행률 바 - Skirt Status 기반]  │
│ [██][██][██][░░][░░][░░]...     │
│      ↑ 화살표 (Joint Status W)   │
│                                 │
│ Status: Normal / Waiting /      │
│         Delayed / QC-Delayed    │
└─────────────────────────────────┘
```

### 진행률 바 (Progress Bar) 로직

**중요**: Joint Status가 아닌 **Skirt Status 기반**으로 진행률 바를 그립니다!

```javascript
// 각 Skirt마다 고정 너비 박스 (30px)
Skirt Status별 색상:
- "SD" → 노란색 (#F7CD42) - 완료
- 기타 (SW|FU, SN|BN 등) → 회색 (#5a6b78) - 진행 중
- "B" (Blank) → 표시 안 함
```

**예시**:
```
Skirt Status: ["SD", "SD", "SD", "SW|FU", "SN|BN", "SN|BN", "B", "B"]
진행률 바:    [노랑][노랑][노랑][회색][회색][회색]
             30px  30px  30px  30px  30px  30px
```

### 화살표 표시 (Working Position)

**Joint Status 배열**을 검사하여 현재 작업 위치를 표시합니다:

```javascript
// 로직:
1. Joint Status 배열을 순회
2. 'W' (Waiting) 포함된 첫 번째 Joint 찾기
3. 찾으면: 해당 Joint 위치에 화살표 표시
4. 없으면: 첫 번째 Skirt에 화살표 표시 (대기 상태)
```

**검증 예시 (Gate 2)**:
- `joint_status1` = "FDOW" (**W 포함!**)
- → 화살표가 가장 왼쪽(첫 번째 Joint)에 표시됨 ✅

---

## 상태별 색상 코딩

Gate Card의 전체 상태를 색상으로 구분합니다:

| 상태 | 색상 | 의미 |
|------|------|------|
| **Normal** | 🟢 초록색 | 정상 진행 중 |
| **Waiting** | 🟡 노란색 | 대기 중 |
| **Delayed** | 🔴 빨간색 | 지연 발생 |
| **QC-Delayed** | 🟠 주황색 | QC 검사 지연 |

**상태 계산 로직**: (구체적인 조건 정의 필요)
- `sts` 컬럼 값?
- `work_st` 값?
- 계획 대비 실제 진행 상황?

---

## Mod 필터링

사용자가 특정 Mod만 선택하여 볼 수 있습니다:

```javascript
필터 옵션:
- All: 전체 60개 게이트 표시
- Mod 1: Gate 1~20만 표시
- Mod 2: Gate 21~40만 표시
- Mod 3: Gate 41~60만 표시
```

---

## 데이터 예시

### Gate 1 (G01)
```javascript
{
  mcn_no: "G01",
  serial_no2: "VB087-U",
  fo_desc: "VT/MT Repair",
  skirt_qty: 11,
  mod: 1, // Gate 1 → Mod 1
  joint_status: ["FDIDOD", "FDIDOD", "FDIDOD", "FDIDOD", "FDIDOD", "FDIDOD", "FDIDOD", "FDIDOD", "FDIDOD", "FDIDOD"],
  skirt_status: ["SD", "SD", "SD", "SD", "SD", "SD", "SD", "SD", "SD", "SD", "SD"]
}
```
- 모든 Joint: 완료 (FDIDOD)
- 모든 Skirt: 완료 (SD)
- 화살표: 'W' 없으므로 첫 번째 위치
- 진행률 바: 전체 노란색 (모두 완료)

### Gate 2 (G02)
```javascript
{
  mcn_no: "G02",
  serial_no2: "VB094-U",
  fo_desc: "CSO-C02",
  skirt_qty: 11,
  mod: 1, // Gate 2 → Mod 1
  joint_status: ["FDOW", "FD", "FD", null, null, null, null, null, null, null],
  skirt_status: ["SD", "SD", "SD", "SW|FU", "SN|LS", "SN|LS", "SN|LS", "SN|BN", "SN|BN", "SN|BN", "SN|BN"]
}
```
- Joint 1: FDOW (**W 포함!** → 화살표 여기 표시)
- Joint 2~3: FD (진행 중)
- Skirt 1~3: SD (완료 - 노란색)
- Skirt 4~11: 진행 중 (회색)

### Gate 60 (G60)
```javascript
{
  mcn_no: "G60",
  serial_no2: "VG024-T",
  fo_desc: "CSO-C08",
  skirt_qty: 11,
  mod: 3, // Gate 60 → Mod 3
  joint_status: ["FDOD", "FDIDOD", "FDIDOD", "FDOD", "FDIDOD", "FDOD", "FDOD", "FDOD", "FDOD", "FDOD"],
  skirt_status: ["SW|FU", "SW|FU", "SN|BN", "SN|BN", "SD", "SD", "SD", "SD", "SD", "SD", "SD"]
}
```

---

## 파일 구조

```
gd-agent/
├── README.md                           # 이 파일
├── index.html                          # 메인 HTML (개발 버전)
├── GD Agent AI Mockup_Rev23.html       # UI 목업 (참고용)
├── assets/
│   ├── gate_card_sample_1.png          # UI 샘플 이미지 1
│   ├── gate_card_sample_2.png          # UI 샘플 이미지 2
│   ├── gate_card_sample_3.png          # UI 샘플 이미지 3
│   ├── gate_card_status.png            # 상태 정의 이미지
│   ├── wip_readiness_table.png         # WIP Readiness 테이블
│   └── waiv-logo.png                   # WAIV 로고
├── css/
│   └── (스타일시트)
├── js/
│   └── (JavaScript 파일)
└── data/
    └── GD AI Agent sample 1.xlsx       # 샘플 Excel 파일
```

---

## 개발 이력

### 완료된 작업
- ✅ Excel 파일 구조 분석 완료
- ✅ 상태 코드 정의 (Joint Status: FD/ID/OD/W)
- ✅ Mod 계산 규칙 정의 (Gate 번호 기반)
- ✅ 진행률 바 로직 정의 (Skirt Status 기반)
- ✅ 화살표 표시 로직 정의 (Joint Status 'W' 검사)

### 진행 중
- 🔄 Excel 파싱 JavaScript 구현
- 🔄 60개 Gate Card 동적 렌더링
- 🔄 Mod 필터링 UI 구현
- 🔄 상태별 색상 코딩 구현

### 대기 중
- ⏳ 상태(Normal/Waiting/Delayed/QC-Delayed) 계산 로직 정의 필요
- ⏳ Skirt Status 코드 상세 의미 확인 필요 (SD, SW|FU, SN|BN, SN|LS)
- ⏳ WIP Readiness 데이터 구조 및 표시 로직
- ⏳ 실시간 데이터 업데이트 (향후)
- ⏳ AI 분석 기능 추가 (향후)

---

## 알려진 이슈

### Gate 11 데이터 문제 (이전 개발 시)
- `sts=nan`, `fo_desc=nan` 오류
- 데이터 정합성 확인 필요

### Skirt Status 코드 의미 불명확
- `SD` = 완료 (확인됨)
- `SW|FU`, `SN|BN`, `SN|LS` = ? (의미 확인 필요)

---

## 배포 정보

- **Main URL**: https://mes-r018-analysis.pages.dev/gd-agent/
- **Git Repository**: https://github.com/twokomi/MES_R018_Analysis
- **Project Path**: `/home/user/webapp/gd-agent/`

---

## 참고 사항

### Performance Report와의 관계
- GD Agent Dashboard는 MES Performance Report와 동일한 프로젝트 내에 존재
- Performance Report: `/` (루트)
- GD Agent Dashboard: `/gd-agent/`
- 독립적인 기능이지만 동일 Git 저장소 관리

### 대화 컨텍스트 보존
이 README는 대화 압축으로 인한 정보 손실을 방지하기 위해 작성되었습니다.
모든 중요한 정보는 이 파일에 기록하여 언제든지 참조할 수 있도록 합니다.

---

**Last Updated**: 2026-02-20
**Version**: 0.1.0 (개발 초기)
