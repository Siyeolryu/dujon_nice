---
name: design-system
description: This skill should be used when creating or modifying any page, component, or style in the dujon_nice platform — e.g. when asked to "새 페이지 추가", "화면 만들기", "스타일 수정", "버튼/테이블/모달 추가", "인쇄 레이아웃". Provides the CSS token catalog, component class reference, page skeleton, and the new-page checklist that keep all screens visually consistent.
version: 0.1.0
---

# 디자인 시스템 (design-system)

모든 화면이 하나의 앱처럼 보이게 하는 규칙. 색·간격·컴포넌트는 반드시
`assets/css/base.css`(토큰)와 `assets/css/components.css`(컴포넌트)만 사용한다.
페이지별 `<style>` 하드코딩 금지 — 필요한 컴포넌트가 없으면 components.css에 추가한 뒤 쓴다.

## 페이지 뼈대 (모든 *.html 공통)

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>페이지명 — 공무 플랫폼</title>
  <link rel="stylesheet" href="assets/css/base.css">
  <link rel="stylesheet" href="assets/css/components.css">
  <link rel="stylesheet" href="assets/css/print.css">
</head>
<body class="app">
  <!-- 사이드바는 UI.init()이 삽입 -->
  <div class="main">
    <div class="topbar">
      <button class="menu-toggle" data-menu-toggle>☰</button>
      <h1>페이지 제목</h1>
      <span class="sub">부제 설명</span>
      <span class="spacer"></span>
      <button class="btn primary" id="btnNew">+ 등록</button>
    </div>
    <div class="content"><!-- 본문 --></div>
  </div>
  <script src="assets/js/store.js"></script>
  <script src="assets/js/ui.js"></script>
  <script>
    UI.init("페이지키", "페이지명"); // 페이지키는 ui.js NAV의 key와 일치
    UI.bindModalClose();
  </script>
</body>
</html>
```

- 스크립트 로드 순서: `store.js` → `ui.js` → (페이지 로직). 경로는 항상 상대 경로.
- 페이지키: home/tasks/report/calendar/documents/checklists/subcontracts/sites/drawings/review/settings

## 토큰 요약 (base.css)

- 주요색 `--c-primary`(진남색), 강조 `--c-accent`, 상태색 `--c-success/warn/danger/info` + `-soft` 배경쌍
- 텍스트 `--c-text`, 보조 `--c-text-sub`, 희미 `--c-text-faint`
- 간격 `--sp-1(4px)`~`--sp-8(32px)`, 글자 `--fs-xs(12)`~`--fs-2xl(24)`
- 형태 `--radius(8px)`, `--radius-sm`, `--radius-full`, `--shadow`, `--shadow-lg`

## 컴포넌트 클래스 카탈로그 (components.css)

| 용도 | 클래스 |
|---|---|
| 카드 | `.card` + `.card-head`/`.card-body` 또는 `.card-pad` |
| KPI 카드 | `.kpi-grid > .kpi` (`.warn`/`.danger` 수식) |
| 버튼 | `.btn` (+`.primary` `.danger` `.ghost` `.sm`) |
| 배지 | `.badge` + 색상(`gray/blue/green/orange/red/navy`) — 도메인 값은 `UI.badge(값)` 사용 |
| 테이블 | `.table-wrap > table.table`, 지연 행 `tr.overdue` |
| 폼 | `.field > label + .input/.select/.textarea`, 가로 배치 `.form-row`, 필터줄 `.filters` |
| 모달 | `.modal-backdrop > .modal > .modal-head/.modal-body/.modal-foot`, 열기 `UI.openModal(id)` |
| 칸반 | `.kanban > .kanban-col > .kanban-card` |
| 빈 상태 | `.empty > .empty-icon + p + .btn` — 모든 목록 화면 필수 |
| 토스트 | `UI.toast(msg, "success"|"error")` |
| 탭 | `.tabs > .tab.active` |
| 캘린더 | `.cal-grid > .cal-dow / .cal-cell` |
| 2단 그리드 | `.grid-2`, 섹션 `.section > .section-title` |

## 인쇄 (print.css)

- 인쇄 대상 페이지는 본문에 `.print-only` 블록(제목 `.print-title`, 결재란 `table.approval`)을 넣는다.
- 화면 전용 요소에 `.no-print`. 인쇄 시 사이드바·탑바·필터는 자동 숨김.
- A4 세로 기준. 표는 `page-break-inside: avoid` 적용됨.

## 새 페이지 추가 체크리스트

1. 위 뼈대 복사, `UI.init("키")`의 키 결정
2. `assets/js/ui.js`의 `NAV` 배열에 항목 추가 (또는 `soon: true` 제거)
3. 목록 화면이면 빈 상태(`.empty`) 구현
4. 데이터는 `Store.*`만 사용 (localStorage 직접 접근 금지)
5. 390px 폭에서 확인 (테이블은 `.table-wrap`으로 감싸 가로 스크롤)
6. 콘솔 에러 0건 확인 후 커밋 (`feat(페이지키): ...`)
