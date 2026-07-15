// MINIMAL FUNCTIONALITY
document.addEventListener('DOMContentLoaded', function() {
    console.log('linlinlin.online loaded');
    
    // Add info-page class to body if on info page
    if (window.location.pathname.includes('info') || window.location.pathname.endsWith('/info') || document.querySelector('.accordion-section')) {
        document.body.classList.add('info-page');
    }
    
    // Accordion functionality for info page
    const accordionSections = document.querySelectorAll('.accordion-section');
    
    accordionSections.forEach((section, index) => {
        section.addEventListener('click', function() {
            const isActive = this.classList.contains('active');
            
            // Close all sections
            accordionSections.forEach(s => s.classList.remove('active'));
            
            // Open clicked section if it wasn't already active
            if (!isActive) {
                this.classList.add('active');
            }
        });
        
    });
    
    // Optional: Open first section by default
    if (accordionSections.length > 0 && window.location.pathname.includes('info')) {
        // accordionSections[0].classList.add('active');
    }
    
    // Highlight matching project tile when clicking projects submenu
    const menu = document.querySelector('.projects-menu-list');
    const gallery = document.querySelector('.projects-gallery');
    if (menu && gallery) {
        const tiles = Array.from(gallery.querySelectorAll('.projects-gallery-item'));
        const tilesById = {};
        tiles.forEach(t => { if (t.id) tilesById[t.id] = t; });

        function setActiveTile(id, source) {
            tiles.forEach(t => t.classList.toggle('is-highlighted', t.id === id));
        }

        function handleMenuClick(e) {
            const href = this.getAttribute('href') || '';
            if (!href.startsWith('#')) return;
            const id = href.slice(1);
            if (tilesById[id]) {
                setActiveTile(id, 'click');
            }
        }

        menu.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', handleMenuClick);
        });

        // On load + hash changes, sync highlight with URL fragment
        function syncFromHash(source) {
            const hash = window.location.hash;
            if (!hash || !hash.startsWith('#')) return;
            const id = hash.slice(1);
            if (tilesById[id]) {
                setActiveTile(id, source);
            }
        }
        syncFromHash('initial');
        window.addEventListener('hashchange', () => syncFromHash('hashchange'));
    }
});

// Mobile submenu toggle (touch devices don't have :hover)
if ('ontouchstart' in window) {
    document.querySelectorAll('.projects-menu-item > a').forEach(function(link) {
        link.addEventListener('click', function(e) {
            var item = this.closest('.projects-menu-item');
            if (item.querySelector('.projects-submenu')) {
                e.preventDefault();
                var isOpen = item.classList.contains('submenu-open');
                document.querySelectorAll('.projects-menu-item').forEach(function(i) {
                    i.classList.remove('submenu-open');
                });
                if (!isOpen) item.classList.add('submenu-open');
            }
        });
    });

    document.addEventListener('click', function(e) {
        if (!e.target.closest('.projects-menu-item')) {
            document.querySelectorAll('.projects-menu-item').forEach(function(i) {
                i.classList.remove('submenu-open');
            });
        }
    });
}

// Password protection for links
function passwordProtect(url) {
    const password = prompt('Enter password:');
    // Replace 'your-password-here' with your actual password
    if (password === 'twentytwentysix') {
        window.open(url, '_blank');
    } else if (password !== null) {
        alert('Incorrect password');
    }
    return false;
}


