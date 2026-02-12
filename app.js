/**
 * Sonero - Magazin Ceasuri Premium
 * JavaScript modern: ES6+, Modules, LocalStorage, Intersection Observer
 */

// ========== Storage Keys ==========
const STORAGE_KEYS = {
    WATCHES: 'sonero_watches',
    NEWS: 'sonero_news',
    ORDERS: 'sonero_orders'
};

// ========== Default Data ==========
const DEFAULT_WATCHES = [
    {
        id: crypto.randomUUID(),
        name: 'Sonero Classic Gold',
        price: 2450,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
        desc: 'Ceas clasic cu cadran auriu, pentru evenimente de neuitat.'
    },
    {
        id: crypto.randomUUID(),
        name: 'Sonero Sport Chrono',
        price: 1890,
        image: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=600',
        desc: 'Cronograf sportiv, rezistent la apă până la 100m.'
    },
    {
        id: crypto.randomUUID(),
        name: 'Sonero Minimalist',
        price: 1290,
        image: 'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=600',
        desc: 'Design minimalist, elegante pentru fiecare zi.'
    }
];

const DEFAULT_NEWS = [
    {
        id: crypto.randomUUID(),
        title: 'Bine ai venit la Sonero!',
        type: 'noutate',
        desc: 'Descoperă colecția noastră premium de ceasuri și găsește piesă perfectă pentru tine.',
        date: new Date().toISOString().split('T')[0]
    }
];

// ========== Storage Utilities ==========
const storage = {
    get(key, fallback = []) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : fallback;
        } catch {
            return fallback;
        }
    },
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch {
            return false;
        }
    }
};

// ========== Toast System ==========
const toast = {
    container: null,

    init() {
        this.container = document.getElementById('toastContainer');
    },

    show(message, type = 'success') {
        if (!this.container) this.init();
        const el = document.createElement('div');
        el.className = `toast ${type}`;
        el.textContent = message;
        this.container.appendChild(el);
        setTimeout(() => {
            el.style.animation = 'toastIn 0.3s ease reverse';
            setTimeout(() => el.remove(), 300);
        }, 4000);
    }
};

// ========== UI Components ==========
const createWatchCard = (watch) => {
    const div = document.createElement('article');
    div.className = 'watch-card';
    div.setAttribute('data-animate', '');
    const mainImg = watch.images?.[0] || watch.image;
    div.innerHTML = `
        <div class="watch-card-image-wrap">
            <img src="${escapeHtml(mainImg)}" alt="${escapeHtml(watch.name)}" class="watch-image" loading="lazy"
                 onerror="this.src='https://via.placeholder.com/400?text=Sonero'">
            <button class="watch-360-btn" aria-label="Vizualizare 360°" data-watch-id="${watch.id}">
                <span class="icon-360">360°</span>
                <span>Rotire</span>
            </button>
        </div>
        <div class="watch-info">
            <h3 class="watch-name">${escapeHtml(watch.name)}</h3>
            <p class="watch-desc">${escapeHtml(watch.desc || '')}</p>
            <p class="watch-price">${formatPrice(watch.price)} RON</p>
        </div>
    `;
    return div;
};

const createNewsCard = (item) => {
    const div = document.createElement('article');
    div.className = 'news-card';
    div.setAttribute('data-animate', '');
    const dateStr = item.date ? new Date(item.date).toLocaleDateString('ro-RO') : '';
    div.innerHTML = `
        <span class="news-badge ${item.type}">${item.type}</span>
        <h3 class="news-title">${escapeHtml(item.title)}</h3>
        <p class="news-desc">${escapeHtml(item.desc)}</p>
        ${dateStr ? `<span class="news-date">${dateStr}</span>` : ''}
    `;
    return div;
};

// ========== Helpers ==========
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function formatPrice(price) {
    return new Intl.NumberFormat('ro-RO').format(price);
}

// ========== Watches Logic ==========
function loadWatches() {
    let watches = storage.get(STORAGE_KEYS.WATCHES);
    if (watches.length === 0) {
        watches = DEFAULT_WATCHES;
        storage.set(STORAGE_KEYS.WATCHES, watches);
    }
    renderWatches(watches);
}

