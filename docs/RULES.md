# 개발 규칙 (RULES)

> 이 문서는 dujon_nice 프로젝트의 **최상위 기준**이다.
> 모든 개발 세션·에이전트·기여자는 코드를 작성하기 전에 이 규칙을 따른다.
> 문서와 코드가 어긋나면 **문서를 먼저 고치고 코드가 따라간다.**

## 1. 기술 규칙

- **바닐라 HTML/CSS/JS만 사용한다.** 빌드 도구(webpack, vite 등)·프레임워크(React, Vue 등) 금지.
  GitHub Pages가 저장소 루트를 그대로 서빙하는 구조를 유지한다.
- 외부 라이브러리는 아래 CDN만 허용한다. 추가하려면 이 문서를 먼저 수정한다.
  | 라이브러리 | 용도 |
  |---|---|
  | SheetJS (xlsx) | XLSX 내보내기 |
  | pdf.js | 도면 PDF 렌더링 |
  | Tesseract.js | OCR (kor+eng) |
  | 카카오맵 JS SDK | 지도·주소 검색 (키는 사용자 입력) |
- **CDN 로드 실패 시 반드시 사용자에게 안내한다** (토스트/문구). 조용한 실패 금지.

## 2. 데이터 규칙

- 페이지(html)는 `localStorage`/`IndexedDB`를 **직접 만지지 않는다.**
  - 정형 데이터 → 반드시 `assets/js/store.js` 경유
  - 파일(도면 PDF blob) → 반드시 `assets/js/files.js` 경유
- 이유: 연말에 store.js/files.js를 동일한 함수 시그니처의 Supabase 어댑터로 교체하면
  화면 코드를 바꾸지 않고 멀티유저 백엔드로 전환하기 위함.
- 스키마 변경은 `schemaVersion` 증가 + `migrate()` 케이스 추가와 **함께만** 가능하다.
- 엔티티 enum 값은 화면 표기 그대로 한국어 문자열로 저장한다. 값 목록은 `docs/DATA_SCHEMA.md`가 기준.

## 3. 경로 규칙

- **상대 경로만 사용한다.** (`assets/css/base.css` — O / `/assets/css/base.css` — X)
- 이유: GitHub Pages 주소가 `https://siyeolryu.github.io/dujon_nice/` 하위 경로라서
  절대경로는 배포 시 깨진다. (가장 흔한 Pages 배포 버그)

## 4. UI 규칙

- 모든 화면 문구는 **한국어**, 공무 실무 용어를 사용한다 (`.claude/skills/gongmu-domain` 준수).
- 색·간격·글꼴 크기는 `assets/css/base.css`의 CSS 변수(토큰)만 사용한다.
  페이지별 임의 색상·스타일 하드코딩 금지.
- 모든 목록 화면은 **빈 상태(empty state)** 디자인을 갖춘다 (첫 방문 시 안내 + 등록 버튼).
- 인쇄가 필요한 화면(보고서, 대장)은 `print.css`로 A4 기준 인쇄 레이아웃을 제공한다.
- 모바일 폭(390px)에서 사이드바 접힘·테이블 가로 스크롤이 동작해야 한다.

## 5. 보안 규칙

- 이 저장소는 **public**이다. 아래 항목은 절대 커밋하지 않는다.
  - 실제 계약금액, 실명, 주민등록번호, 전화번호 등 개인정보·영업정보
  - API 키 (카카오맵 키 포함)
- 샘플/시드 데이터는 **가상의 현장명·인명**만 사용한다.
- 카카오맵 키는 설정 화면에서 입력받아 localStorage에 보관한다 (코드 하드코딩 금지).

## 6. 품질 규칙

- 페이지 추가/수정 후: 콘솔 에러 0건 확인 → 로컬 서버(`python -m http.server 8000`)로 동작 확인 → 커밋.
- 커밋 메시지 형식: `feat|fix|docs|style|refactor(모듈): 한 줄 요약`
  - 예: `feat(tasks): 칸반 보드 드래그 앤 드롭 추가`
- 배포 전 검증 체크리스트는 `docs/PROCESS.md` 하단을 따른다.

## 7. 문서 규칙

- 새 기능 추가 시 `ARCHITECTURE.md`·`PROCESS.md` 갱신을 동반한다.
- 주요 의사결정은 `ROADMAP.md`의 결정 기록에 남긴다.
- 도메인 지식(용어, 양식, 실무 피드백)은 `.claude/skills/gongmu-domain/`에 축적한다.
