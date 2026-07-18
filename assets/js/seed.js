/* ============================================================
   seed.js — 시연용 샘플 데이터 (전부 가상 — RULES.md §5)
   settings.html의 "샘플 데이터 넣기" 버튼에서 호출.
   ============================================================ */

const Seed = (() => {
  function d(offsetDays) {
    const dt = new Date();
    dt.setDate(dt.getDate() + offsetDays);
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
  }

  function inject() {
    // 담당자 (가상 인명)
    const p1 = Store.add("people", { name: "김현장", rank: "소장", role: "현장소장", phone: "", active: true });
    const p2 = Store.add("people", { name: "박소장", rank: "소장", role: "현장소장", phone: "", active: true });
    const p3 = Store.add("people", { name: "이공무", rank: "대리", role: "공무", phone: "", active: true });

    // 현장 (가상 현장명 — 실제 지명이지만 공개 주소 수준)
    const s1 = Store.add("sites", {
      name: "가온아파트 신축공사", code: "A-01", client: "가온건설산업(주)",
      status: "진행중", startDate: d(-180), endDate: d(300),
      address: "경기도 수원시 팔달구 효원로 241",
      siteManagerId: p1.id, managerId: p3.id, bandUrl: "", memo: "샘플 현장",
      lat: null, lng: null, sido: "", sigungu: "",
    });
    const s2 = Store.add("sites", {
      name: "다온물류센터 증축공사", code: "B-02", client: "다온로지스(주)",
      status: "진행중", startDate: d(-90), endDate: d(200),
      address: "경기도 화성시 향남읍 행정중앙로 50",
      siteManagerId: p2.id, managerId: p3.id, bandUrl: "", memo: "샘플 현장",
      lat: null, lng: null, sido: "", sigungu: "",
    });
    const s3 = Store.add("sites", {
      name: "라온근린생활시설 신축공사", code: "C-03", client: "라온디앤씨(주)",
      status: "예정", startDate: d(30), endDate: d(400),
      address: "경기도 평택시 중앙로 275",
      siteManagerId: null, managerId: p3.id, bandUrl: "", memo: "소장 미배정 샘플",
      lat: null, lng: null, sido: "", sigungu: "",
    });

    // 업무
    Store.add("tasks", { title: "7월 기성청구 서류 작성", status: "완료", priority: "높음", dueDate: d(-2), category: "기성", siteId: s1.id, assigneeId: p3.id, description: "", completedAt: new Date(Date.now() - 2 * 864e5).toISOString() });
    Store.add("tasks", { title: "철근콘크리트 하도급 변경계약 검토", status: "진행", priority: "높음", dueDate: d(3), category: "계약", siteId: s1.id, assigneeId: p3.id, description: "견적 대조 단계", completedAt: null });
    Store.add("tasks", { title: "착공계 보완서류 제출", status: "대기", priority: "보통", dueDate: d(6), category: "인허가", siteId: s2.id, assigneeId: p3.id, description: "", completedAt: null });
    Store.add("tasks", { title: "민원 대응 결과 보고서 작성", status: "대기", priority: "낮음", dueDate: d(10), category: "민원", siteId: s2.id, assigneeId: p3.id, description: "", completedAt: null });
    Store.add("tasks", { title: "월간 공정회의 자료 취합", status: "진행", priority: "보통", dueDate: d(1), category: "일반", siteId: null, assigneeId: p3.id, description: "", completedAt: null });

    // 문서
    Store.add("documents", { direction: "수신", docNo: "가온-2026-041", date: d(-5), counterpart: "가온건설산업(주)", title: "기성검사 일정 통보", docType: "기성서류", status: "완료", dueDate: null, siteId: s1.id, ownerId: p3.id, memo: "" });
    Store.add("documents", { direction: "수신", docNo: "수원-건축-2026-113", date: d(-3), counterpart: "수원시청 건축과", title: "착공계 보완 요청", docType: "인허가", status: "회신대기", dueDate: d(4), siteId: s2.id, ownerId: p3.id, memo: "" });
    Store.add("documents", { direction: "발신", docNo: "제2026-001호", date: d(-1), counterpart: "다온로지스(주)", title: "공사 진행 현황 보고", docType: "공문", status: "완료", dueDate: null, siteId: s2.id, ownerId: p3.id, memo: "" });

    // 일정
    Store.add("events", { title: "7월 기성청구 (가온아파트)", date: d(7), type: "기성청구", siteId: s1.id, memo: "" });
    Store.add("events", { title: "하도급 변경계약 마감", date: d(5), type: "계약마감", siteId: s1.id, memo: "" });
    Store.add("events", { title: "주간 공정회의", date: d(2), type: "회의", siteId: s2.id, memo: "" });
  }

  return { inject };
})();