function renderWatches(watches) {
    const grid = document.getElementById('watchesGrid');
    const placeholder = document.getElementById('watchesPlaceholder');

    if (watches.length === 0) {
        placeholder.style.display = 'block';
        grid.querySelectorAll('.watch-card').forEach(c => c.remove());
        return;
    }

    placeholder.style.display = 'none';
    grid.querySelectorAll('.watch-card').forEach(c => c.remove());

    watches.forEach((watch, i) => {
        const card = createWatchCard(watch);
        card.style.transitionDelay = `${i * 0.1}s`;
        grid.appendChild(card);
    });

    observeAnimate();
    initView360Handlers();
}

function addWatch(data) {
    const watches = storage.get(STORAGE_KEYS.WATCHES);
    const newWatch = {
        id: crypto.randomUUID(),
        name: data.watchName,
        price: Number(data.watchPrice),
        image: data.watchImage,
        desc: data.watchDesc || ''
    };
    watches.push(newWatch);
    storage.set(STORAGE_KEYS.WATCHES, watches);
    renderWatches(watches);
    renderAdminWatches();
    toast.show('Ceas adăugat cu succes!');
}

function deleteWatch(id) {
    if (!confirm('Sigur vrei să ștergi acest ceas?')) return;
    let watches = storage.get(STORAGE_KEYS.WATCHES);
    watches = watches.filter(w => w.id !== id);
    storage.set(STORAGE_KEYS.WATCHES, watches);
    renderWatches(watches);
    renderAdminWatches();
    toast.show('Ceas șters.');
}

// ========== News Logic ==========
function loadNews() {
    let news = storage.get(STORAGE_KEYS.NEWS);
    if (news.length === 0) {
        news = DEFAULT_NEWS;
        storage.set(STORAGE_KEYS.NEWS, news);
    }
    renderNews(news);
}

function renderNews(news) {
    const grid = document.getElementById('newsGrid');
    const placeholder = document.getElementById('newsPlaceholder');

    if (news.length === 0) {
        placeholder.style.display = 'block';
        grid.querySelectorAll('.news-card').forEach(c => c.remove());
        return;
    }

    placeholder.style.display = 'none';
    grid.querySelectorAll('.news-card').forEach(c => c.remove());

    news.forEach((item, i) => {
        const card = createNewsCard(item);
        card.style.transitionDelay = `${i * 0.1}s`;
        grid.appendChild(card);
    });

    observeAnimate();
}

function addNews(data) {
    const news = storage.get(STORAGE_KEYS.NEWS);
    const newItem = {
        id: crypto.randomUUID(),
        title: data.newsTitle,
        type: data.newsType || 'noutate',
        desc: data.newsDesc,
        date: data.newsDate || new Date().toISOString().split('T')[0]
    };
    news.unshift(newItem);
    storage.set(STORAGE_KEYS.NEWS, news);
    renderNews(news);
    renderAdminNews();
    toast.show('Noutate adăugată cu succes!');
}

function deleteNews(id) {
    if (!confirm('Sigur vrei să ștergi această noutate?')) return;
    let news = storage.get(STORAGE_KEYS.NEWS);
    news = news.filter(n => n.id !== id);
    storage.set(STORAGE_KEYS.NEWS, news);
    renderNews(news);
    renderAdminNews();
    toast.show('Noutate ștearsă.');
}

// ========== Orders Logic ==========
function saveOrder(data) {
    const orders = storage.get(STORAGE_KEYS.ORDERS);
    orders.push({
        id: crypto.randomUUID(),
        ...data,
        createdAt: new Date().toISOString()
    });
    storage.set(STORAGE_KEYS.ORDERS, orders);
}

// ========== Animations - Intersection Observer ==========
function observeAnimate() {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
}

// ========== Form Validation ==========
const validators = {
    name: (v) => v.length >= 2 || 'Numele trebuie să aibă cel puțin 2 caractere',
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Introdu un email valid',
    phone: (v) => /^0[0-9]{9}$/.test(v.replace(/\s/g, '')) || 'Introdu un număr valid (07xx xxx xxx)',
    details: (v) => v.length >= 10 || 'Te rugăm să descrii cererea (min. 10 caractere)'
};

