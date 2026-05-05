(function () {
  const meta = document.getElementById('admin-meta');
  const statusCard = document.getElementById('status-card');
  const actionBar = document.getElementById('action-bar');
  const productsList = document.getElementById('products-list');
  const contentList = document.getElementById('content-list');
  const setupSection = document.getElementById('setup-section');
  const sheetInput = document.getElementById('sheet-url-input');
  const setupStatus = document.getElementById('setup-status');
  const modal = document.getElementById('export-modal');
  const exportText = document.getElementById('export-text');

  const formatPrice = (n) => '₩' + Number(n || 0).toLocaleString('ko-KR');

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function escapeAttr(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  }
  function safeImageUrl(s) {
    return String(s == null ? '' : s)
      .replace(/'/g, '%27').replace(/"/g, '%22').replace(/\)/g, '%29');
  }

  const sheetUrl = (typeof SHEET_URL !== 'undefined' && SHEET_URL && String(SHEET_URL).trim())
    ? String(SHEET_URL).trim() : null;

  bootstrap();

  async function bootstrap() {
    if (sheetUrl) {
      renderConnectedUI();
      meta.textContent = '시트에서 데이터 불러오는 중...';
      try {
        const [products, content] = await Promise.all([
          window.YR_SHEETS.fetchProducts(sheetUrl).catch((e) => { console.warn(e); return []; }),
          window.YR_SHEETS.fetchContent(sheetUrl).catch((e) => { console.warn(e); return {}; }),
        ]);
        renderProducts(products);
        renderContent(content);
        const cc = Object.keys(content).length;
        meta.textContent = `Products ${products.length}개 · Content ${cc}개 · 마지막 갱신 ${new Date().toLocaleString('ko-KR')}`;
      } catch (err) {
        meta.textContent = '로드 실패: ' + err.message;
      }
    } else {
      renderDisconnectedUI();
      const fallback = (typeof PRODUCTS !== 'undefined' ? PRODUCTS : []);
      renderProducts(fallback);
      contentList.innerHTML = '<p class="readonly-empty">시트 미연결 — 사이트 텍스트는 코드의 기본값을 사용 중입니다.</p>';
      meta.textContent = `Products ${fallback.length}개 (코드 기본값) · 시트 미연결`;
      if (setupSection) setupSection.open = true;
    }
  }

  function renderConnectedUI() {
    statusCard.innerHTML = `
      <span class="status-dot connected"></span>
      <div class="status-info">
        <p class="status-title">구글 시트 연결됨</p>
        <p class="status-sub">${escapeHtml(sheetUrl)}</p>
      </div>
    `;
    actionBar.innerHTML = `
      <a class="btn btn-primary" href="${escapeAttr(sheetUrl)}" target="_blank" rel="noopener">구글 시트에서 편집 ↗</a>
      <button type="button" class="btn" id="btn-refresh">새로고침 ↻</button>
    `;
    document.getElementById('btn-refresh').addEventListener('click', () => bootstrap());
  }

  function renderDisconnectedUI() {
    statusCard.innerHTML = `
      <span class="status-dot disconnected"></span>
      <div class="status-info">
        <p class="status-title">구글 시트 미연결</p>
        <p class="status-sub">아래 가이드를 따라 시트를 만들고 URL을 등록하세요.</p>
      </div>
    `;
    actionBar.innerHTML = '';
  }

  function renderProducts(items) {
    if (!items.length) {
      productsList.innerHTML = '<p class="readonly-empty">제품이 없습니다. 시트의 Products 탭에 데이터를 추가하세요.</p>';
      return;
    }
    productsList.innerHTML = items.map((p, i) => `
      <div class="readonly-card">
        <div class="readonly-thumb" style="background-image:url('${safeImageUrl(p.image || '')}')"></div>
        <div class="readonly-info">
          <p class="readonly-name">${i + 1}. ${escapeHtml(p.name || '(이름 없음)')}</p>
          <p class="readonly-price">${formatPrice(p.price)}</p>
          ${p.instagram ? `<a class="readonly-link" href="${escapeAttr(p.instagram)}" target="_blank" rel="noopener">${escapeHtml(p.instagram)}</a>` : '<span class="readonly-link is-empty">인스타 링크 없음</span>'}
        </div>
      </div>
    `).join('');
  }

  function renderContent(map) {
    const keys = Object.keys(map || {});
    if (!keys.length) {
      contentList.innerHTML = '<p class="readonly-empty">Content 탭에 데이터가 없습니다. (사이트는 코드의 기본 텍스트 사용)</p>';
      return;
    }
    contentList.innerHTML = `
      <table class="content-table">
        <thead><tr><th>Key</th><th>Value</th></tr></thead>
        <tbody>
          ${keys.map((k) => `
            <tr>
              <td><code>${escapeHtml(k)}</code></td>
              <td>${escapeHtml(map[k]).replace(/\n/g, '<br>')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  document.getElementById('btn-test').addEventListener('click', async () => {
    const url = sheetInput.value.trim();
    if (!url) { setStatus('시트 URL을 입력하세요.', 'error'); return; }
    setStatus('테스트 중...', '');
    try {
      const products = await window.YR_SHEETS.fetchProducts(url)
        .catch((e) => { throw new Error('Products 탭 — ' + e.message); });
      const content = await window.YR_SHEETS.fetchContent(url)
        .catch((e) => { console.warn('Content 탭 (선택사항) 로드 실패:', e.message); return {}; });
      const cc = Object.keys(content).length;
      setStatus(`✓ 성공 — Products ${products.length}개, Content ${cc}개 키. 아래 코드를 복사해 sheets-config.js에 저장하세요.`, 'success');
      exportText.value = generateConfigCode(url);
      modal.hidden = false;
    } catch (err) {
      setStatus('실패: ' + err.message, 'error');
    }
  });

  document.getElementById('btn-close-modal').addEventListener('click', () => { modal.hidden = true; });
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.hidden = true; });

  document.getElementById('btn-copy').addEventListener('click', async () => {
    const btn = document.getElementById('btn-copy');
    const orig = btn.textContent;
    try {
      await navigator.clipboard.writeText(exportText.value);
    } catch (e) {
      exportText.select();
      document.execCommand('copy');
    }
    btn.textContent = '복사됨 ✓';
    setTimeout(() => { btn.textContent = orig; }, 1500);
  });

  function generateConfigCode(url) {
    return `// 구글 시트 연동 설정 — page/admin.html 에서 생성됨
const SHEET_URL = ${JSON.stringify(url)};
`;
  }

  function setStatus(msg, type) {
    setupStatus.textContent = msg;
    setupStatus.className = 'setup-status' + (type ? ' is-' + type : '');
  }
})();
