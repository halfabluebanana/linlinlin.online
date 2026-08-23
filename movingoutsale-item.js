(function () {
  const statusEl = document.getElementById('item-status');
  const detailEl = document.getElementById('item-detail');
  const id = location.pathname.split('/').filter(Boolean).pop();

  function money(price) {
    if (price === null || price === undefined) return null;
    return price === 0 ? 'free' : '$' + price;
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

      if (item.photoLarge || item.photo) {
        const img = document.createElement('img');
        img.src = item.photoLarge || item.photo;
        img.alt = item.name || 'item photo';
        img.className = 'sale-item-photo';
        detailEl.appendChild(img);
      }

      const h1 = document.createElement('h1');
      h1.className = 'sale-item-title';
      h1.textContent = item.name || 'untitled item';
      detailEl.appendChild(h1);

      row('price', money(item.price));
      row('category', item.gender ? item.category + ' · ' + item.gender : item.category);
      row('condition', item.condition);
      if (item.description) row('notes', item.description);
    })
    .catch(() => {
      statusEl.textContent = 'This item isn’t available anymore — it may have sold.';
    });
})();
