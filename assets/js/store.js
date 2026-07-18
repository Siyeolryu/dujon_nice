/* ============================================================
   store.js — 정형 데이터 계층 (단일 진실 원천)
   - 저장: localStorage["dujon.db"] 단일 JSON (schemaVersion 포함)
   - 페이지는 반드시 이 모듈만 경유한다 (RULES.md §2)
   - 이 공개 API 시그니처는 계약이다. 연말 Supabase 어댑터도 동일 시그니처로 교체.
   ============================================================ */

const Store = (() => {
  const KEY = "dujon.db";
  const SCHEMA_VERSION = 1;
  const COLLECTIONS = [
    "sites", "people", "tasks", "documents",
    "events", "reports", "drawings", "measurements",
  ];

  function emptyDB() {
    const db = {
      schemaVersion: SCHEMA_VERSION,
      meta: { appVersion: "0.1.0", owner: "", ownerRank: "", kakaoKey: "", exportedAt: null },
    };
    COLLECTIONS.forEach((c) => (db[c] = []));
    return db;
  }

  /* 스키마 변경 시: SCHEMA_VERSION 증가 + 여기에 마이그레이션 케이스 추가 (RULES.md §2) */
  function migrate(db) {
    if (!db.schemaVersion) db.schemaVersion = 1;
    // switch (db.schemaVersion) { case 1: ...; db.schemaVersion = 2; }
    COLLECTIONS.forEach((c) => { if (!Array.isArray(db[c])) db[c] = []; });
    if (!db.meta) db.meta = emptyDB().meta;
    return db;
  }

  let cache = null;

  function load() {
    if (cache) return cache;
    try {
      const raw = localStorage.getItem(KEY);
      cache = raw ? migrate(JSON.parse(raw)) : emptyDB();
    } catch (e) {
      console.error("dujon.db 로드 실패", e);
      cache = emptyDB();
    }
    return cache;
  }

  function save(db) {
    cache = db || cache;
    localStorage.setItem(KEY, JSON.stringify(cache));
  }

  function now() { return new Date().toISOString(); }

  /* ---------- 컬렉션 CRUD ---------- */

  function list(col, filterFn) {
    const arr = load()[col] || [];
    return filterFn ? arr.filter(filterFn) : arr.slice();
  }

  function get(col, id) {
    return (load()[col] || []).find((x) => x.id === id) || null;
  }

  function add(col, obj) {
    const db = load();
    const item = { ...obj, id: crypto.randomUUID(), createdAt: now(), updatedAt: now() };
    db[col].push(item);
    save(db);
    return item;
  }

  function update(col, id, patch) {
    const db = load();
    const idx = db[col].findIndex((x) => x.id === id);
    if (idx === -1) return null;
    db[col][idx] = { ...db[col][idx], ...patch, id, updatedAt: now() };
    save(db);
    return db[col][idx];
  }

  function remove(col, id) {
    const db = load();
    const before = db[col].length;
    db[col] = db[col].filter((x) => x.id !== id);
    save(db);
    return db[col].length < before;
  }

  /* ---------- 메타 ---------- */

  function getMeta() { return load().meta; }
  function setMeta(patch) {
    const db = load();
    db.meta = { ...db.meta, ...patch };
    save(db);
    return db.meta;
  }

  /* ---------- 백업 ---------- */

  function exportJSON() {
    const db = load();
    db.meta.exportedAt = now();
    save(db);
    const blob = new Blob([JSON.stringify(db, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    const d = new Date();
    const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
    a.href = URL.createObjectURL(blob);
    a.download = `dujon-backup-${stamp}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function importJSON(obj) {
    if (!obj || typeof obj !== "object" || !("schemaVersion" in obj)) {
      throw new Error("올바른 백업 파일이 아닙니다 (schemaVersion 없음).");
    }
    if (obj.schemaVersion > SCHEMA_VERSION) {
      throw new Error(`백업 버전(${obj.schemaVersion})이 앱 버전(${SCHEMA_VERSION})보다 높습니다. 앱을 업데이트하세요.`);
    }
    cache = migrate(obj);
    save(cache);
    return cache;
  }

  function resetAll() {
    cache = emptyDB();
    save(cache);
  }

  return {
    SCHEMA_VERSION, COLLECTIONS,
    load, save, migrate,
    list, get, add, update, remove,
    getMeta, setMeta,
    exportJSON, importJSON, resetAll,
  };
})();