// ============================================================
// ADAPTIVE PAGE DEMO (projects page only)
// The page watches where you hover, infers what you're drawn to,
// quietly reorders itself around you — then discloses it.
// Session-only: nothing leaves the browser, nothing persists past the tab.
// ============================================================
(function () {
    const content = document.querySelector('.content');
    const sections = Array.from(document.querySelectorAll('.projects-section'));
    if (!content || !sections.length) return;

    const DWELL_KEY = 'adapt-dwell-v1';
    const DONE_KEY = 'adapt-done-v1';
    const originalOrder = sections.map(s => s.dataset.section);
    const sectionNames = {};
    sections.forEach(s => {
        sectionNames[s.dataset.section] = s.querySelector('.projects-section-title').textContent.trim();
    });

    let dwell = {};
    try { dwell = JSON.parse(sessionStorage.getItem(DWELL_KEY)) || {}; } catch (e) { dwell = {}; }
    let adapted = sessionStorage.getItem(DONE_KEY) === '1';
    let lastMove = { promoted: null, demoted: null };

    const tiles = Array.from(document.querySelectorAll('.projects-gallery-item'));
    const disclosure = document.getElementById('adapt-disclosure');
    const toggle = document.getElementById('adapt-toggle');
    const panel = document.getElementById('adapt-panel');

    function save() {
        try { sessionStorage.setItem(DWELL_KEY, JSON.stringify(dwell)); } catch (e) {}
    }

    function totalDwell() {
        return Object.values(dwell).reduce((a, b) => a + b, 0);
    }

    function touchedCount() {
        return Object.values(dwell).filter(v => v > 300).length;
    }

    function sectionDwell(section) {
        return Array.from(section.querySelectorAll('.projects-gallery-item'))
            .reduce((sum, t) => sum + (dwell[t.id] || 0), 0);
    }

    function rankedSections() {
        return sections.slice().sort((a, b) => {
            const diff = sectionDwell(b) - sectionDwell(a);
            if (diff !== 0) return diff;
            return originalOrder.indexOf(a.dataset.section) - originalOrder.indexOf(b.dataset.section);
        });
    }

    function applyOrder(withFade) {
        const ranked = rankedSections();
        const before = Array.from(content.querySelectorAll('.projects-section')).map(s => s.dataset.section);
        const after = ranked.map(s => s.dataset.section);

        // biggest climber / biggest faller, for the disclosure panel
        let bestUp = null, bestDown = null, up = 0, down = 0;
        after.forEach((id, i) => {
            const delta = before.indexOf(id) - i;
            if (delta > up) { up = delta; bestUp = id; }
            if (delta < down) { down = delta; bestDown = id; }
        });
        if (bestUp) lastMove.promoted = sectionNames[bestUp];
        if (bestDown) lastMove.demoted = sectionNames[bestDown];

        const reorder = () => {
            ranked.forEach(s => content.appendChild(s));
            ranked.forEach(section => {
                const gallery = section.querySelector('.projects-gallery');
                const items = Array.from(gallery.querySelectorAll('.projects-gallery-item'));
                items.slice().sort((a, b) => (dwell[b.id] || 0) - (dwell[a.id] || 0))
                    .forEach(item => gallery.appendChild(item));
            });
        };

        if (withFade) {
            sections.forEach(s => s.classList.add('adapt-fading'));
            setTimeout(() => {
                reorder();
                sections.forEach(s => s.classList.remove('adapt-fading'));
            }, 420);
        } else {
            reorder();
        }
    }

    function updatePanel() {
        if (!panel || !adapted) return;
        const total = totalDwell();
        const shares = rankedSections().map(s => {
            const pct = total > 0 ? Math.round((sectionDwell(s) / total) * 100) : 0;
            return sectionNames[s.dataset.section].toLowerCase() + ' ' + pct + '%';
        });
        const seconds = (total / 1000).toFixed(1);
        let html = '<p>inferred interest: ' + shares.join(' · ') + '</p>';
        if (lastMove.promoted || lastMove.demoted) {
            html += '<p>' +
                (lastMove.promoted ? 'promoted: ' + lastMove.promoted.toLowerCase() : '') +
                (lastMove.promoted && lastMove.demoted ? ' · ' : '') +
                (lastMove.demoted ? 'demoted: ' + lastMove.demoted.toLowerCase() : '') + '</p>';
        }
        html += '<p>read from ' + seconds + 's of hovering across ' + touchedCount() + ' projects. it never asked — that is the point.</p>';
        html += '<p><button class="adapt-reset" type="button">forget me and put everything back</button></p>';
        panel.innerHTML = html;
        panel.querySelector('.adapt-reset').addEventListener('click', () => {
            sessionStorage.removeItem(DWELL_KEY);
            sessionStorage.removeItem(DONE_KEY);
            location.reload();
        });
    }

    function reveal() {
        if (disclosure) disclosure.hidden = false;
    }

    function maybeAdapt() {
        if (adapted) return;
        if (totalDwell() < 6000 || touchedCount() < 4) return;
        adapted = true;
        sessionStorage.setItem(DONE_KEY, '1');
        applyOrder(true);
        reveal();
        updatePanel();
    }

    // dwell tracking
    let enterAt = null, currentTile = null;
    tiles.forEach(tile => {
        tile.addEventListener('mouseenter', () => {
            currentTile = tile;
            enterAt = performance.now();
        });
        tile.addEventListener('mouseleave', () => {
            if (currentTile === tile && enterAt !== null) {
                dwell[tile.id] = (dwell[tile.id] || 0) + (performance.now() - enterAt);
                enterAt = null;
                currentTile = null;
                save();
                maybeAdapt();
                if (adapted) updatePanel();
            }
        });
    });

    if (toggle && panel) {
        toggle.addEventListener('click', () => {
            panel.hidden = !panel.hidden;
        });
    }

    // returning within the same session: re-apply silently
    if (adapted) {
        applyOrder(false);
        reveal();
        updatePanel();
    }
})();
