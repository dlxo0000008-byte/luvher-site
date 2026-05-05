(function () {
  const grid = document.getElementById('product-grid');
  const formatPrice = (n) => '₩' + Number(n || 0).toLocaleString('ko-KR');

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function escapeAttr(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;').replace(/</g, '&lt;');
  }
  function safeImageUrl(s) {
    return String(s == null ? '' : s)
      .replace(/\\/g, '%5C').replace(/'/g, '%27')
      .replace(/"/g, '%22').replace(/\)/g, '%29');
  }

  // ----- Products grid -----
  function renderGrid(items) {
    if (!grid) return;
    grid.innerHTML = items.map((p) => `
      <a class="product-card" href="${escapeAttr(p.instagram)}" target="_blank" rel="noopener">
        <div class="product-image" style="background-image:url('${safeImageUrl(p.image)}')"></div>
        <div class="product-info">
          <p class="product-name">${escapeHtml(p.name)}</p>
          <p class="product-price">${formatPrice(p.price)}</p>
        </div>
      </a>
    `).join('');
    const count = document.getElementById('product-count');
    if (count) count.textContent = `${items.length} items`;
  }

  // ----- Content (Brand text, footer, etc.) -----
  function applyContent(map) {
    if (!map) return;
    document.querySelectorAll('[data-content]').forEach((el) => {
      const key = el.dataset.content;
      const v = map[key];
      if (v !== undefined && v !== '') {
        el.innerHTML = escapeHtml(String(v)).replace(/\n/g, '<br>');
      }
    });
    document.querySelectorAll('[data-href]').forEach((el) => {
      const key = el.dataset.href;
      const v = map[key];
      if (v) el.setAttribute('href', String(v));
    });
  }

  function getSheetUrl() {
    if (typeof SHEET_URL !== 'undefined' && SHEET_URL && String(SHEET_URL).trim()) {
      return String(SHEET_URL).trim();
    }
    return null;
  }

  // 1) Render fallback (products.js) immediately so page isn't empty during fetch
  if (grid) {
    const fallback = (typeof PRODUCTS !== 'undefined' ? PRODUCTS : []);
    renderGrid(fallback);
  }

  // 2) Fetch from Google Sheet (replaces fallback if successful)
  const sheetUrl = getSheetUrl();
  if (sheetUrl && window.YR_SHEETS) {
    if (grid) {
      window.YR_SHEETS.fetchProducts(sheetUrl)
        .then((items) => { if (items.length) renderGrid(items); })
        .catch((err) => { console.warn('[연려] Products 시트 로드 실패:', err.message); });
    }
    window.YR_SHEETS.fetchContent(sheetUrl)
      .then((map) => { applyContent(map); })
      .catch((err) => { console.warn('[연려] Content 시트 로드 실패:', err.message); });
  }

  // ----- Scroll reveal -----
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  // ----- Header scrolled state -----
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => {
      if (window.scrollY > 20) header.classList.add('is-scrolled');
      else header.classList.remove('is-scrolled');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }
})();
