(function () {
  const statusEl = document.getElementById('sale-status');
  const gridEl = document.getElementById('sale-grid');

  function money(price) {
    if (price === null || price === undefined) return null;
    return price === 0 ? 'free' : '$' + price;
  }

  function card(item) {
    const a = document.createElement('a');
    a.href = '/movingoutsale/' + item.id;
    a.className = 'sale-card';

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

  fetch('/api/items')
    .then((res) => {
      if (!res.ok) throw new Error('bad response');
      return res.json();
    })
    .then((items) => {
      if (!Array.isArray(items) || items.length === 0) {
        statusEl.textContent = 'Nothing available right now — check back soon.';
        return;
      }
      statusEl.remove();
      items
        .filter((item) => item.name)
        .forEach((item) => gridEl.appendChild(card(item)));
    })
    .catch(() => {
      statusEl.textContent = 'Couldn’t load items right now — try refreshing.';
    });
})();
