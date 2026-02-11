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
    div.innerHTML = `
        <img src="${escapeHtml(watch.image)}" alt="${escapeHtml(watch.name)}" class="watch-image" loading="lazy"
             onerror="this.src='https://via.placeholder.com/400?text=Sonero'">
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
    toast.show('Ceas adăugat cu succes!');
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
    toast.show('Noutate adăugată cu succes!');
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

// ========== Admin Panel ==========
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

// ========== Init ==========
document.addEventListener('DOMContentLoaded', () => {
    loadWatches();
    loadNews();
    observeAnimate();
    admin.init();
    initCursorGlow();
    initParticles();
    initMobileMenu();
    initOrderForm();
    initAddWatchForm();
    initAddNewsForm();
});
