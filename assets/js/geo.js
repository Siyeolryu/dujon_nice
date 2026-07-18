/* ============================================================
   geo.js — 지도·거리·행정구역 유틸
   - 카카오맵 SDK 동적 로드 (키는 Store.getMeta().kakaoKey — 하드코딩 금지)
   - 하버사인 직선거리, 30km 배정 판정 (기준점: 소장의 "현재 배정 현장")
   ============================================================ */

const Geo = (() => {
  const ASSIGN_LIMIT_KM = 30;

  /* 두 좌표 간 직선거리 (km) */
  function haversineKm(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const rad = (x) => (x * Math.PI) / 180;
    const dLat = rad(lat2 - lat1);
    const dLng = rad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  /* 카카오맵 SDK 동적 로드. 키 없으면 reject("no-key") */
  let sdkPromise = null;
  function loadKakao() {
    if (sdkPromise) return sdkPromise;
    const key = Store.getMeta().kakaoKey;
    if (!key) return Promise.reject(new Error("no-key"));
    sdkPromise = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(key)}&autoload=false&libraries=services`;
      s.onload = () => kakao.maps.load(() => resolve(kakao));
      s.onerror = () => { sdkPromise = null; reject(new Error("load-fail")); };
      document.head.appendChild(s);
    });
    return sdkPromise;
  }

  /* 주소 → { lat, lng, sido, sigungu }. SDK 로드 후 사용 */
  function geocode(address) {
    return new Promise((resolve, reject) => {
      const geocoder = new kakao.maps.services.Geocoder();
      geocoder.addressSearch(address, (result, status) => {
        if (status === kakao.maps.services.Status.OK && result[0]) {
          const r = result[0];
          const addr = r.address || r.road_address || {};
          resolve({
            lat: parseFloat(r.y),
            lng: parseFloat(r.x),
            sido: addr.region_1depth_name || "",
            sigungu: addr.region_2depth_name || "",
          });
        } else {
          reject(new Error("주소를 찾지 못했습니다: " + address));
        }
      });
    });
  }

  /* 시/군 구분 라벨: "수원시", "홍천군" 등 2depth 그대로. 시·군 유형 반환 */
  function regionType(sigungu) {
    if (!sigungu) return "";
    if (sigungu.includes("군")) return "군";
    return "시";
  }

  /* 소장의 현재 배정 현장 목록 (진행중 우선, 없으면 예정 포함) */
  function currentSitesOf(personId) {
    const all = Store.list("sites", (s) => s.siteManagerId === personId && s.status !== "준공");
    const active = all.filter((s) => s.status === "진행중");
    return active.length ? active : all;
  }

  /* 기준 소장의 현재 현장 → 대상 현장 거리 판정
     반환: { km, baseSiteName, ok } | null (좌표 없음) */
  function assignJudge(personId, targetSite) {
    if (targetSite.lat == null || targetSite.lng == null) return null;
    const bases = currentSitesOf(personId).filter((s) => s.lat != null && s.lng != null && s.id !== targetSite.id);
    if (!bases.length) return { km: null, baseSiteName: null, ok: true }; // 현재 현장 없음 → 제약 없음
    let best = null;
    bases.forEach((b) => {
      const km = haversineKm(b.lat, b.lng, targetSite.lat, targetSite.lng);
      if (!best || km < best.km) best = { km, baseSiteName: b.name };
    });
    best.ok = best.km < ASSIGN_LIMIT_KM;
    return best;
  }

  return { ASSIGN_LIMIT_KM, haversineKm, loadKakao, geocode, regionType, currentSitesOf, assignJudge };
})();
