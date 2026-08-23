(function () {
  const statusEl = document.getElementById('sale-status');
  const filtersEl = document.getElementById('sale-filters');
  const gridEl = document.getElementById('sale-grid');
  let activeCategory = 'All';

  function money(price) {
    if (price === null || price === undefined) return null;
    return price === 0 ? 'free' : '$' + price;
  }

  function card(item) {
    const a = document.createElement('a');
    a.href = '/movingoutsale/' + item.id;
    a.className = 'sale-card';
    a.dataset.category = item.category || 'Other';

    const thumb = document.createElement('div');
    thumb.className = 'sale-card-thumb';
    if (item.photo) {
      const img = document.createElement('img');
      img.src = item.photo;
      img.alt = item.name || 'item photo';
      img.loading = 'lazy';
      thumb.appendChild(img);
    }
    a.appendChild(thumb);

    const title = document.createElement('span');
    title.className = 'sale-card-title';
    title.textContent = item.name || 'untitled item';
    a.appendChild(title);

    const meta = document.createElement('span');
    meta.className = 'sale-card-meta';
    const price = money(item.price);
    meta.textContent = [item.category, price].filter(Boolean).join(' · ');
    a.appendChild(meta);

    return a;
  }

  function applyFilter() {
    Array.from(gridEl.children).forEach((card) => {
      card.hidden = activeCategory !== 'All' && card.dataset.category !== activeCategory;
    });
    Array.from(filtersEl.children).forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.category === activeCategory);
    });
  }

  function filterButton(category) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'sale-filter-btn';
    btn.dataset.category = category;
    btn.textContent = category;
    btn.addEventListener('click', () => {
      activeCategory = category;
      applyFilter();
    });
    return btn;
  }

  fetch('/api/items')
    .then((res) => {
      if (!res.ok) throw new Error('bad response');
      return res.json();
    })
    .then((items) => {
      const visible = Array.isArray(items) ? items.filter((item) => item.name) : [];
      if (visible.length === 0) {
        statusEl.textContent = 'Nothing available right now — check back soon.';
        return;
      }
      statusEl.remove();

      const categories = Array.from(new Set(visible.map((item) => item.category || 'Other'))).sort();
      const allBtn = filterButton('All');
      allBtn.classList.add('is-active');
      filtersEl.appendChild(allBtn);
      categories.forEach((category) => filtersEl.appendChild(filterButton(category)));

      visible.forEach((item) => gridEl.appendChild(card(item)));
      applyFilter();
    })
    .catch(() => {
      statusEl.textContent = 'Couldn’t load items right now — try refreshing.';
    });
})();
