# dujon_nice — 공무팀 업무관리 플랫폼

종합건설 공사부 공무팀의 업무관리 웹앱. 정적 HTML(빌드 없음) + GitHub Pages 배포.
2026-12까지 공사부 멀티유저 플랫폼으로 확장 예정.

## 반드시 먼저 읽을 문서 (문서가 기준, 코드가 따라간다)

1. `docs/RULES.md` — 개발 규칙 (기술/데이터/경로/UI/보안/품질/문서)
2. `docs/ARCHITECTURE.md` — 시스템 구조, 파일 맵, 데이터 계층 계약
3. `docs/DATA_SCHEMA.md` — 엔티티·enum 값의 기준
4. `docs/PROCESS.md` — 업무 흐름 5종 + 배포 전 체크리스트

## 절대 규칙 요약

- 바닐라 HTML/CSS/JS만. 프레임워크·빌드 도구 금지.
- 페이지는 localStorage/IndexedDB 직접 접근 금지 → `store.js`/`files.js` 경유.
- 상대 경로만 (`assets/...`). 절대 경로(`/assets/...`)는 Pages에서 깨짐.
- 모든 문구 한국어 + 공무 실무 용어 (`.claude/skills/gongmu-domain`).
- 스타일은 `base.css` 토큰만. 페이지별 하드코딩 금지 (`.claude/skills/design-system`).
- public 저장소: 실데이터·개인정보·API 키 커밋 금지. 샘플은 가상 현장명만.
- 커밋: `feat|fix|docs(모듈): 요약`.

## 로컬 실행·검증

```
cd C:\Users\tlduf\dujon_nice
python -m http.server 8000   # http://localhost:8000
```

배포: main에 push → GitHub Pages 자동 반영 → https://siyeolryu.github.io/dujon_nice/

## .claude 구성

- 스킬 `gongmu-domain`: 공무 용어·양식·업무 사이클 (UI 문구/필드/보고서 작업 시)
- 스킬 `design-system`: CSS 토큰·컴포넌트·새 페이지 체크리스트 (화면 작업 시)
- 에이전트 `frontend-builder`: 새 화면 구현 담당
- 에이전트 `domain-reviewer`: 공유 전 실무 용어·품질 검토 (읽기 전용)
