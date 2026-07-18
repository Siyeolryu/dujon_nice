# 시스템 아키텍처 (ARCHITECTURE)

> dujon_nice — 공무팀 업무관리 플랫폼의 구조 설명서.
> 변경 시 이 문서를 먼저 수정하고 코드를 따라가게 한다. (RULES.md §7)

## 1. 전체 구조

정적 웹앱(빌드 없음). 모든 처리는 사용자 브라우저 안에서 일어나고,
데이터는 브라우저 저장소(localStorage/IndexedDB)에 보관된다. 서버가 없다.

```mermaid
flowchart TB
    subgraph browser["사용자 브라우저"]
        subgraph pages["화면 계층 (*.html)"]
            P1["index<br/>대시보드"]
            P2["tasks<br/>업무 보드"]
            P3["report<br/>업무보고"]
            P4["documents<br/>문서대장"]
            P5["calendar<br/>일정"]
            P6["sites<br/>현장·배정"]
            P7["drawings<br/>도면"]
            P8["settings<br/>설정·백업"]
        end
        subgraph common["공통 계층"]
            UI["ui.js<br/>사이드바·모달·토스트·날짜유틸"]
            CSS["base.css / components.css / print.css<br/>디자인 토큰·컴포넌트·인쇄"]
        end
        subgraph logic["로직 계층"]
            ME["measure.js<br/>축척·면적·길이"]
            GE["geo.js<br/>거리·시군 판정"]
            SE["seed.js<br/>샘플 데이터"]
        end
        subgraph data["데이터 계층"]
            ST["store.js<br/>정형 데이터 CRUD·백업"]
            FI["files.js<br/>파일 blob 저장"]
        end
        LS[("localStorage<br/>dujon.db — 단일 JSON")]
        IDB[("IndexedDB<br/>도면 PDF blob")]
    end
    subgraph ext["외부 서비스 (CDN)"]
        KK["카카오맵 SDK<br/>주소→좌표·지도"]
        XL["SheetJS<br/>XLSX"]
        PJ["pdf.js<br/>PDF 렌더"]
        TS["Tesseract.js<br/>OCR"]
    end
    pages --> UI
    pages --> logic
    pages --> data
    ST --> LS
    FI --> IDB
    P6 --> KK
    P3 --> XL
    P7 --> PJ
    P7 --> TS
```

## 2. 데이터 흐름 — 단일 진실 원천

모든 화면은 같은 DB(`dujon.db`)를 읽고 쓴다. 입력은 한 곳에서, 활용은 여러 화면에서.

```mermaid
flowchart LR
    IN["입력<br/>업무·문서·일정·현장 등록"] --> ST["store.js<br/>dujon.db 저장"]
    ST --> D1["대시보드<br/>KPI·마감임박"]
    ST --> D2["주간보고<br/>자동 생성"]
    ST --> D3["캘린더<br/>마감·회신기한 합성"]
    ST --> D4["지도<br/>거리·배정 판정"]
    ST --> OUT["JSON 백업<br/>내보내기/가져오기"]
```

## 3. 데이터 계층 상세

### store.js — 정형 데이터

- 저장 위치: `localStorage["dujon.db"]` — **schemaVersion을 가진 단일 JSON 객체**
- 구조: `{ schemaVersion, meta, sites, people, tasks, documents, events, reports, drawings, measurements }`
- 공개 API (이 시그니처가 계약이다 — 어댑터 교체 시에도 유지):
  - `load()` / `save(db)` / `migrate(db)`
  - 컬렉션별 `list(col, filter?)` / `get(col, id)` / `add(col, obj)` / `update(col, id, patch)` / `remove(col, id)`
  - `exportJSON()` / `importJSON(obj)`
- ID: `crypto.randomUUID()`. 모든 엔티티에 `createdAt`/`updatedAt` (ISO 8601).
- 엔티티 필드 정의는 `docs/DATA_SCHEMA.md` 참조.

### files.js — 파일 (도면 PDF)

- 저장 위치: IndexedDB `dujon-files` DB (localStorage 용량 한계 회피)
- 공개 API: `putFile(id, blob)` / `getFile(id)` / `deleteFile(id)` / `listFileIds()`
- 파일 메타데이터(현장, 공종, 차수 등)는 store.js의 `drawings` 컬렉션에 저장. blob만 IndexedDB.

## 4. 외부 서비스 연동 원칙

- 전부 CDN/브라우저 SDK — 서버 불필요. 로드 실패 시 해당 기능만 비활성화하고 안내 (RULES.md §1).
- 카카오맵 키는 사용자가 settings에서 입력 → localStorage 보관. 키 없으면 지도 영역에 안내 문구, 표 기능은 정상 동작.

## 5. 연말 확장 경로 (2026-12 공사부 플랫폼)

핵심: **화면 계층은 그대로 두고 데이터 계층만 교체한다.**

```mermaid
flowchart LR
    subgraph now["현재 (MVP)"]
        A["화면 8종"] --> B["store.js / files.js<br/>(localStorage / IndexedDB)"]
    end
    subgraph future["연말 (플랫폼)"]
        C["화면 8종 (무변경)"] --> D["store.js / files.js<br/>(Supabase 어댑터)"]
        D --> E[("Supabase<br/>Postgres + Storage + Auth")]
        E --> F["멀티유저<br/>공무/소장/부장 권한"]
        E --> G["AI 도면 자동검토<br/>(Claude API)"]
    end
    now -. "JSON 백업 = DB 시딩 데이터" .-> future
```

- Supabase 테이블 = `DATA_SCHEMA.md`의 컬렉션 1:1 매핑 (`*Id` 필드가 그대로 FK).
- 멀티유저 시 `orgId`, `createdBy` 컬럼 추가.
- JSON 백업 파일 포맷 = DB 덤프 포맷 → 시딩 스크립트가 거의 공짜.

## 6. 파일 맵

| 경로 | 역할 |
|---|---|
| `index.html` | 대시보드 (KPI, 마감 임박, 다가오는 일정) |
| `tasks.html` | 업무 보드 (칸반/리스트, 필터, CRUD 모달) |
| `report.html` | 주간·일일 업무보고 (자동 생성→편집→인쇄/복사/XLSX) |
| `documents.html` | 공문·문서 관리대장 |
| `calendar.html` | 월간 캘린더 (일정+업무마감+회신기한 합성) |
| `sites.html` | 현장·소장 배정현황 (카카오맵, 30km 판정) |
| `drawings.html` | 도면 모듈 (뷰어·측정·OCR·비교) |
| `settings.html` | 백업/복원, 기초정보, API 키, 내 정보 |
| `assets/js/store.js` | 정형 데이터 계층 (계약 인터페이스) |
| `assets/js/files.js` | 파일 데이터 계층 (IndexedDB) |
| `assets/js/ui.js` | 공통 UI (사이드바·모달·토스트·날짜) |
| `assets/js/measure.js` | 축척 보정·면적·길이 계산 (순수 함수) |
| `assets/js/geo.js` | 하버사인 거리·시/군 판정·카카오 연동 |
| `assets/js/seed.js` | 가상 샘플 데이터 주입 |
| `assets/css/base.css` | 디자인 토큰(CSS 변수)·reset·레이아웃 |
| `assets/css/components.css` | 카드·테이블·배지·모달·폼·칸반 |
| `assets/css/print.css` | A4 인쇄 (결재란 포함) |
