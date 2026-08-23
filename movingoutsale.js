(function () {
  const statusEl = document.getElementById('sale-status');
  const filtersEl = document.getElementById('sale-filters');
  const gridEl = document.getElementById('sale-grid');
  let activeCategory = 'All';

  function money(price) {
    if (price === null || price === undefined) return null;
    return price === 0 ? 'free' : '$' + price;
  }

  function statusBanner(status) {
    if (status === 'Pending Pickup') return { text: 'reserved', tone: 'reserved' };
    if (status && status !== 'Available') return { text: 'sold', tone: 'sold' };
    return { text: 'available', tone: 'available' };
  }

  function card(item) {
    const a = document.createElement('a');
    a.href = '/movingoutsale/' + item.id;
    a.className = 'sale-card';
    a.dataset.category = item.category || 'Other';

    const thumb = document.createElement('div');
    thumb.className = 'sale-card-thumb';
    const photos = item.photos || [];
    if (photos.length) {
      const img = document.createElement('img');
      img.src = photos[0].thumb;
      img.alt = item.name || 'item photo';
      img.loading = 'lazy';
      thumb.appendChild(img);

      if (photos.length > 1) {
        let index = 0;
        const dots = document.createElement('div');
        dots.className = 'sale-card-dots';
        photos.forEach((_, i) => {
          const dot = document.createElement('span');
          dot.className = 'sale-card-dot';
          if (i === 0) dot.classList.add('is-active');
          dots.appendChild(dot);
        });

        function show(i) {
          index = (i + photos.length) % photos.length;
          img.src = photos[index].thumb;
          Array.from(dots.children).forEach((dot, dotIndex) => {
            dot.classList.toggle('is-active', dotIndex === index);
          });
        }

        function stepButton(direction, label) {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'sale-card-arrow ' + (direction < 0 ? 'sale-card-prev' : 'sale-card-next');
          btn.setAttribute('aria-label', label);
          btn.textContent = direction < 0 ? '‹' : '›';
          btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            show(index + direction);
          });
          return btn;
        }

        thumb.appendChild(stepButton(-1, 'Previous photo'));
        thumb.appendChild(stepButton(1, 'Next photo'));
        thumb.appendChild(dots);
      }
    }
    const banner = statusBanner(item.status);
    const badge = document.createElement('span');
    badge.className = 'sale-card-banner sale-card-banner--' + banner.tone;
    badge.textContent = banner.text;
    thumb.appendChild(badge);
    if (banner.tone !== 'available') a.classList.add('is-unavailable');
    a.appendChild(thumb);

    const title = document.createElement('span');
    title.className = 'sale-card-title';
    title.textContent = item.name || 'untitled item';
    a.appendChild(title);

    const meta = document.createElement('span');
    meta.className = 'sale-card-meta';
    const price = money(item.price);
    const qty = item.quantity > 1 ? 'x' + item.quantity : null;
    meta.textContent = [item.category, price, qty].filter(Boolean).join(' · ');
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
