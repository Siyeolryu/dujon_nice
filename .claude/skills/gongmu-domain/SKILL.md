---
name: gongmu-domain
description: This skill should be used when working on UI text, field names, menu labels, report generation logic, or document ledger features in the dujon_nice 공무팀 platform — e.g. when asked to "화면 문구 작성", "보고서 양식", "주간보고 로직", "문서대장 필드", "기성 관련 기능", or when naming any user-facing label. Provides 종합건설 공사부 공무팀 domain terminology, document numbering conventions, 기성 monthly cycle, and 주간보고 format standards.
version: 0.1.0
---

# 공무 도메인 지식 (gongmu-domain)

종합건설 공사부 공무팀의 실무 용어·문서 양식·업무 사이클 지식.
화면 문구, 필드명, 보고서 로직을 만들 때 이 지식에 맞춰 작성한다.
잘못된 용어는 상급자 신뢰를 잃게 하므로, 확신이 없는 용어는 references를 확인한다.

## 핵심 원칙

1. 모든 사용자 노출 문구는 한국어 실무 용어를 쓴다. 번역투("태스크", "이슈") 금지 — "업무", "특이사항"을 쓴다.
2. 문서·보고서 산출물은 결재 문화를 전제한다: 결재란, 보고 기간, 작성자(소속·직급·성명)가 있어야 한다.
3. 날짜는 `YYYY-MM-DD` 또는 `MM/DD(요일)` 표기. 주간 단위는 월요일~금요일.
4. 상급자 대상 문구는 개조식(명사형 종결)으로 쓴다. 예: "OO현장 기성청구 완료" (O) / "기성청구를 완료했습니다" (X)

## 필수 용어 요약 (상세: references/terminology.md)

| 용어 | 의미 | 주의 |
|---|---|---|
| 기성(청구) | 진척분 공사대금 청구 | "청구서 발행"이 아니라 "기성청구" |
| 수금 | 청구한 기성의 입금 | 기성·수금은 한 쌍으로 관리 |
| 실행(예산) | 회사 내부 원가 예산 | 도급금액과 구분 |
| 도급 | 발주처와의 계약 | 하도급(외주)과 구분 |
| 외주/하도급 | 협력업체 계약 | |
| 적산 | 도면에서 수량 산출 | 견적의 전 단계 |
| 준공 | 공사 완료 | 현장 status enum: 예정/진행중/준공 |
| 관급 | 관공서 발주 (관급공사/관급자재) | |
| 공문 | 대외 공식 문서 | 수신/발신 구분, 문서번호 필수 |

## 업무 사이클

- **월간**: 매월 기성청구(현장별 지정일 무렵) → 익월 수금 확인. 월말 노무비·세금계산서 처리 집중.
- **주간**: 금요일 주간보고 제출 (금주 실적 / 차주 계획 / 특이사항 구조).
- **수시**: 공문 접수 → 회신기한 관리, 계약·변경계약, 인허가·민원 대응.

## 문서번호 관행

- 발신 공문: `제YYYY-NNN호` 형식으로 연도별 연번 증가 (예: 제2026-042호).
- 회사·현장에 따라 접두어가 붙을 수 있으므로 자동 제안값은 수정 가능해야 한다.

## 주간보고 구조 (상세 양식·톤: references/report-formats.md)

1. 헤더: 보고 기간, 소속/직급/성명, 결재란
2. 현장별 그룹핑 → 각 현장 아래 ① 금주 실적 ② 차주 계획 ③ 특이사항
3. 실적은 완료 업무 + 진행 업무(진행 상황 명기), 계획은 차주 마감·예정 업무
4. 특이사항: 회신대기 문서, 기성청구·계약 일정, 리스크

## 데이터 enum (기준: docs/DATA_SCHEMA.md — 변경 시 그쪽 먼저)

- Task.status: `대기` `진행` `완료` / priority: `높음` `보통` `낮음`
- Task.category: `기성` `계약` `공문` `인허가` `민원` `일반`
- Document.status: `접수` `처리중` `회신대기` `완료` / docType: `공문` `계약서류` `기성서류` `인허가` `민원` `기타`
- Event.type: `기성청구` `계약마감` `회의` `입찰` `기타`

## Additional Resources

- **`references/terminology.md`** — 공무 용어 상세 사전 (용어별 정의·오용 사례)
- **`references/report-formats.md`** — 주간보고·일일보고 표준 양식과 문장 톤 예시
- **`references/compliance-checklists.md`** — 착공·준공·하도급(키스콘) 규정 지식 (체크리스트 모듈 근거)

실무 피드백(M6 단계)으로 새 용어·양식을 알게 되면 references에 추가해 축적한다.
