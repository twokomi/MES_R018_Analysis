# MES R018 Individual Performance Report
## 기술 명세서 및 인수인계 문서

**작성일**: 2026-03-10  
**작성자**: 박준배 프로 (CS WIND AIX Team)  
**버전**: v4.3.3 (Beta)

---

## 📋 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [현재 베타 버전 기술 스택](#2-현재-베타-버전-기술-스택)
3. [주요 기능](#3-주요-기능)
4. [데이터 구조](#4-데이터-구조)
5. [필요 개발 범위](#5-필요-개발-범위)
6. [코드 구조](#6-코드-구조)
7. [배포 환경](#7-배포-환경)
8. [제약사항](#8-제약사항)
9. [업체 제안 요청 사항](#9-업체-제안-요청-사항)

---

## 1. 프로젝트 개요

### 1.1 목적
MES R018 (POP Result) 데이터를 활용하여 작업자별 생산성을 실시간으로 분석하고 시각화하는 웹 애플리케이션

### 1.2 현재 상태
- **베타 버전 완성도**: 90%
- **배포 URL**: https://mes-r018-analysis.pages.dev
- **GitHub**: https://github.com/twokomi/MES_R018_Analysis
- **현재 방식**: Excel 파일 수동 업로드
- **시범 운영**: Shop Floor 일부 팀 적용 중

### 1.3 개발 목표
- **완료 일정**: 2026년 4월 15일 (5주)
- **핵심 요구**: MES R018 데이터 자동 추출 및 실시간 연동
- **유지 기능**: 현재 구현된 모든 기능 유지
- **추가 개발**: Shop Floor 피드백 반영 (PDF Report, MOD별 Report 등)

---

## 2. 현재 베타 버전 기술 스택

### 2.1 Frontend

#### 핵심 기술
```
- HTML5 (public/index.html: 2,700+ 줄)
- Vanilla JavaScript ES6+ (public/js/app.js: 8,000+ 줄)
- Tailwind CSS 3.4 (CDN 방식)
```

#### 라이브러리
```
- Chart.js: 차트 시각화 (8개 차트)
- SheetJS (xlsx.js v0.18.5): Excel 파싱
- Font Awesome 6.4.0: 아이콘
```

#### 데이터 처리
```
- 100% 브라우저에서 처리 (서버 부하 없음)
- 처리 성능: 48,065건 레코드 처리 가능 (3초 이내)
- 메모리 사용: 약 200MB (브라우저)
```

### 2.2 Backend (현재 최소 구현)

```
- 언어: TypeScript
- 프레임워크: Hono v4.0
- 파일: src/index.tsx (500줄)
- 역할: 정적 파일 서빙만 (HTML, JS, CSS)
- MES 연동: 없음 ❌
```

**주의**: 현재 백엔드는 거의 껍데기이며, MES 연동 기능 전무

### 2.3 Database (현재 비활성화)

```
- Cloudflare D1 (SQLite 기반)
- 상태: 비활성화됨
- 이유: Cloudflare Workers 실행 시간 제한 (10ms)
```

### 2.4 배포 환경

```
- Cloudflare Pages (정적 호스팅)
- HTTPS 자동 제공
- 글로벌 CDN
- 무료 (현재)
```

---

## 3. 주요 기능

### 3.1 Dashboard 탭

#### A. KPI Cards (4개)
```
- Total Workers: 총 작업자 수
- Total Shift Time: 총 교대 시간 (시간)
- Total Work Time / Adjusted S/T: 작업 시간 / 표준 시간
- Avg Utilization / Efficiency: 평균 가동률 / 효율
```

#### B. AI Insights & Warnings (6가지 자동 경고)
```
1. Low Utilization (평균 가동률 < 50%)
2. Low Efficiency (평균 효율 < 50%)
3. Efficiency Gap (높은 가동률 + 낮은 효율)
4. Process Concentration (특정 공정 집중 > 60%)
5. Low Sample Size (레코드 < 100개)
6. Date Gaps (날짜 공백 존재)
```

#### C. KPI Trend Overview
```
- Daily/Weekly 토글
- 7일/14일/30일 트렌드 차트
- 데이터 포인트 클릭 → 상세 모달
```

#### D. Shift Performance Comparison
```
- 3개 그룹: BT/WT/IM
- 각 그룹별 Shift A/B/C/D 비교
- 컬럼: Workers, Shift Time, Work Time, Utilization, Standard Time, Efficiency
- 기간 선택: 7d/14d/30d/All
- 색상 코드: ≥50% (파란색/보라색), <50% (주황색)
```

### 3.2 Report 탭

#### A. Performance Bands (4개 등급)
```
Utilization 기준:
- Excellent: ≥80%
- Normal: 50-79%
- Poor: 30-49%
- Critical: <30%

Efficiency 기준:
- Excellent: ≥100%
- Normal: 80-99%
- Poor: 60-79%
- Critical: <60%
```

#### B. Process Performance Bar Chart
```
- 상위 30개 공정 표시
- 가동률/효율 바 차트
- 공정별 상세 정보 표시
```

#### C. Worker Detail Modal
```
- 작업자 클릭 시 모달 표시
- KPI Summary (교대 수, 시간, 성과율)
- Daily Trends (라인 차트)
- Hourly Distribution (바 차트)
- Detailed Records Table (정렬 가능)
```

### 3.3 Filters (고급 필터링)

```
- Shift: A/B/C/D/All
- Date: 일별/주별 선택
- Working Shift: Day/Night/All
- Category: BT Process, WT, IM, DS 등
- Process: FO Desc 3 단계
- Worker: 다중 선택 (검색 가능)
```

### 3.4 Excel Export (5개 시트)

```
1. KPI Summary: 전체 리포트 요약
2. Worker Performance: 작업자별 랭킹
3. Shift Comparison: 교대별 비교
4. Performance Bands: 등급별 작업자 목록
5. Raw Data: 개별 레코드 (최대 10,000행)
```

### 3.5 Metric Toggle (두 가지 지표 전환)

```
⏱️ Time Utilization (시간 활용도)
- (Total Work Time ÷ Total Shift Time) × 100
- 목적: 할당 시간 활용도 측정

⚡ Work Efficiency (작업 효율)
- (Total Adjusted S/T ÷ Total Shift Time) × 100
- 목적: 작업 속도 및 숙련도 측정
- Outlier Filter: 1000% 이상 제외 가능
```

---

## 4. 데이터 구조

### 4.1 현재 Excel 파일 구조

#### Sheet 1: Raw (작업 데이터)

```
필수 컬럼 (20개):
- Worker Name: 작업자명
- FO Desc: 공정명 (Level 1)
- FD Desc: 공정 상세
- Start DateTime: 작업 시작 시간 (YYYY-MM-DD HH:MM:SS)
- End DateTime: 작업 종료 시간
- Worker Act: 실제 작업 시간 (분)
- Result Cnt: 작업 수량
- Working Day: 작업 날짜 (YYYY-MM-DD)
- Actual Shift: 교대 (A/B/C/D)
- Work Rate: 작업률 (%)
- Worker ST: 표준 시간 (분)
- Worker Rate Pct: 작업자 효율 (%)
- Rework: 재작업 여부 (Y/N)
- Section ID: 섹션 ID (D열)
- WO#: Work Order 번호 (선택)
... 기타 컬럼

샘플 데이터: 48,065 rows
```

#### Sheet 2: Mapping (공정 매핑)

```
컬럼:
- FD Desc: 공정 상세명
- FO Desc: 공정명 (Level 1)
- FO Desc 2: 카테고리 (Level 2)
  예: BT Process, BT Complete, WT, IM QC 등
- FO Desc 3: 세부 공정 (Level 3)
  예: Bevel, Cut, Blasting, Paint 등
- Seq: 순서

샘플 데이터: 93 rows (하드코딩 매핑 규칙)
```

#### Sheet 3: Shift Calendar (교대 달력)

```
컬럼:
- Date: 날짜 (YYYY-MM-DD)
- Day Shift: 주간 교대 (A/B/C/D)
- Night Shift: 야간 교대 (A/B/C/D)

샘플 데이터: 1개월치 (30 rows)
```

### 4.2 MES R018 테이블 매핑 (추정)

```
MES R018 테이블 → Excel 포맷 변환 필요

추정 테이블명: [업체 확인 필요]
데이터베이스: Oracle / MSSQL [업체 확인 필요]

필요 컬럼 매핑:
MES 컬럼명              → Excel 컬럼명
--------------------------------------------
WORKER_NAME            → Worker Name
FO_DESC                → FO Desc
FD_DESC                → FD Desc
START_DATETIME         → Start DateTime
END_DATETIME           → End DateTime
WORKER_ACT             → Worker Act
RESULT_CNT             → Result Cnt
WORKING_DAY            → Working Day
ACTUAL_SHIFT           → Actual Shift
WORK_RATE              → Work Rate
WORKER_ST              → Worker ST
WORKER_RATE_PCT        → Worker Rate Pct
... (업체가 정확한 컬럼명 확인 필요)
```

---

## 5. 필요 개발 범위

### 5.1 핵심 개발 (필수)

#### A. Backend API 서버 구축

**목적**: MES R018 데이터를 REST API로 제공

**필요 API (최소 1개, 권장 3개)**:

```javascript
1. GET /api/data/latest (필수)
   - 최근 30일 데이터 반환
   - Response: JSON (Excel 포맷과 동일 구조)
   
2. GET /api/data/range?start=YYYY-MM-DD&end=YYYY-MM-DD (선택)
   - 특정 기간 데이터 반환
   
3. POST /api/refresh (선택)
   - 수동 갱신 요청
   - MES에서 최신 데이터 재추출
```

**Response 포맷 예시**:

```json
{
  "success": true,
  "data": {
    "dateRange": {
      "start": "2026-02-10",
      "end": "2026-03-10"
    },
    "rawData": [
      {
        "workerName": "WYANT",
        "foDesc": "Bevel",
        "fdDesc": "Bevel",
        "startDateTime": "2026-03-10 08:00:00",
        "endDateTime": "2026-03-10 10:30:00",
        "workerAct": 150,
        "resultCnt": 5,
        "workingDay": "2026-03-10",
        "actualShift": "A",
        "workRate": 95.5,
        "workerST": 140,
        "workerRatePct": 107.1
      }
      // ... 48,065 rows
    ],
    "processMapping": [
      {
        "fdDesc": "Bevel",
        "foDesc": "Bevel",
        "foDesc2": "BT Process",
        "foDesc3": "Bevel",
        "seq": 3
      }
      // ... 93 rows
    ],
    "shiftCalendar": [
      {
        "date": "2026-03-10",
        "dayShift": "A",
        "nightShift": "C"
      }
      // ... 30 rows
    ]
  }
}
```

**기술 스택 제안 요청**:
- Backend 언어: Node.js / Python / Java / .NET 중 업체 선택
- Database: PostgreSQL / MySQL / 없음 (업체 제안)
- 배포 환경: 사내 서버 (업체 제안)

#### B. 프론트엔드 연동 수정

**수정 범위 (최소)**:

```javascript
// 현재: Excel 업로드 방식
function loadExcelFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const data = parseExcel(e.target.result);
    AppState.rawData = data.rawData;
    processData();
    renderDashboard();
  };
  reader.readAsArrayBuffer(file);
}

// 변경: API 연동 방식
async function loadDataFromAPI() {
  showLoadingIndicator();
  
  const response = await fetch('/api/data/latest');
  const { data } = await response.json();
  
  AppState.rawData = data.rawData;
  AppState.processMapping = data.processMapping;
  AppState.shiftCalendar = data.shiftCalendar;
  
  processData(); // 기존 함수 재활용
  renderDashboard(); // 기존 함수 재활용
  
  hideLoadingIndicator();
}

// UI 수정
// Excel Upload 제거 → "Load Data" 버튼으로 교체
```

**예상 수정 시간**: 2-3일 (현재 코드 80% 재활용)

#### C. 사내 서버 배포

**배포 환경 옵션**:
```
Option 1: 사내 Linux 서버
  - Backend: PM2 / Docker
  - Frontend: Nginx
  - 장점: 완전 통제, 보안 우수
  
Option 2: 사내 Windows 서버
  - Backend: IIS / Windows Service
  - Frontend: IIS
  - 장점: Windows 환경 통합
  
Option 3: Hybrid (업체 제안)
  - Frontend: Cloudflare Pages (현재 유지)
  - Backend: 사내 서버
  - 장점: 프론트 배포 간편, 백엔드만 사내
```

### 5.2 추가 개발 (Shop Floor 피드백 반영)

#### A. PDF Report 출력 (우선순위: 높음)

**요구사항**:
```
- 작업자별 Performance Report PDF 생성
- 내용: 
  - KPI Summary (교대 수, 가동률, 효율)
  - Performance Band 등급
  - 7일/14일/30일 트렌드 차트
  - 상세 작업 내역 테이블
- 출력 버튼: Worker Detail Modal에 추가
```

**기술 옵션**:
```
- jsPDF (JavaScript 라이브러리)
- Puppeteer (서버 사이드 PDF 생성)
- 업체 제안
```

#### B. MOD별 Report 추가 (우선순위: 중간)

**요구사항**:
```
- MOD (Module) 단위 리포트 추가
- 필터에 MOD 선택 추가
- Dashboard에 MOD별 KPI 표시
- MOD 데이터 소스: [확인 필요]
```

#### C. 작업자 ↔ Shift 매핑 개선 (우선순위: 낮음)

**현재 방식**:
```
- 작업일자(Working Day)로 Shift 구분
- Shift Calendar 참조
```

**요청 개선**:
```
- 작업자별 고정 Shift 매핑
- 예: "WYANT" → Shift A (고정)
- 데이터 소스: [확인 필요]
```

---

## 6. 코드 구조

### 6.1 디렉토리 구조

```
webapp/
├── public/                      # Frontend (배포용)
│   ├── index.html              # 메인 HTML (2,700+ 줄)
│   ├── js/
│   │   └── app.js              # 메인 JavaScript (8,000+ 줄) ⭐ 핵심
│   ├── waiv-logo.png           # 로고
│   └── favicon.svg             # 파비콘
├── src/                         # Backend (TypeScript)
│   └── index.tsx               # Hono 서버 (500줄)
├── migrations/                  # Database 마이그레이션 (현재 비활성화)
│   ├── 0001_initial_schema.sql
│   └── 0002_add_columns.sql
├── dist/                        # 빌드 출력 (배포용)
│   ├── _worker.js              # 컴파일된 백엔드
│   └── _routes.json            # 라우팅 설정
├── package.json                # 의존성 관리
├── vite.config.ts              # Vite 빌드 설정
├── wrangler.jsonc              # Cloudflare 설정
├── ecosystem.config.cjs        # PM2 설정
├── README.md                   # 프로젝트 문서
└── .gitignore                  # Git 제외 파일
```

### 6.2 주요 파일 설명

#### A. public/js/app.js (8,000+ 줄)

**구조**:
```javascript
// Line 1-200: 상수 & 전역 변수
const CATEGORY_ORDER = {...};
const DEFAULT_PROCESS_MAPPING = {...};
const AppState = {...};

// Line 200-1000: 데이터 처리 함수
function parseExcelFile(data) {...}
function detectOverlaps(records) {...}
function aggregateData(records) {...}
function calculatePerformanceBands(workers) {...}

// Line 1000-3000: 차트 & UI 렌더링
function renderDashboard() {...}
function createKPICards() {...}
function renderPerformanceBands() {...}
function createCharts() {...}

// Line 3000-5000: 필터링 & 이벤트 핸들러
function applyFilters() {...}
function refreshReport() {...}

// Line 5000-7500: Worker Detail Modal
function showWorkerDetailModal(worker) {...}
function createWorkerCharts(worker) {...}

// Line 7639-8012: Excel Export ⭐ 중요
function exportToExcel() {...}
function createKPISummarySheet() {...}
function createWorkerPerformanceSheet() {...}
function createShiftComparisonSheet() {...}
function createPerformanceBandsSheet() {...}
function createRawDataSheet() {...}

// Line 8012+: 초기화 & 이벤트 리스너
window.addEventListener('DOMContentLoaded', () => {...});
```

**핵심 함수 (API 연동 시 수정 필요)**:
```javascript
// 현재 Excel 파일 로드
function loadExcelFile(file) {...}  // 제거

// 새로 추가할 함수
async function loadDataFromAPI() {...}  // 추가
```

**재활용 가능한 함수 (수정 불필요)**:
```javascript
// 이 함수들은 그대로 사용 가능
aggregateData()
renderDashboard()
renderPerformanceBands()
exportToExcel()
applyFilters()
... 대부분의 함수
```

#### B. src/index.tsx (500줄)

**역할**: 정적 파일 서빙만 (현재)

```typescript
import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-workers'

const app = new Hono()

// 정적 파일 서빙
app.use('/static/*', serveStatic({ root: './public' }))
app.get('/', serveStatic({ path: './public/index.html' }))

// 기존 API (현재 비활성화)
// app.post('/api/upload', ...) // 제거 예정

export default app
```

**참고**: 이 파일은 새 백엔드 서버로 대체될 예정

---

## 7. 배포 환경

### 7.1 현재 배포 (Cloudflare Pages)

```
배포 URL: https://mes-r018-analysis.pages.dev
GitHub 연동: 자동 배포 (git push → 자동 빌드)
HTTPS: 자동 제공
CDN: 글로벌
비용: 무료
```

**제약사항**:
- MES 연동 불가 (사내 네트워크 접근 불가)
- Cloudflare Workers CPU 제한 (10ms)
- 대용량 데이터 처리 제한

### 7.2 향후 배포 (사내 서버)

**요청사항**:
```
□ 사내 직원만 접근 가능
□ HTTPS 제공 (선택)
□ 동시 접속 50명 이상 지원
□ 백업 & 모니터링
```

**업체 제안 요청**:
- 서버 사양 권장
- 운영체제 (Linux / Windows)
- 웹 서버 (Nginx / IIS / Apache)
- 모니터링 방안

---

## 8. 제약사항

### 8.1 일정

```
시작일: 2026년 3월 10일 (오늘)
완료일: 2026년 4월 15일
기간: 36일 (5주)
```

**마일스톤 제안**:
```
Week 1 (3/10-3/16): Kick-off, POC
Week 2 (3/17-3/23): Backend 개발
Week 3 (3/24-3/30): Frontend 연동
Week 4 (3/31-4/6):  테스트 & 디버깅
Week 5 (4/7-4/15):  배포 & 인수인계
```

### 8.2 예산

```
[협의 필요]

참고:
- 베타 버전 90% 완성 (코드 재활용 가능)
- MES 접근 권한 이미 보유 (업체)
- 프론트엔드 수정 최소화 (2-3일)
```

### 8.3 기술 제약

```
✓ 현재 JavaScript 코드 최대한 재활용
✓ 기존 기능 모두 유지
✓ UI/UX 대폭 변경 불가
✓ 브라우저 호환성: Chrome, Edge (IE 지원 불필요)
```

---

## 9. 업체 제안 요청 사항

### 9.1 기술 아키텍처 제안

```
□ Backend 기술 스택
  - 언어/프레임워크 (Node.js/Python/Java/.NET)
  - 이유 및 장단점

□ Database
  - 필요 여부 (Yes/No)
  - 종류 (PostgreSQL/MySQL/MSSQL/Oracle/없음)
  - 이유

□ 배포 환경
  - 사내 서버 사양 권장
  - 운영체제 (Linux/Windows)
  - 웹 서버 (Nginx/IIS/Apache)

□ 보안/인증
  - 로그인 방식 (SSO/ID-PW/없음)
  - HTTPS 제공 여부
  - 접근 권한 관리 방안

□ API 설계
  - REST API 엔드포인트 목록
  - Request/Response 포맷
  - 에러 핸들링

□ 데이터 동기화
  - MES → Backend 데이터 추출 주기 (실시간/5분/1시간/1일)
  - 증분 업데이트 or 전체 동기화
  - 데이터 캐싱 전략
```

### 9.2 개발 일정 제안

```
□ 단계별 일정 (주차별)
  - Week 1: [업체 작성]
  - Week 2: [업체 작성]
  - Week 3: [업체 작성]
  - Week 4: [업체 작성]
  - Week 5: [업체 작성]

□ 마일스톤 정의
  - M1: POC 완료 (날짜)
  - M2: Backend API 완료 (날짜)
  - M3: Frontend 연동 완료 (날짜)
  - M4: 테스트 완료 (날짜)
  - M5: 배포 완료 (날짜)

□ 리스크 요소
  - 일정 지연 가능성
  - 대응 방안
```

### 9.3 비용 견적

```
□ 개발 비용
  - Backend 개발: [금액]
  - Frontend 수정: [금액]
  - 테스트 & 디버깅: [금액]
  - PM/기획: [금액]
  - 합계: [금액]

□ 인프라 비용 (있을 시)
  - 서버 구매/임대: [금액]
  - 라이선스: [금액]
  - 기타: [금액]

□ 유지보수 비용 (연간)
  - 기술 지원: [금액]
  - 버그 수정: [금액]
  - 기능 추가: [금액]
  - 합계: [금액]
```

### 9.4 투입 인력

```
□ Backend 개발자
  - 인원: [명]
  - 투입 기간: [주]
  - 경력: [년차]

□ Frontend 개발자
  - 인원: [명]
  - 투입 기간: [주]
  - 경력: [년차]

□ PM/기획
  - 인원: [명]
  - 투입 기간: [주]

□ QA/테스터
  - 인원: [명]
  - 투입 기간: [주]
```

### 9.5 기타 제안

```
□ Shop Floor 피드백 반영 (PDF, MOD별 Report 등)
  - 개발 가능 여부
  - 추가 기간
  - 추가 비용

□ 향후 확장 가능성
  - 다른 MES 테이블 연동
  - 모바일 앱 개발
  - 실시간 알림 기능
  - 권한별 대시보드

□ 유지보수 방안
  - SLA (Service Level Agreement)
  - 장애 대응 시간
  - 정기 점검 계획
```

---

## 10. 참고 자료

### 10.1 베타 버전 접속 정보

```
웹사이트: https://mes-r018-analysis.pages.dev
GitHub: https://github.com/twokomi/MES_R018_Analysis
README.md: 프로젝트 전체 문서 포함
```

### 10.2 샘플 파일

```
- 샘플 Excel 파일 (R018 데이터 구조)
- 스크린샷 (Dashboard, Report 화면)
```

### 10.3 기술 문서

```
- API 설계 예시
- 데이터베이스 스키마 (현재 D1)
- Process Mapping 규칙 (93개)
```

---

## 11. 연락처

**담당자**: 박준배 프로  
**소속**: CS WIND | AIX Team  
**Tel**: [전화번호]  
**Email**: jbpark@cswind.com

---

**문서 버전**: v1.0  
**최종 수정**: 2026-03-10
