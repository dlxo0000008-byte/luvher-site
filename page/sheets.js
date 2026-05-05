// 구글 시트 fetch + CSV 파싱 유틸 (main.js / admin.js 가 공유)
(function () {
  function buildCsvUrl(sheetUrl, tabName) {
    const m = String(sheetUrl || '').match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (!m) return null;
    const id = m[1];
    // gviz endpoint: 탭을 이름으로 선택, CSV 출력, 캐시 우회
    return `https://docs.google.com/spreadsheets/d/${id}/gviz/tq` +
           `?tqx=out:csv&sheet=${encodeURIComponent(tabName)}&_=${Date.now()}`;
  }

  function parseCSV(text) {
    const rows = [];
    let row = [];
    let field = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (inQuotes) {
        if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
        else if (c === '"') inQuotes = false;
        else field += c;
      } else {
        if (c === '"') inQuotes = true;
        else if (c === ',') { row.push(field); field = ''; }
        else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
        else if (c === '\r') { /* skip */ }
        else field += c;
      }
    }
    if (field !== '' || row.length) { row.push(field); rows.push(row); }
    return rows;
  }

  function rowsToProducts(rows) {
    if (!rows || rows.length < 2) return [];
    const [headerRow, ...dataRows] = rows;
    const headers = headerRow.map((h) => h.trim().toLowerCase());
    return dataRows
      .filter((r) => r.some((c) => c && c.trim()))
      .map((r) => {
        const o = {};
        headers.forEach((h, i) => { o[h] = (r[i] || '').trim(); });
        o.price = Number(String(o.price).replace(/[^\d.-]/g, '')) || 0;
        return o;
      });
  }

  function rowsToContentMap(rows) {
    if (!rows || rows.length < 2) return {};
    const [headerRow, ...dataRows] = rows;
    const headers = headerRow.map((h) => h.trim().toLowerCase());
    const keyIdx = headers.indexOf('key');
    const valIdx = headers.indexOf('value');
    if (keyIdx === -1 || valIdx === -1) return {};
    const out = {};
    dataRows.forEach((r) => {
      const k = (r[keyIdx] || '').trim();
      const v = r[valIdx];
      if (k) out[k] = (v == null ? '' : v);
    });
    return out;
  }

  async function fetchTab(sheetUrl, tabName) {
    const url = buildCsvUrl(sheetUrl, tabName);
    if (!url) throw new Error('잘못된 시트 URL입니다.');
    const res = await fetch(url, { redirect: 'follow' });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} — 시트 권한이 "링크가 있는 모든 사용자: 뷰어"인지, 탭 이름(${tabName})이 정확한지 확인하세요.`);
    }
    const text = await res.text();
    return parseCSV(text);
  }

  async function fetchProducts(sheetUrl) {
    return rowsToProducts(await fetchTab(sheetUrl, 'Products'));
  }

  async function fetchContent(sheetUrl) {
    return rowsToContentMap(await fetchTab(sheetUrl, 'Content'));
  }

  window.YR_SHEETS = {
    buildCsvUrl, parseCSV, rowsToProducts, rowsToContentMap,
    fetchTab, fetchProducts, fetchContent,
  };
})();