function validateForm(form, rules) {
    let valid = true;
    for (const [name, validator] of Object.entries(rules)) {
        const input = form.elements[name];
        const errorEl = form.querySelector(`[data-error="${name}"]`);
        const group = input?.closest('.form-group');

        if (!input) continue;

        const value = input.value.trim();
        const message = validator(value);

        if (message) {
            valid = false;
            if (errorEl) errorEl.textContent = message;
            group?.classList.add('error');
        } else {
            if (errorEl) errorEl.textContent = '';
            group?.classList.remove('error');
        }
    }
    return valid;
}

function clearFormErrors(form) {
    form.querySelectorAll('.form-error').forEach(el => el.textContent = '');
    form.querySelectorAll('.form-group').forEach(g => g.classList.remove('error'));
}

// ========== Admin Access (hidden from regular clients) ==========
const ADMIN_STORAGE_KEY = 'sonero_admin_unlocked';
const ADMIN_SECRET = 'sonero';
const LOGO_CLICKS_NEEDED = 5;
const LOGO_CLICK_TIMEOUT = 4000;

function initAdminAccess() {
    const adminNavItem = document.getElementById('adminNavItem');
    const logo = document.getElementById('adminUnlockLogo');

    function isUnlocked() {
        return sessionStorage.getItem(ADMIN_STORAGE_KEY) === '1';
    }

    function checkUrlSecret() {
        const params = new URLSearchParams(window.location.search);
        if (params.get('admin') === ADMIN_SECRET) {
            sessionStorage.setItem(ADMIN_STORAGE_KEY, '1');
            history.replaceState({}, '', window.location.pathname);
            return true;
        }
        return false;
    }

    function unlock() {
        sessionStorage.setItem(ADMIN_STORAGE_KEY, '1');
        if (adminNavItem) adminNavItem.style.display = '';
        toast.show('Acces Admin activat.');
    }

    checkUrlSecret();
    if (isUnlocked() && adminNavItem) adminNavItem.style.display = '';

    let logoClickCount = 0;
    let logoClickTimer = null;

    logo?.addEventListener('click', () => {
        if (isUnlocked()) return;
        logoClickCount++;
        clearTimeout(logoClickTimer);
        logoClickTimer = setTimeout(() => { logoClickCount = 0; }, LOGO_CLICK_TIMEOUT);
        if (logoClickCount >= LOGO_CLICKS_NEEDED) {
            logoClickCount = 0;
            unlock();
        }
    });
}

// ========== Admin Panel ==========
function renderAdminWatches() {
    const container = document.getElementById('adminWatchesList');
    if (!container) return;
    const watches = storage.get(STORAGE_KEYS.WATCHES);
    container.innerHTML = watches.length === 0
        ? '<p class="admin-list-empty">Niciun ceas adăugat.</p>'
        : watches.map(w => `
            <div class="admin-list-item" data-id="${w.id}">
                <div class="admin-list-item-info">
                    <img src="${escapeHtml(w.image)}" alt="" class="admin-list-thumb" onerror="this.style.display='none'">
                    <div>
                        <strong>${escapeHtml(w.name)}</strong>
                        <span>${formatPrice(w.price)} RON</span>
                    </div>
                </div>
                <button type="button" class="btn-delete" data-watch-id="${w.id}" title="Șterge">×</button>
            </div>
        `).join('');
    container.querySelectorAll('.btn-delete[data-watch-id]').forEach(btn => {
        btn.onclick = () => deleteWatch(btn.dataset.watchId);
    });
}

function renderAdminNews() {
    const container = document.getElementById('adminNewsList');
    if (!container) return;
    const news = storage.get(STORAGE_KEYS.NEWS);
    container.innerHTML = news.length === 0
        ? '<p class="admin-list-empty">Nicio noutate.</p>'
        : news.map(n => `
            <div class="admin-list-item">
                <div class="admin-list-item-info">
                    <strong>${escapeHtml(n.title)}</strong>
                    <span class="admin-list-badge">${n.type}</span>
                </div>
                <button type="button" class="btn-delete" data-news-id="${n.id}" title="Șterge">×</button>
            </div>
        `).join('');
    container.querySelectorAll('.btn-delete[data-news-id]').forEach(btn => {
        btn.onclick = () => deleteNews(btn.dataset.newsId);
    });
}

