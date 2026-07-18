# 데이터 스키마 (DATA_SCHEMA)

> `store.js`가 관리하는 엔티티 정의. **enum 값 목록의 기준 문서.**
> 스키마 변경 = `schemaVersion` 증가 + `migrate()` 추가 + 이 문서 갱신 (RULES.md §2)

## DB 루트 객체 — `localStorage["dujon.db"]`

```js
{
  schemaVersion: 2,
  meta: { appVersion: "0.2.0", owner: "", ownerRank: "", exportedAt: null },
  sites: [], people: [], tasks: [], documents: [],
  events: [], reports: [], drawings: [], measurements: [],
  checklistTemplates: [], siteChecklists: [], subcontracts: []   // v2 추가
}
```

**v1 → v2 마이그레이션**: 세 컬렉션을 빈 배열로 추가. 기존 데이터 무변경.

공통 필드: 모든 엔티티는 `id`(uuid), `createdAt`, `updatedAt`(ISO 8601)을 가진다.

## 엔티티

### Site (현장)
| 필드 | 타입 | 설명 |
|---|---|---|
| name | string | 현장명 |
| code | string | 현장 코드 (선택) |
| client | string | 발주처 |
| startDate / endDate | date | 공사기간 |
| status | enum | `예정` `진행중` `준공` |
| siteManagerId | uuid | 현장소장 (→ Person) |
| managerId | uuid | 담당 공무 (→ Person, 선택) |
| address | string | 주소 (카카오 주소 검색) |
| lat / lng | number | 좌표 (주소 검색 시 자동) |
| sido / sigungu | string | 시/도, 시/군/구 (자동) |
| bandUrl | string | 네이버밴드 링크 |
| memo | string | 비고 |

### Person (담당자)
| 필드 | 타입 | 설명 |
|---|---|---|
| name | string | 이름 |
| rank | string | 직급 (사원/대리/과장/차장/부장/소장/임원 등 자유 입력) |
| role | enum | `공무` `현장소장` `현장직원` `기타` |
| phone | string | 연락처 (선택) |
| active | boolean | 재직 여부 |

### Task (업무)
| 필드 | 타입 | 설명 |
|---|---|---|
| title | string | 업무명 |
| description | string | 내용 |
| status | enum | `대기` `진행` `완료` |
| priority | enum | `높음` `보통` `낮음` |
| dueDate | date | 마감일 |
| assigneeId | uuid | 담당 (→ Person) |
| siteId | uuid | 현장 (→ Site) |
| category | enum | `기성` `계약` `공문` `인허가` `민원` `일반` |
| completedAt | datetime | 완료 시각 (완료 처리 시 자동 — 주간보고 실적 집계 근거) |

### Document (문서)
| 필드 | 타입 | 설명 |
|---|---|---|
| direction | enum | `수신` `발신` |
| docNo | string | 문서번호 (자동 제안: `제YYYY-NNN호`) |
| date | date | 접수·발송일 |
| counterpart | string | 발신처/수신처 |
| title | string | 제목 |
| docType | enum | `공문` `계약서류` `기성서류` `인허가` `민원` `기타` |
| status | enum | `접수` `처리중` `회신대기` `완료` |
| dueDate | date | 회신기한 (캘린더 자동 표시) |
| siteId | uuid | 현장 |
| ownerId | uuid | 담당 |
| memo | string | 비고 |

### Event (일정)
| 필드 | 타입 | 설명 |
|---|---|---|
| title | string | 일정명 |
| date | date | 일자 |
| type | enum | `기성청구` `계약마감` `회의` `입찰` `기타` |
| siteId | uuid | 현장 (선택) |
| memo | string | 비고 |

### Report (보고서 스냅샷)
| 필드 | 타입 | 설명 |
|---|---|---|
| type | enum | `주간` `일일` |
| periodStart / periodEnd | date | 보고 기간 |
| generatedAt | datetime | 생성 시각 |
| sections | object | 구조화 본문 (현장별 실적/계획/특이사항 — 저장 후 편집 가능) |

