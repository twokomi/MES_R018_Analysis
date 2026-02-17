# MES R018 Analysis - Individual Performance Report 📊

실시간 개인별 생산성 분석 및 리포트 웹 애플리케이션 with Cloudflare D1 Database

## 🎯 프로젝트 개요

MES Individual Performance Report는 제조 실행 시스템(MES)의 작업자별 생산 데이터를 분석하고, 직관적인 대시보드로 실시간 성과를 시각화하는 웹 애플리케이션입니다.

**✨ 새로운 기능**: 엑셀 업로드 데이터를 Cloudflare D1 데이터베이스에 자동 저장!

### 주요 특징

- ✅ **엑셀 파일 업로드**: Raw 데이터 시트에서 자동으로 데이터 추출 및 처리
- 💾 **클라우드 데이터 저장**: 업로드된 데이터를 Cloudflare D1에 자동 저장
- 🔄 **자동 데이터 처리**: 작업일, 교대(Shift), 작업률 자동 계산
- 📊 **다양한 리포트**: KPI 타일, 성과 밴드, 차트, 날짜별 피벗 리포트
- 🎨 **모던 UI 디자인**: 그라데이션, 애니메이션, 반응형 카드 디자인
- 🌍 **Full English Interface**: 전체 영어 인터페이스
- 🔍 **고급 필터링**: Shift(A/B/C), 날짜(다중 선택), 체크박스 필터
- 📅 **3개월 Shift Calendar**: 2026년 2월~4월 일정 관리

## 📊 현재 완료된 기능

### ✅ 데이터 관리
- [x] 엑셀 파일 업로드 및 파싱
- [x] Cloudflare D1 데이터베이스 통합
- [x] 자동 데이터 저장 (Raw Data, Process Mapping, Shift Calendar)
- [x] JSON 내보내기/불러오기

### ✅ 리포트 기능
- [x] KPI 타일 (총 작업자, 유효 작업, 작업 시간, 평균 작업률)
- [x] 성과 밴드 (우수/정상/저조/위험)
- [x] 공정별 평균 작업률 차트
- [x] 성과 등급 분포 도넛 차트
- [x] 날짜별 피벗 리포트
- [x] 상세 데이터 뷰

### ✅ 필터링
- [x] Shift 필터 (A/B/C)
- [x] 작업 일자 다중 선택
- [x] 교대 필터 (Day/Night)
- [x] 공정 체크박스 필터
- [x] 작업자 체크박스 필터

### ✅ 공정 관리
- [x] 공정 매핑 관리
- [x] 정렬 가능한 매핑 테이블
- [x] 동적 매핑 추가/삭제

## 🚀 API 엔드포인트

### POST /api/upload
엑셀 데이터를 데이터베이스에 저장

**Request Body:**
```json
{
  "filename": "data.xlsx",
  "fileSize": 1024000,
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
  "uploadId": 1,
  "message": "Data saved successfully",
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

## 🌐 배포 URL

### 프로덕션
- **메인 URL**: https://mes-r018-analysis.pages.dev
- **최신 배포**: https://62c6955b.mes-r018-analysis.pages.dev

### 테스트 서버 (샌드박스)
- **개발 URL**: https://3000-i6mqjfqm4prwz2zcvnapn-583b4d74.sandbox.novita.ai
- *테스트 서버는 1시간 동안 활성화됩니다*

### GitHub 저장소
- **저장소**: https://github.com/twokomi/MES_R018_Analysis

## 🗄️ 데이터베이스 구조

### Cloudflare D1 데이터베이스

**excel_uploads** - 업로드 기록
- id, filename, upload_date, file_size
- total_records, unique_workers
- date_range_start, date_range_end

**raw_data** - 원본 작업 데이터
- id, upload_id, worker_name, fo_desc, fd_desc
- start_datetime, end_datetime, worker_act
- result_cnt, working_day, working_shift
- actual_shift, work_rate

**process_mapping** - 공정 매핑
- id, upload_id, fd_desc, fo_desc
- fo_desc_2, fo_desc_3, seq

**shift_calendar** - 시프트 캘린더
- id, upload_id, date
- day_shift, night_shift

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

## 📁 프로젝트 구조

```
mes-r018-analysis/
├── src/
│   └── index.tsx           # Hono 백엔드 (API + 정적 파일 서빙)
├── public/
│   ├── index.html          # 메인 HTML
│   ├── js/
│   │   └── app.js          # 프론트엔드 로직
│   └── process_mapping_reference.png
├── migrations/
│   └── 0001_initial_schema.sql  # D1 데이터베이스 스키마
├── dist/                   # 빌드 결과물
├── wrangler.jsonc          # Cloudflare 설정
├── package.json
├── vite.config.ts
└── ecosystem.config.cjs    # PM2 설정 (개발용)
```

## 💻 로컬 개발

### 필수 요구사항
- Node.js 18+
- npm 또는 yarn
- Wrangler CLI

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

# 브라우저에서 접속
# http://localhost:3000
```

### 프로덕션 배포

```bash
# D1 마이그레이션 (프로덕션)
npm run db:migrate:prod

# 빌드 및 배포
npm run deploy
```

## 📋 아직 구현되지 않은 기능

### ⏳ 예정된 기능
- [ ] 업로드 기록 조회 UI
- [ ] 저장된 데이터 불러오기 기능
- [ ] 데이터 히스토리 비교 분석
- [ ] PDF 리포트 내보내기
- [ ] 다중 파일 업로드 (여러 날짜 통합)
- [ ] 날짜 범위별 추세 분석
- [ ] 필터 프리셋 저장 기능
- [ ] 다크 모드 지원
- [ ] 모바일 최적화

## 🔄 권장 다음 단계

1. **업로드 기록 UI 추가**
   - 업로드 목록 페이지 생성
   - 저장된 데이터 조회 및 로드 기능
   
2. **데이터 분석 기능 강화**
   - 여러 업로드 데이터 비교
   - 기간별 추세 분석
   - 작업자별 성과 추이

3. **사용자 경험 개선**
   - 로딩 상태 표시 개선
   - 에러 핸들링 강화
   - 알림 시스템 추가

## 📖 사용 가이드

### 1️⃣ 엑셀 파일 업로드
1. "데이터 업로드" 탭 클릭
2. Excel 파일 드래그 앤 드롭 또는 선택
3. 자동으로 데이터 처리 및 데이터베이스 저장
4. 콘솔에서 저장 성공 메시지 확인

### 2️⃣ 리포트 확인
- KPI 타일: 주요 성과 지표
- 성과 밴드: 작업자별 성과 등급
- 차트: 공정별/등급별 시각화
- 날짜별 리포트: 피벗 테이블 뷰

### 3️⃣ 데이터 필터링
- Shift, 날짜, 교대, 공정, 작업자 필터 사용
- "필터 적용" 버튼으로 리포트 업데이트

## 🤝 기여

이슈 및 Pull Request를 환영합니다!

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 🎉 업데이트 내역

### v2.1.0 (2026-02-17)
- ✅ Cloudflare D1 데이터베이스 통합
- ✅ Hono 백엔드 프레임워크 적용
- ✅ 자동 데이터 저장 기능 추가
- ✅ REST API 엔드포인트 구현
- ✅ Cloudflare Pages 배포

### v2.0.0
- ✅ 체크박스 필터 시스템
- ✅ 3개월 Shift Calendar
- ✅ 공정 매핑 관리
- ✅ JSON 내보내기/불러오기

---

**제작자**: twokomi  
**마지막 업데이트**: 2026-02-17
