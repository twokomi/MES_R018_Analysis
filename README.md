# MES R018 Analysis - Individual Performance Report 📊

개인별 생산성 분석 및 리포트 웹 애플리케이션 with Cloudflare D1 Database

## 🎯 프로젝트 개요

MES Individual Performance Report는 제조 실행 시스템(MES)의 작업자별 생산 데이터를 분석하고, 직관적인 대시보드로 성과를 시각화하는 웹 애플리케이션입니다.

### 주요 특징

- ✅ **엑셀 파일 업로드**: Raw 데이터 시트에서 자동으로 데이터 추출 및 처리
- 💾 **데이터베이스 저장**: Cloudflare D1에 영구 저장 및 불러오기
- 📊 **두 가지 성과 지표**: Time Utilization Rate & Work Efficiency Rate
- 🔄 **실시간 지표 토글**: 시계 아이콘 ⇄ 번개 아이콘으로 전환
- 📈 **4개 KPI 카드**: 의미 있는 메트릭으로 재설계
- 🎯 **성과 밴드**: Excellent/Good/Normal/Poor/Critical (5단계)
- 👤 **작업자 상세 모달**: 차트, 이력, 지표별 분기
- 🔍 **고급 필터링**: Shift, 날짜, 공정, 작업자 다중 선택
- 💡 **컨텍스트 안내 (NEW v3.4.0)**: Working Shift 필터별 툴팁/경고로 데이터 해석 가이드 제공
- ⏱️ **로딩 인디케이터**: 필터 적용/초기화 시 부드러운 애니메이션
- 🌍 **Full English Interface**: 전체 영어 인터페이스

## 🌐 배포 URL

### 프로덕션
- **메인 URL**: https://mes-r018-analysis.pages.dev
- **최신 배포**: v3.5.1 (2026-02-27)
- **최신 수정**: Worker Detail 모달 데이터 동기화 버그 수정

### GitHub 저장소
- **저장소**: https://github.com/twokomi/MES_R018_Analysis

## 📊 KPI 카드 구조

### ⏱️ Time Utilization Mode
```
┌─────────────┬──────────────────┬──────────────────┬────────────────────┐
│ Total       │ Total Shift Time │ Total Work Time  │ Avg Utilization    │
│ Workers     │ (Workers×660min) │ (Actual Work)    │ Rate               │
└─────────────┴──────────────────┴──────────────────┴────────────────────┘
```
- **Average Utilization Rate** = (Total Work Time ÷ Total Shift Time) × 100

### ⚡ Work Efficiency Mode
```
┌─────────────┬──────────────────┬──────────────────┬────────────────────┐
│ Total       │ Total Adjusted   │ Total Actual     │ Avg Efficiency     │
│ Workers     │ S/T (Assigned)   │ Time             │ Rate               │
└─────────────┴──────────────────┴──────────────────┴────────────────────┘
                    [Outlier Threshold: 1000% ▼ Apply]
```
- **Average Efficiency Rate** = (Total Adjusted S/T ÷ Total Actual Time) × 100
- **Outlier Threshold**: Efficiency 모드에서만 표시 및 적용

## 🚀 API 엔드포인트

### POST /api/upload
엑셀 데이터를 데이터베이스에 저장

**Response:**
```json
{
  "success": true,
  "uploadId": 1,
  "stats": {
    "totalRecords": 150,
    "uniqueWorkers": 25
  }
}
```

### GET /api/uploads
최근 업로드 목록 조회 (최대 50개)

### GET /api/uploads/:id
특정 업로드 데이터 조회

## 🗄️ 데이터베이스 구조

### Cloudflare D1 데이터베이스

**excel_uploads** - 업로드 기록
- id, filename, upload_date, file_size
- total_records, unique_workers, date_range

**raw_data** - 원본 작업 데이터
- worker_name, fo_desc, start_datetime, end_datetime
- worker_act, working_day, working_shift
- worker_st, worker_rate_pct (v3.1.0+)

**process_mapping** - 공정 매핑
- fd_desc, fo_desc, fo_desc_2, fo_desc_3, seq

**shift_calendar** - 시프트 캘린더
- date, day_shift, night_shift

