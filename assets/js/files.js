/* ============================================================
   files.js — 파일 데이터 계층 (IndexedDB "dujon-files")
   도면 PDF 원본 blob 저장. 메타데이터는 store.js의 drawings 컬렉션.
   페이지는 반드시 이 모듈만 경유한다 (RULES.md §2).
   연말 Supabase Storage 어댑터도 동일 시그니처로 교체.
   ============================================================ */

const Files = (() => {
  const DB_NAME = "dujon-files";
  const STORE = "files";
  let dbPromise = null;

  function openDB() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(STORE)) {
          req.result.createObjectStore(STORE);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => { dbPromise = null; reject(req.error); };
    });
    return dbPromise;
  }

  function tx(mode, fn) {
    return openDB().then((db) => new Promise((resolve, reject) => {
      const t = db.transaction(STORE, mode);
      const store = t.objectStore(STORE);
      const req = fn(store);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    }));
  }

  function putFile(id, blob) { return tx("readwrite", (s) => s.put(blob, id)); }
  function getFile(id) { return tx("readonly", (s) => s.get(id)); }
  function deleteFile(id) { return tx("readwrite", (s) => s.delete(id)); }
  function listFileIds() { return tx("readonly", (s) => s.getAllKeys()); }

  return { putFile, getFile, deleteFile, listFileIds };
})();
