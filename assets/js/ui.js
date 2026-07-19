/* ============================================================
   ui.js — 공통 UI (사이드바·모달·토스트·날짜 유틸·배지)
   모든 페이지가 <body class="app"> 안에서 UI.init("페이지키") 호출.
   ============================================================ */

const UI = (() => {
  /* ---------- 내비게이션 정의 (단일 소스) ---------- */
  const NAV = [
    { group: "", items: [{ key: "home", href: "index.html", label: "홈 (대시보드)", icon: "🏠" }] },
    {
      group: "일반 업무관리",
      items: [
        { key: "tasks", href: "tasks.html", label: "업무 보드", icon: "📋" },
        { key: "report", href: "report.html", label: "업무보고", icon: "📝" },
        { key: "calendar", href: "calendar.html", label: "일정 캘린더", icon: "📅" },
      ],
    },
    {
      group: "문서·계약",
      items: [
        { key: "documents", href: "documents.html", label: "문서 관리대장", icon: "📄" },
        { key: "checklists", href: "checklists.html", label: "착공·준공 체크리스트", icon: "✅" },
        { key: "subcontracts", href: "subcontracts.html", label: "하도급·키스콘", icon: "📑" },
        { key: "permits", label: "인허가·민원", icon: "🏛️", soon: true },
      ],
    },
    {
      group: "현장",
      items: [{ key: "sites", href: "sites.html", label: "현장·소장 배정현황", icon: "🗺️" }],
    },
    {
      group: "도면·적산",
      items: [
        { key: "drawings", href: "drawings.html", label: "도면 검토·측정", icon: "📐" },
        { key: "review", href: "review.html", label: "도면 검토 세션", icon: "🔍" },
        { key: "estimate", label: "견적서 작성", icon: "🧮", soon: true },
      ],
    },
    {
      group: "공사관리",
      items: [{ key: "billing", label: "기성·수금 관리", icon: "💰", soon: true }],
    },
    { group: "", items: [{ key: "settings", href: "settings.html", label: "설정·백업", icon: "⚙️" }] },
  ];

  function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, (m) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
  }

  /* ---------- 사이드바 렌더 ---------- */
  function renderSidebar(activeKey) {
    const groups = NAV.map((g) => {
      const items = g.items.map((it) => {
        if (it.soon) {
          return `<span class="nav-item disabled"><span>${it.icon}</span>${esc(it.label)}<span class="nav-soon">준비중</span></span>`;
        }
        const cls = it.key === activeKey ? "nav-item active" : "nav-item";
        return `<a class="${cls}" href="${it.href}"><span>${it.icon}</span>${esc(it.label)}</a>`;
      }).join("");
      const title = g.group ? `<div class="nav-group-title">${esc(g.group)}</div>` : "";
      return `<div class="nav-group">${title}${items}</div>`;
    }).join("");

    return `
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-brand">공무 플랫폼<small>공사부 업무관리 · MVP</small></div>
        ${groups}
        <div class="sidebar-foot">dujon_nice v0.1<br>데이터는 이 브라우저에만 저장됩니다</div>
      </aside>
      <div class="sidebar-backdrop" id="sidebarBackdrop"></div>`;
  }

  function init(activeKey, pageTitle) {
    document.body.insertAdjacentHTML("afterbegin", renderSidebar(activeKey));
    const sb = document.getElementById("sidebar");
    const bd = document.getElementById("sidebarBackdrop");
    document.querySelectorAll("[data-menu-toggle]").forEach((btn) =>
      btn.addEventListener("click", () => { sb.classList.toggle("open"); bd.classList.toggle("show"); }));
    bd.addEventListener("click", () => { sb.classList.remove("open"); bd.classList.remove("show"); });
    if (pageTitle) document.title = `${pageTitle} — 공무 플랫폼`;
  }

  /* ---------- 토스트 ---------- */
  function toast(msg, type = "") {
    let wrap = document.querySelector(".toast-wrap");
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.className = "toast-wrap";
      document.body.appendChild(wrap);
    }
    const el = document.createElement("div");
    el.className = `toast ${type}`;
    el.textContent = msg;
    wrap.appendChild(el);
    setTimeout(() => el.remove(), 3200);
  }

  /* ---------- 모달 ---------- */
  function openModal(id) {
    document.getElementById(id)?.classList.add("show");
  }
  function closeModal(id) {
    document.getElementById(id)?.classList.remove("show");
  }
  function bindModalClose() {
    document.querySelectorAll(".modal-backdrop").forEach((b) => {
      b.addEventListener("click", (e) => { if (e.target === b) b.classList.remove("show"); });
      b.querySelectorAll("[data-close]").forEach((btn) =>
        btn.addEventListener("click", () => b.classList.remove("show")));
    });
  }

  /* ---------- 날짜 유틸 ---------- */
  function todayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }
  function fmtDate(iso) {
    if (!iso) return "-";
    return String(iso).slice(0, 10);
  }
  function fmtShort(iso) {
    if (!iso) return "-";
    const s = String(iso).slice(5, 10);
    return s.replace("-", "/");
  }
  /* D-day: 양수=남음, 0=오늘, 음수=지남 */
  function dday(dateStr) {
    if (!dateStr) return null;
    const t = new Date(todayStr());
    const d = new Date(String(dateStr).slice(0, 10));
    return Math.round((d - t) / 86400000);
  }
  function ddayBadge(dateStr) {
    const n = dday(dateStr);
    if (n === null) return "";
    if (n < 0) return `<span class="badge red">D+${-n} 지연</span>`;
    if (n === 0) return `<span class="badge red">D-Day</span>`;
    if (n <= 3) return `<span class="badge orange">D-${n}</span>`;
    return `<span class="badge gray">D-${n}</span>`;
  }
  /* 해당 날짜가 속한 주의 월요일/금요일 (주간보고 기간) */
  function weekRange(dateStr) {
    const d = new Date(dateStr || todayStr());
    const day = d.getDay(); // 0=일
    const mon = new Date(d);
    mon.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
    const fri = new Date(mon);
    fri.setDate(mon.getDate() + 4);
    const f = (x) => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
    return { start: f(mon), end: f(fri) };
  }
  function addDays(dateStr, n) {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + n);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  /* ---------- 도메인 배지 ---------- */
  const BADGE_MAP = {
    // Task
    "대기": "gray", "진행": "blue", "완료": "green",
    "높음": "red", "보통": "orange", "낮음": "gray",
    // Document
    "접수": "gray", "처리중": "blue", "회신대기": "orange",
    "수신": "navy", "발신": "blue",
    // Site
    "예정": "gray", "진행중": "blue", "준공": "green",
    // Checklist (계획서 4-2: 해당없음/준비중/제출/보완요청/완료)
    "해당없음": "gray", "준비중": "blue", "제출": "navy", "보완요청": "orange",
    // Subcontract
    "검토중": "gray", "계약": "blue", "통보완료": "green", "변경통보필요": "red",
  };
  function badge(value) {
    if (!value) return "";
    const color = BADGE_MAP[value] || "gray";
    return `<span class="badge ${color}">${esc(value)}</span>`;
  }

  /* ---------- 셀렉트 옵션 (현장/담당자) ---------- */
  function siteOptions(selectedId, emptyLabel = "현장 선택") {
    const sites = Store.list("sites");
    return `<option value="">${esc(emptyLabel)}</option>` + sites.map((s) =>
      `<option value="${s.id}" ${s.id === selectedId ? "selected" : ""}>${esc(s.name)}</option>`).join("");
  }
  function personOptions(selectedId, roleFilter, emptyLabel = "담당 선택") {
    const people = Store.list("people", (p) => p.active !== false && (!roleFilter || p.role === roleFilter));
    return `<option value="">${esc(emptyLabel)}</option>` + people.map((p) =>
      `<option value="${p.id}" ${p.id === selectedId ? "selected" : ""}>${esc(p.name)} ${esc(p.rank || "")}</option>`).join("");
  }
  function siteName(id) { return Store.get("sites", id)?.name || "-"; }
  function personName(id) {
    const p = Store.get("people", id);
    return p ? `${p.name}${p.rank ? " " + p.rank : ""}` : "-";
  }

  /* ---------- CDN 로드 확인 (RULES.md §1: 조용한 실패 금지) ---------- */
  function requireLib(globalName, libLabel) {
    if (typeof window[globalName] === "undefined") {
      toast(`${libLabel} 라이브러리를 불러오지 못했습니다. 인터넷 연결을 확인하세요.`, "error");
      return false;
    }
    return true;
  }

  return {
    NAV, esc, init, toast,
    openModal, closeModal, bindModalClose,
    todayStr, fmtDate, fmtShort, dday, ddayBadge, weekRange, addDays,
    badge, siteOptions, personOptions, siteName, personName,
    requireLib,
  };
})();