const admin = {
    overlay: null,

    init() {
        this.overlay = document.getElementById('adminOverlay');
        document.querySelector('[data-admin-trigger]')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.open();
        });
        document.getElementById('adminClose')?.addEventListener('click', () => this.close());
        this.overlay?.addEventListener('click', (e) => {
            if (e.target === this.overlay) this.close();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.overlay?.classList.contains('active')) this.close();
        });

        document.querySelectorAll('.admin-tab').forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });
    },

    open() {
        this.overlay?.classList.add('active');
        renderAdminWatches();
        renderAdminNews();
    },

    close() {
        this.overlay?.classList.remove('active');
    },

    switchTab(tabName) {
        document.querySelectorAll('.admin-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tabName));
        document.querySelectorAll('.admin-tab-content').forEach(c => {
            c.classList.toggle('active', c.id === `tab${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`);
        });
    }
};

// ========== Cursor Glow ==========
function initCursorGlow() {
    const glow = document.querySelector('.cursor-glow');
    if (!glow) return;

    let mouseX = 0, mouseY = 0;
    let glowX = 0, glowY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animate() {
        glowX += (mouseX - glowX) * 0.1;
        glowY += (mouseY - glowY) * 0.1;
        glow.style.left = glowX + 'px';
        glow.style.top = glowY + 'px';
        requestAnimationFrame(animate);
    }
    animate();
}

// ========== Particles ==========
function initParticles() {
    const container = document.getElementById('particles');
    if (!container) return;

    const style = document.createElement('style');
    style.textContent = `
        @keyframes particleFloat {
            0%, 100% { transform: translate(0, 0); opacity: 0.2; }
            50% { transform: translate(var(--dx, 10px), var(--dy, -10px)); opacity: 0.6; }
        }
    `;
    document.head.appendChild(style);

    for (let i = 0; i < 25; i++) {
        const dot = document.createElement('div');
        const dx = (Math.random() - 0.5) * 30;
        const dy = (Math.random() - 0.5) * 30;
        const dur = 3 + Math.random() * 4;
        dot.style.cssText = `
            position: absolute;
            width: 2px; height: 2px;
            background: rgba(201, 169, 98, 0.4);
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            --dx: ${dx}px;
            --dy: ${dy}px;
            animation: particleFloat ${dur}s ease-in-out infinite;
            animation-delay: ${Math.random() * 2}s;
        `;
        container.appendChild(dot);
    }
}

// ========== Mobile Menu ==========
function initMobileMenu() {
    const toggle = document.querySelector('.nav-toggle');
    const links = document.querySelector('.nav-links');

    toggle?.addEventListener('click', () => {
        const expanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', !expanded);
        links?.classList.toggle('active', !expanded);
    });

    links?.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            toggle?.setAttribute('aria-expanded', 'false');
            links?.classList.remove('active');
        });
    });
}

// ========== Form Handlers ==========
function initOrderForm() {
    const form = document.getElementById('orderForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const btn = form.querySelector('button[type="submit"]');
        btn?.classList.add('loading');
        clearFormErrors(form);

        const isValid = validateForm(form, {
            name: validators.name,
            email: validators.email,
            phone: validators.phone,
            details: validators.details
        });

        if (!isValid) {
            btn?.classList.remove('loading');
            toast.show('Te rugăm să corectezi erorile din formular.', 'error');
            return;
        }

        const data = {
            name: form.name.value.trim(),
            email: form.email.value.trim(),
            phone: form.phone.value.trim(),
            type: form.type.value,
            details: form.details.value.trim()
        };

        saveOrder(data);
        form.reset();
        btn?.classList.remove('loading');
        toast.show('Cererea ta a fost trimisă! Te vom contacta în curând.');
    });
}

function initAddWatchForm() {
    const form = document.getElementById('addWatchForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const data = Object.fromEntries(fd);
        addWatch(data);
        form.reset();
    });
}