## 🛠️ 기술 스택

| 구분 | 기술 |
|------|------|
| **Frontend** | HTML5, CSS3, JavaScript (ES6+) |
| **Backend** | Hono Framework (TypeScript) |
| **Database** | Cloudflare D1 (SQLite) |
| **Deployment** | Cloudflare Pages |
| **UI Framework** | Tailwind CSS (CDN) |
| **Charts** | Chart.js |
| **Excel Parsing** | SheetJS (xlsx.js) |

## 💻 로컬 개발

### 설치 및 실행

```bash
# 저장소 클론
git clone https://github.com/twokomi/MES_R018_Analysis.git
cd MES_R018_Analysis

# 의존성 설치
npm install

# D1 데이터베이스 마이그레이션 (로컬)
npm run db:migrate:local

# 개발 서버 시작
npm run build
npm run dev:sandbox
```

### 프로덕션 배포

```bash
# D1 마이그레이션 (프로덕션)
npm run db:migrate:prod

# 빌드 및 배포
npm run deploy
```

## 📖 사용 가이드

### 1️⃣ 엑셀 파일 업로드 및 저장
1. "데이터 업로드" 탭 클릭
2. Excel 파일 드래그 앤 드롭 또는 선택
3. 자동으로 데이터 처리 및 리포트 표시
4. "**Save to Database**" 버튼 클릭

### 2️⃣ 저장된 데이터 불러오기
1. **Saved Uploads** 섹션에서 파일 카드 클릭
2. 자동으로 Report 탭 이동

### 3️⃣ 두 가지 지표 활용
- **⏱️ Time Utilization**: 시간 활용도 (파란색 테마)
- **⚡ Work Efficiency**: 작업 효율 (보라색 테마)
- 우측 상단 토글 버튼으로 전환

### 4️⃣ 필터 적용
- Shift(A/B/C), 날짜, 공정, 작업자 선택
- "**Apply Filters**" 버튼 클릭 (로딩 애니메이션 표시)
- "**Reset**" 버튼으로 필터 초기화

## 🎉 업데이트 내역

### v3.2.0 (2026-02-21) 🎨 **KPI Redesign & UX Enhancement**
- ✅ **KPI 카드 재설계**:
  - 4개 카드 구조 복원 (의미 있는 메트릭으로 개선)
  - **Utilization**: Total Workers, Total Shift Time, Total Work Time, Avg Utilization Rate
  - **Efficiency**: Total Workers, Total Adjusted S/T, Total Actual Time, Avg Efficiency Rate
  - Average Rate가 Card 2와 Card 3 값으로 정확하게 계산됨
- ✅ **로딩 인디케이터 추가**:
  - Apply Filters, Reset, Outlier Threshold 적용 시 우측 상단 로딩 표시
  - 부드러운 fade-out 애니메이션 (300ms)
  - WAIV 로고 + 텍스트 + 스피너
- ✅ **Glossary 개선**: "Assigned(m)" → "Adjusted S/T(m)" 용어 통일
- ✅ **버그 수정**: Worker S/T 집계 누락 문제 해결 (aggregateByWorkerOnly)
- ✅ **동적 테마**: Utilization(파란색), Efficiency(보라색) 자동 전환

### v3.1.0 (2026-02-21) 🔧 **Critical Database Fix**
- ✅ DB 스키마 업데이트: worker_st, worker_rate_pct 컬럼 추가
- ✅ 모달 Outlier 필터링 수정
- ✅ 디버그 로깅 강화

### v3.0.0 (2026-02-20) 🎊 **Major Update**
- ✅ 두 가지 성과 지표 시스템 도입
- ✅ 지표 토글 기능
- ✅ 성과 밴드 재설계
- ✅ Rework 자동 제외

### v2.6.0 (2026-02-18)
- ✅ Week 필터 추가
- ✅ Average Work Rate 계산 수정

### v2.5.0 (2026-02-18)
- ✅ 성과 밴드 정렬 기능
- ✅ 작업자 상세 모달

---

**제작자**: twokomi  
**마지막 업데이트**: 2026-02-21 (v3.2.0)  
**라이선스**: MIT
