/* ============================================================
   checklist-templates.js — 내장 표준 체크리스트 템플릿
   근거: docs/plans/checklist-module.md §1-2, §1-3
        .claude/skills/gongmu-domain/references/compliance-checklists.md
   ※ 지자체별 요건은 다름 — 표준을 복제해 "OO시청 확인본"으로 현지화한다.
   ============================================================ */

const ChecklistTemplates = (() => {
  const STANDARD_START = {
    name: "표준 착공 체크리스트",
    kind: "착공",
    authority: "표준",
    builtin: true,
    confirmedAt: "2026-07-18",
    confirmedBy: "내장 기본값 (지자체 확인 필요)",
    items: [
      { title: "착공신고서", group: "인허가", agency: "세움터", requiredWhen: "항상", formNote: "건축법 제21조, 세움터 전자 제출" },
      { title: "감리 계약서", group: "인허가", agency: "세움터", requiredWhen: "해당시", formNote: "공사감리자 지정 시 첨부" },
      { title: "가설건축물 축조신고 (현장사무실 등)", group: "인허가", agency: "시·군청", requiredWhen: "해당시", formNote: "" },
      { title: "공사(도급)계약서 사본", group: "계약·인력", agency: "세움터 첨부", requiredWhen: "항상", formNote: "" },
      { title: "현장대리인계 + 건설기술인 경력증명", group: "계약·인력", agency: "세움터 첨부", requiredWhen: "항상", formNote: "" },
      { title: "산재·고용보험 성립신고", group: "계약·인력", agency: "근로복지공단", requiredWhen: "항상", formNote: "" },
      { title: "건설근로자 퇴직공제 가입", group: "계약·인력", agency: "건설근로자공제회", requiredWhen: "대상공사", formNote: "대상 공사 범위 확인" },
      { title: "안전관리계획서", group: "안전·환경", agency: "국토안전관리원", requiredWhen: "대상공사", formNote: "건진법 — 굴착 깊이·높이 기준 확인, 검토 후 착공" },
      { title: "유해위험방지계획서", group: "안전·환경", agency: "안전보건공단", requiredWhen: "대상공사", formNote: "산안법 — 대상 공사 심사" },
      { title: "품질관리(시험)계획서", group: "안전·환경", agency: "인허가기관", requiredWhen: "대상공사", formNote: "" },
      { title: "비산먼지 발생사업 신고", group: "안전·환경", agency: "시·군청 환경과", requiredWhen: "항상", formNote: "대기환경보전법" },
      { title: "특정공사 사전신고 (소음·진동)", group: "안전·환경", agency: "시·군청 환경과", requiredWhen: "대상공사", formNote: "소음·진동관리법" },
      { title: "건설폐기물 처리계획", group: "안전·환경", agency: "올바로시스템", requiredWhen: "항상", formNote: "" },
      { title: "착공 전 사진·경계측량", group: "현장준비", agency: "-", requiredWhen: "항상", formNote: "" },
      { title: "도로점용·굴착 허가", group: "현장준비", agency: "시·군청", requiredWhen: "해당시", formNote: "" },
    ],
  };

  const STANDARD_FINISH = {
    name: "표준 준공(사용승인) 체크리스트",
    kind: "준공",
    authority: "표준",
    builtin: true,
    confirmedAt: "2026-07-18",
    confirmedBy: "내장 기본값 (지자체 확인 필요)",
    items: [
      { title: "사용승인신청서 + 공사완료도서", group: "인허가", agency: "세움터", requiredWhen: "항상", formNote: "건축법 제22조" },
      { title: "감리완료보고서", group: "감리", agency: "감리자", requiredWhen: "항상", formNote: "" },
      { title: "소방시설 완공검사증명서", group: "검사증명", agency: "소방서", requiredWhen: "해당시", formNote: "" },
      { title: "전기 사용전검사 확인", group: "검사증명", agency: "전기안전공사", requiredWhen: "항상", formNote: "" },
      { title: "승강기 설치검사 합격", group: "검사증명", agency: "승강기안전공단", requiredWhen: "해당시", formNote: "" },
      { title: "정보통신 사용전검사", group: "검사증명", agency: "지자체", requiredWhen: "해당시", formNote: "" },
      { title: "도시가스 완성검사", group: "검사증명", agency: "가스안전공사", requiredWhen: "해당시", formNote: "" },
      { title: "정화조/오수처리시설 준공검사", group: "환경·설비", agency: "시·군청", requiredWhen: "해당시", formNote: "하수도법" },
      { title: "절수설비 설치 확인", group: "환경·설비", agency: "시·군청", requiredWhen: "항상", formNote: "" },
      { title: "건설폐기물 처리 실적", group: "환경·설비", agency: "올바로시스템", requiredWhen: "항상", formNote: "" },
      { title: "조경 완료·대지 정비", group: "마감", agency: "시·군청", requiredWhen: "해당시", formNote: "완료 사진 준비" },
      { title: "하자보수보증서·취득세 안내 (발주처 인도)", group: "사후", agency: "발주처", requiredWhen: "항상", formNote: "사용승인 후" },
    ],
  };

  /* 첫 방문 시 내장 표준 템플릿 보장 */
  function ensureStandard() {
    const existing = Store.list("checklistTemplates", (t) => t.builtin);
    if (!existing.some((t) => t.kind === "착공")) Store.add("checklistTemplates", STANDARD_START);
    if (!existing.some((t) => t.kind === "준공")) Store.add("checklistTemplates", STANDARD_FINISH);
  }

  /* 템플릿 → 현장 체크리스트 인스턴스 생성 (항목 스냅샷 복사) */
  function instantiate(templateId, siteId) {
    const t = Store.get("checklistTemplates", templateId);
    if (!t) return null;
    return Store.add("siteChecklists", {
      siteId,
      templateId,
      kind: t.kind,
      templateName: t.name,
      items: t.items.map((it) => ({
        title: it.title, group: it.group, agency: it.agency,
        requiredWhen: it.requiredWhen, formNote: it.formNote,
        status: "준비중", dueDate: null, documentId: null, ownerId: null, memo: "",
      })),
    });
  }

  /* 지자체 확인본 복제 */
  function localize(templateId, authority, confirmedBy) {
    const t = Store.get("checklistTemplates", templateId);
    if (!t) return null;
    return Store.add("checklistTemplates", {
      name: `${authority} ${t.kind} 체크리스트`,
      kind: t.kind,
      authority,
      builtin: false,
      confirmedAt: UI.todayStr(),
      confirmedBy: confirmedBy || "",
      items: JSON.parse(JSON.stringify(t.items)),
    });
  }

  /* 진행률: (제출+완료) / (전체 − 해당없음) */
  function progress(checklist) {
    const active = checklist.items.filter((i) => i.status !== "해당없음");
    const done = active.filter((i) => i.status === "제출" || i.status === "완료");
    return { done: done.length, total: active.length,
      pct: active.length ? Math.round((done.length / active.length) * 100) : 0 };
  }

  return { ensureStandard, instantiate, localize, progress };
})();
