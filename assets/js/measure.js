/* ============================================================
   measure.js — 축척·면적·길이 계산 (순수 함수)
   좌표는 "기준 배율(scale=1) 픽셀" 기준으로 저장한다.
   화면 좌표 → 기준 좌표 변환은 (화면px / 현재줌) 으로 호출부에서 수행.
   ============================================================ */

const Measure = (() => {
  /* 두 점 거리 (px) */
  function dist(p1, p2) {
    return Math.hypot(p2.x - p1.x, p2.y - p1.y);
  }

  /* 폴리라인 총 길이 (px) */
  function polylineLengthPx(points) {
    let sum = 0;
    for (let i = 1; i < points.length; i++) sum += dist(points[i - 1], points[i]);
    return sum;
  }

  /* 폴리곤 면적 (px²) — 신발끈 공식 */
  function polygonAreaPx(points) {
    if (points.length < 3) return 0;
    let s = 0;
    for (let i = 0; i < points.length; i++) {
      const a = points[i], b = points[(i + 1) % points.length];
      s += a.x * b.y - b.x * a.y;
    }
    return Math.abs(s) / 2;
  }

  /* 축척 보정: 도면상 두 점 + 실제 거리(m) → px/m */
  function calibrate(p1, p2, realMeters) {
    const px = dist(p1, p2);
    if (!realMeters || realMeters <= 0 || px <= 0) return null;
    return px / realMeters;
  }

  /* 변환 */
  function lengthMeters(points, pxPerMeter) {
    return polylineLengthPx(points) / pxPerMeter;
  }
  function areaSqMeters(points, pxPerMeter) {
    return polygonAreaPx(points) / (pxPerMeter * pxPerMeter);
  }

  /* 표기: 소수 2자리 + 평 병기(면적) */
  function fmtArea(sqm) {
    const pyeong = sqm / 3.305785;
    return `${sqm.toFixed(2)} ㎡ (${pyeong.toFixed(1)}평)`;
  }
  function fmtLength(m) {
    return `${m.toFixed(2)} m`;
  }

  return { dist, polylineLengthPx, polygonAreaPx, calibrate, lengthMeters, areaSqMeters, fmtArea, fmtLength };
})();