function initAddNewsForm() {
    const form = document.getElementById('addNewsForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const data = Object.fromEntries(fd);
        addNews(data);
        form.reset();
    });
}

// ========== 360° Product View ==========
function initView360Handlers() {
    document.querySelectorAll('.watch-360-btn').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            openView360(btn.dataset.watchId);
        };
    });
}

function openView360(watchId) {
    const watches = storage.get(STORAGE_KEYS.WATCHES);
    const watch = watches.find(w => w.id === watchId);
    if (!watch) return;

    const overlay = document.getElementById('view360Overlay');
    const img = document.getElementById('view360Image');
    const info = document.getElementById('view360Info');

    const images = watch.images && watch.images.length >= 2 ? watch.images : [watch.image];
    img.src = images[0];
    img.alt = watch.name;
    info.innerHTML = `
        <h3>${escapeHtml(watch.name)}</h3>
        <p>${escapeHtml(watch.desc || '')}</p>
        <p class="view360-price">${formatPrice(watch.price)} RON</p>
    `;

    overlay.classList.add('active');
    setupView360Drag(img, images);
}

function setupView360Drag(imgEl, images = []) {
    const wrapper = imgEl?.closest('.view360-image-wrapper');
    if (!wrapper) return;

    let rotationY = 0;
    let scale = 1;
    let isDragging = false;
    let startX = 0, startRotY = 0;
    const hasMultipleImages = images && images.length >= 2;

    function updateView() {
        wrapper.style.transform = `perspective(800px) rotateY(${rotationY}deg) scale(${scale})`;
        if (hasMultipleImages) {
            const normalized = ((rotationY % 360) + 360) % 360;
            imgEl.src = normalized < 180 ? images[0] : images[1];
        }
    }

    wrapper.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
        startRotY = rotationY;
    });
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        rotationY = startRotY + (e.clientX - startX);
        updateView();
    });
    document.addEventListener('mouseup', () => { isDragging = false; });

    wrapper.addEventListener('touchstart', (e) => {
        isDragging = true;
        startX = e.touches[0].clientX;
        startRotY = rotationY;
    });
    wrapper.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        rotationY = startRotY + (e.touches[0].clientX - startX);
        updateView();
    });
    wrapper.addEventListener('touchend', () => { isDragging = false; });

    const stage = document.getElementById('view360Stage');
    stage?.addEventListener('wheel', (e) => {
        e.preventDefault();
        scale = Math.max(0.5, Math.min(2, scale - e.deltaY * 0.002));
        updateView();
    }, { passive: false });

    updateView();
}

function initView360Modal() {
    const overlay = document.getElementById('view360Overlay');
    const closeBtn = document.getElementById('view360Close');

    closeBtn?.addEventListener('click', () => overlay?.classList.remove('active'));
    overlay?.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.remove('active');
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay?.classList.contains('active')) overlay.classList.remove('active');
    });
}

// ========== Chat Island (Floating) ==========
function initChatIsland() {
    const island = document.getElementById('chatIsland');
    const closeBtn = document.getElementById('chatIslandClose');
    const SCROLL_THRESHOLD = 300;
    const STORAGE_KEY = 'sonero_chat_island_closed';

    function showIsland() {
        if (sessionStorage.getItem(STORAGE_KEY)) return;
        island?.classList.add('visible');
    }

    function hideIsland() {
        island?.classList.remove('visible');
    }

    window.addEventListener('scroll', () => {
        if (sessionStorage.getItem(STORAGE_KEY)) return;
        if (window.scrollY > SCROLL_THRESHOLD) {
            showIsland();
        } else {
            hideIsland();
        }
    });

    closeBtn?.addEventListener('click', () => {
        hideIsland();
        sessionStorage.setItem(STORAGE_KEY, '1');
    });
}

// ========== Init ==========
document.addEventListener('DOMContentLoaded', () => {
    loadWatches();
    loadNews();
    observeAnimate();
    initAdminAccess();
    admin.init();
    initCursorGlow();
    initParticles();
    initMobileMenu();
    initOrderForm();
    initAddWatchForm();
    initAddNewsForm();
    initView360Modal();
    initChatIsland();
});