### Drawing (도면/스캔문서 — 메타데이터)
| 필드 | 타입 | 설명 |
|---|---|---|
| siteId | uuid | 현장 |
| name | string | 파일명/도면명 |
| docType | enum | `도면` `스캔문서` |
| discipline | enum | `건축` `구조` `설비` `전기` `토목` `기타` |
| rev | string | 차수 (예: Rev.1, 변경1차) |
| fileId | string | IndexedDB blob 키 (files.js) |
| pageCount | number | 페이지 수 |
| documentId | uuid | 문서대장 연결 (선택) |

**주의: PDF 원본 blob은 dujon.db가 아니라 IndexedDB(`dujon-files`)에 저장한다.**

### Measurement (측정 결과)
| 필드 | 타입 | 설명 |
|---|---|---|
| drawingId | uuid | 도면 |
| page | number | 페이지 |
| label | string | 라벨 (예: "101호 거실") |
| kind | enum | `면적` `길이` |
| value | number | 값 |
| unit | string | `㎡` 또는 `m` |
| scale | object | 축척 보정값 { pxPerMeter } |
| points | array | 화면 좌표 배열 |

### ChecklistTemplate (체크리스트 템플릿) — v2
| 필드 | 타입 | 설명 |
|---|---|---|
| name | string | 예: "표준 착공", "수원시청 착공 2026-07 확인본" |
| kind | enum | `착공` `준공` |
| authority | string | `표준` 또는 지자체명 |
| confirmedAt / confirmedBy | date/string | 요건 확인일·확인자 (신뢰도 메타) |
| builtin | boolean | 내장 표준 템플릿 여부 (수정 시 복제 유도) |
| items | array | `{ title, group(인허가/안전·환경/계약·인력/현장준비/감리/검사증명/환경·설비/마감/사후), agency, requiredWhen(항상/대상공사/해당시), formNote }` |

### SiteChecklist (현장 체크리스트 인스턴스) — v2
| 필드 | 타입 | 설명 |
|---|---|---|
| siteId | uuid | 현장 |
| templateId | uuid | 원본 템플릿 (스냅샷 복사 — 이후 템플릿 변경 영향 없음) |
| kind | enum | `착공` `준공` |
| items | array | `{ title, group, agency, requiredWhen, status(해당없음/준비중/제출/보완요청/완료), dueDate, documentId(문서대장 연결), ownerId, memo }` |

- 진행률 = (제출+완료) / (전체 − 해당없음).
- `dueDate` 있는 미완료 항목은 캘린더·대시보드의 "서류·통보기한" 소스에 합산.

### Subcontract (하도급·키스콘) — v2
| 필드 | 타입 | 설명 |
|---|---|---|
| siteId | uuid | 현장 |
| company | string | 하수급 업체명 |
| trade | string | 공종 |
| amount | number | 하도급 금액 (원) |
| contractDate | date | 계약 체결일 |
| checks | object | 조건 점검 `{ license, noWholeSub, noReSub, bond, standardForm, fairness }` — 각 `확인`/`해당없음`/`미확인` |
| kisconDueDate | date | 통보기한 = 계약일 + 30일 (자동, 수정 가능) |
| kisconNotifiedAt | date | 통보 완료일 |
| status | enum | `검토중` `계약` `통보완료` `변경통보필요` |
| memo | string | 비고 |

- `kisconDueDate` 미통보 건은 캘린더·대시보드 기한 소스에 합산.

## Supabase 이관 매핑 (연말)

- 컬렉션 → 테이블 1:1. `id` uuid PK, `*Id` 필드 → FK.
- 추가 컬럼: `org_id`(회사/부서), `created_by`(작성자) — 멀티유저 권한 기준.
- enum 한국어 값 → DB에는 그대로 저장해도 무방 (Postgres text + check constraint). 영문 코드 전환은 선택.
- `createdAt`/`updatedAt` → `created_at`/`updated_at` timestamptz.
- Drawing blob → Supabase Storage 버킷, `fileId` → storage path.
- JSON 백업 파일 = 시딩 입력 포맷.
