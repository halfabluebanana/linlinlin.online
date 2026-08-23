(function () {
  const statusEl = document.getElementById('item-status');
  const detailEl = document.getElementById('item-detail');
  const id = location.pathname.split('/').filter(Boolean).pop();

  function money(price) {
    if (price === null || price === undefined) return null;
    return price === 0 ? 'free' : '$' + price;
  }

  function statusLabel(status) {
    if (status === 'Pending Pickup') return { text: 'reserved', tone: 'reserved' };
    if (status && status !== 'Available') return { text: 'sold', tone: 'sold' };
    return { text: 'available', tone: 'available' };
  }

  function row(label, value) {
    if (!value) return;
    const p = document.createElement('p');
    p.className = 'sale-item-row';
    const strong = document.createElement('strong');
    strong.textContent = label + ': ';
    p.appendChild(strong);
    p.appendChild(document.createTextNode(value));
    detailEl.appendChild(p);
  }

  function carousel(photos) {
    let index = 0;
    const wrap = document.createElement('div');
    wrap.className = 'sale-carousel';

    const img = document.createElement('img');
    img.className = 'sale-item-photo';
    wrap.appendChild(img);

    const dots = document.createElement('div');
    dots.className = 'sale-carousel-dots';

    function show(i) {
      index = (i + photos.length) % photos.length;
      img.src = photos[index].full;
      Array.from(dots.children).forEach((dot, dotIndex) => {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    if (photos.length > 1) {
      const prev = document.createElement('button');
      prev.type = 'button';
      prev.className = 'sale-carousel-arrow sale-carousel-prev';
      prev.setAttribute('aria-label', 'Previous photo');
      prev.textContent = '‹';
      prev.addEventListener('click', () => show(index - 1));

      const next = document.createElement('button');
      next.type = 'button';
      next.className = 'sale-carousel-arrow sale-carousel-next';
      next.setAttribute('aria-label', 'Next photo');
      next.textContent = '›';
      next.addEventListener('click', () => show(index + 1));

      wrap.appendChild(prev);
      wrap.appendChild(next);
    }

    if (photos.length > 1) {
      photos.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'sale-carousel-dot';
        dot.setAttribute('aria-label', 'Photo ' + (i + 1));
        dot.addEventListener('click', () => show(i));
        dots.appendChild(dot);
      });
      wrap.appendChild(dots);
    }

    show(0);
    return wrap;
  }

  fetch('/api/items?id=' + encodeURIComponent(id))
    .then((res) => {
      if (res.status === 404) throw new Error('not found');
      if (!res.ok) throw new Error('bad response');
      return res.json();
    })
    .then((item) => {
      if (!item) throw new Error('not found');
      statusEl.remove();
      document.title = (item.name || 'item') + ' | moving out sale';

      if (item.photos && item.photos.length) {
        detailEl.appendChild(carousel(item.photos));
      }

      const h1 = document.createElement('h1');
      h1.className = 'sale-item-title';
      h1.textContent = item.name || 'untitled item';
      detailEl.appendChild(h1);

      const banner = statusLabel(item.status);
      const badge = document.createElement('p');
      badge.className = 'sale-item-banner sale-item-banner--' + banner.tone;
      badge.textContent = banner.text;
      detailEl.appendChild(badge);

      row('price', money(item.price));
      row('category', item.gender ? item.category + ' · ' + item.gender : item.category);
      row('condition', item.condition);
      row('description', item.description);
    })
    .catch(() => {
      statusEl.textContent = 'This item isn’t available anymore — it may have sold.';
    });
})();
