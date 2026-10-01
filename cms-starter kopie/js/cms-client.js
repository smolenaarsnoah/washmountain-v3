/**
 * =========================================================================
 * UNIVERSELE CMS CLIENT RUNTIME (cms-client.js)
 * =========================================================================
 * Dit script verzorgt alle dynamische functionaliteiten op de frontend van de website:
 * 1. Laadt teksten en afbeeldingen uit content.json (via data-cms-id)
 * 2. Rendert het hoofdmenu en mobiele menu dynamisch
 * 3. Rendert de blog-overzichtspagina (#blog-grid) met categorie- en zoekfilters
 * 4. Rendert individuele blogartikelen (#blog-detail-container)
 * 5. Rendert recente blogs in footer of widgets (#footer-recent-blogs)
 * 6. Automatische copyright-jaarweergave & mobiele navigatie toggle
 * =========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {

    // -------------------------------------------------------------
    // 1. DYNAMISCHE TEKSTEN & AFBEELDINGEN (content.json)
    // -------------------------------------------------------------
    async function loadCMSContent() {
        try {
            const response = await fetch('content.json?v=' + Date.now());
            if (!response.ok) return;
            const data = await response.json();
            applyContent(data);
            renderNavigation(data);
        } catch (error) {
            console.warn("Geen content.json gevonden of fout bij inladen:", error);
        }
    }

    function applyContent(data) {
        document.querySelectorAll('[data-cms-id]').forEach(el => {
            const key = el.getAttribute('data-cms-id');
            if (data[key] === undefined || data[key] === null) return;
            const value = data[key];

            const tagName = el.tagName.toUpperCase();

            if (tagName === 'IMG') {
                if (value) el.src = value;
            } else if (tagName === 'A') {
                if (key.endsWith('-url') || key.endsWith('-link')) {
                    el.href = value;
                } else {
                    el.textContent = value;
                }
            } else if (tagName === 'INPUT' || tagName === 'TEXTAREA') {
                el.value = value;
            } else if (tagName === 'META') {
                el.setAttribute('content', value);
            } else if (tagName === 'TITLE') {
                document.title = value;
            } else {
                // Als de waarde HTML tags bevat (bijv. vanuit Quill editor), render innerHTML
                if (typeof value === 'string' && (value.includes('<p>') || value.includes('<br>') || value.includes('<strong>') || value.includes('<span>'))) {
                    el.innerHTML = value;
                } else {
                    el.textContent = value;
                }
            }
        });
    }

    // -------------------------------------------------------------
    // 2. DYNAMISCHE NAVIGATIE
    // -------------------------------------------------------------
    function renderNavigation(data) {
        function getActiveClass(url) {
            const currentPath = window.location.pathname;
            if ((currentPath === '/' || currentPath.endsWith('index.html')) && (url === 'index.html' || url === '/')) {
                return 'active';
            } else if (url !== '/' && url !== 'index.html' && currentPath.includes(url)) {
                return 'active';
            }
            return '';
        }

        // Haal menu op uit content.json of gebruik standaard navigatie
        let menuItems = [];
        if (data && data['navigation-main-menu']) {
            try {
                menuItems = typeof data['navigation-main-menu'] === 'string' 
                    ? JSON.parse(data['navigation-main-menu']) 
                    : data['navigation-main-menu'];
            } catch (e) {
                console.error("Fout bij parsen navigation-main-menu:", e);
            }
        }

        if (!Array.isArray(menuItems) || menuItems.length === 0) {
            menuItems = [
                { text: 'Home', url: 'index.html' },
                { text: 'Blog', url: 'blog.html' },
                { text: 'Contact', url: 'contact.html' }
            ];
        }

        // Desktop navigatie
        const desktopNavUl = document.querySelector('.main-nav ul, #main-nav ul');
        if (desktopNavUl) {
            desktopNavUl.innerHTML = menuItems.map(item => {
                const active = getActiveClass(item.url);
                const isCta = item.isCTA || item.isCta;
                if (isCta) {
                    return `<li><a href="${item.url}" class="nav-cta ${active}">${item.text}</a></li>`;
                }
                return `<li><a href="${item.url}" class="${active}">${item.text}</a></li>`;
            }).join('');
        }

        // Mobiele navigatie
        const mobileNavContainer = document.querySelector('.mobile-menu-links, #mobile-menu-links, .mobile-menu');
        if (mobileNavContainer) {
            const existingCloseBtn = mobileNavContainer.querySelector('.mobile-close, #mobile-close');
            const closeBtnHtml = existingCloseBtn ? existingCloseBtn.outerHTML : '<div class="mobile-close" id="mobile-close">&times;</div>';
            
            const linksHtml = menuItems.map(item => {
                const active = getActiveClass(item.url);
                return `<a href="${item.url}" class="${active}">${item.text}</a>`;
            }).join('');

            mobileNavContainer.innerHTML = closeBtnHtml + linksHtml;
            attachMobileMenuListeners();
        }
    }

    // -------------------------------------------------------------
    // 3. BLOGS RENDEREN (#blog-grid & #blog-detail-container)
    // -------------------------------------------------------------
    function calculateReadingTime(text) {
        if (!text) return '2 min leestijd';
        const cleanText = text.replace(/<[^>]*>?/gm, '');
        const wordCount = cleanText.trim().split(/\s+/).length;
        const minutes = Math.ceil(wordCount / 200);
        return `${minutes} min leestijd`;
    }

    async function initBlogs() {
        const grid = document.getElementById('blog-grid');
        const detailContainer = document.getElementById('blog-detail-container');
        
        if (!grid && !detailContainer) return;

        try {
            const res = await fetch('articles.json?v=' + Date.now());
            if (!res.ok) return;
            const articles = await res.json();
            const published = articles.filter(a => a.status === 'published' || !a.status);

            // A. Overzichtspagina (#blog-grid)
            if (grid) {
                renderBlogOverview(published);
            }

            // B. Detailpagina (#blog-detail-container)
            if (detailContainer) {
                renderBlogDetail(articles);
            }
        } catch (e) {
            console.error("Fout bij laden van articles.json:", e);
        }
    }

    function renderBlogOverview(articles) {
        const grid = document.getElementById('blog-grid');
        const categoryContainer = document.getElementById('category-filters');
        const searchInput = document.getElementById('blog-search');

        let activeCategory = 'all';
        let searchQuery = '';

        // Haal unieke categorieën op
        if (categoryContainer) {
            const categories = ['all', ...new Set(articles.map(a => a.category).filter(Boolean))];
            categoryContainer.innerHTML = categories.map(cat => {
                const label = cat === 'all' ? 'Alles' : cat;
                const activeClass = cat === 'all' ? 'active' : '';
                return `<button class="category-btn ${activeClass}" data-category="${cat}">${label}</button>`;
            }).join('');

            categoryContainer.querySelectorAll('.category-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    categoryContainer.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    activeCategory = btn.getAttribute('data-category');
                    filterAndRender();
                });
            });
        }

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                searchQuery = e.target.value.toLowerCase().trim();
                filterAndRender();
            });
        }

        function filterAndRender() {
            let filtered = articles;

            if (activeCategory !== 'all') {
                filtered = filtered.filter(a => a.category === activeCategory);
            }

            if (searchQuery) {
                filtered = filtered.filter(a => 
                    (a.title && a.title.toLowerCase().includes(searchQuery)) ||
                    (a.excerpt && a.excerpt.toLowerCase().includes(searchQuery)) ||
                    (a.content && a.content.toLowerCase().includes(searchQuery))
                );
            }

            if (filtered.length === 0) {
                grid.innerHTML = `
                    <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                        <div style="font-size: 2.5rem; margin-bottom: 12px;">🔍</div>
                        <h3 style="margin-bottom: 8px;">Geen artikelen gevonden</h3>
                        <p style="color: var(--text-muted, #64748b);">Probeer een andere zoekterm of categorie.</p>
                    </div>
                `;
                return;
            }

            grid.innerHTML = filtered.map((art, idx) => {
                const dateStr = art.date ? new Date(art.date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
                const readingTime = calculateReadingTime(art.content);
                const linkUrl = art.slug ? `blog-artikel.html?slug=${art.slug}` : `blog-artikel.html?id=${art.id}`;
                const fallbackImg = 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80';

                return `
                    <article class="article-card" style="animation-delay: ${idx * 0.05}s;">
                        <a href="${linkUrl}" class="article-card-image-wrap">
                            <img src="${art.image || fallbackImg}" alt="${art.title}" class="article-card-img" loading="lazy">
                            ${art.category ? `<span class="category-badge">${art.category}</span>` : ''}
                        </a>
                        <div class="article-card-body">
                            <div class="article-meta">
                                <span><i class="fa-regular fa-calendar"></i> ${dateStr}</span>
                                <span><i class="fa-regular fa-clock"></i> ${readingTime}</span>
                            </div>
                            <h2 class="article-card-title">
                                <a href="${linkUrl}">${art.title}</a>
                            </h2>
                            <p class="article-card-excerpt">${art.excerpt || ''}</p>
                            <a href="${linkUrl}" class="article-card-link">
                                Lees artikel <i class="fa-solid fa-arrow-right"></i>
                            </a>
                        </div>
                    </article>
                `;
            }).join('');
        }

        // Initiële weergave
        filterAndRender();
    }

    function renderBlogDetail(articles) {
        const detailContainer = document.getElementById('blog-detail-container');
        const urlParams = new URLSearchParams(window.location.search);
        const artId = urlParams.get('id');
        const artSlug = urlParams.get('slug');

        const art = articles.find(a => (artId && a.id === artId) || (artSlug && a.slug === artSlug));

        if (!art) {
            detailContainer.innerHTML = `
                <div class="empty-state" style="text-align: center; padding: 80px 20px;">
                    <div style="font-size: 3rem; margin-bottom: 16px;">📰</div>
                    <h1 style="font-size: 2rem; margin-bottom: 12px;">Artikel niet gevonden</h1>
                    <p style="color: var(--text-muted, #64748b); margin-bottom: 24px;">Het artikel dat je zoekt bestaat helaas niet of is verplaatst.</p>
                    <a href="blog.html" class="btn btn-primary" style="display: inline-block;">Naar alle artikelen</a>
                </div>
            `;
            return;
        }

        // Dynamische SEO titels & tags
        const siteName = (window.CMS_CONFIG && window.CMS_CONFIG.siteName) || '';
        document.title = siteName ? `${art.title} — ${siteName}` : art.title;

        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', art.excerpt || '');

        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) ogTitle.setAttribute('content', art.title);

        const ogDesc = document.querySelector('meta[property="og:description"]');
        if (ogDesc) ogDesc.setAttribute('content', art.excerpt || '');

        const ogImage = document.querySelector('meta[property="og:image"]');
        if (ogImage && art.image) ogImage.setAttribute('content', art.image);

        const dateStr = art.date ? new Date(art.date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
        const readingTime = calculateReadingTime(art.content);
        const authorName = art.author || (window.CMS_CONFIG && window.CMS_CONFIG.defaultAuthor) || 'Redactie';

        // Bereken gerelateerde artikelen
        const related = articles
            .filter(a => a.id !== art.id && (a.status === 'published' || !a.status))
            .filter(a => !art.category || a.category === art.category)
            .slice(0, 2);

        let relatedHtml = '';
        if (related.length > 0) {
            relatedHtml = `
                <div class="related-articles-section" style="margin-top: 60px; padding-top: 40px; border-top: 1px solid var(--border-color, #e2e8f0);">
                    <h3 style="font-size: 1.4rem; margin-bottom: 24px;">Lees ook deze artikelen</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px;">
                        ${related.map(r => `
                            <a href="blog-artikel.html?id=${r.id}" class="related-article-card" style="text-decoration:none; color:inherit; background:var(--bg-card, #f8fafc); border-radius:12px; overflow:hidden; border:1px solid var(--border-color, #e2e8f0); display:flex; flex-direction:column;">
                                ${r.image ? `<img src="${r.image}" alt="${r.title}" style="height:150px; width:100%; object-fit:cover;">` : ''}
                                <div style="padding: 16px;">
                                    <span style="font-size:0.75rem; color:var(--accent-primary, #0284c7); font-weight:700; text-transform:uppercase;">${r.category || 'Artikel'}</span>
                                    <h4 style="font-size:1rem; margin:6px 0 0; line-height:1.4;">${r.title}</h4>
                                </div>
                            </a>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // Render artikel detail
        detailContainer.innerHTML = `
            <article class="article-detail">
                <nav class="breadcrumbs" style="margin-bottom: 24px; font-size: 0.85rem; color: var(--text-muted, #64748b);">
                    <a href="index.html" style="color: inherit; text-decoration: none;">Home</a> &rsaquo; 
                    <a href="blog.html" style="color: inherit; text-decoration: none;">Blog</a> &rsaquo; 
                    <span>${art.title}</span>
                </nav>

                ${art.category ? `<span class="category-badge" style="display: inline-block; margin-bottom: 16px;">${art.category}</span>` : ''}

                <h1 class="article-title" style="font-size: clamp(2rem, 4vw, 3rem); font-weight: 800; line-height: 1.2; margin-bottom: 20px;">
                    ${art.title}
                </h1>

                <div class="article-meta" style="display: flex; flex-wrap: wrap; gap: 20px; font-size: 0.9rem; color: var(--text-muted, #64748b); margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid var(--border-color, #e2e8f0);">
                    <span><i class="fa-regular fa-user"></i> ${authorName}</span>
                    <span><i class="fa-regular fa-calendar"></i> ${dateStr}</span>
                    <span><i class="fa-regular fa-clock"></i> ${readingTime}</span>
                </div>

                ${art.image ? `
                    <div class="article-featured-image" style="margin-bottom: 40px; border-radius: 16px; overflow: hidden; max-height: 480px;">
                        <img src="${art.image}" alt="${art.title}" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                ` : ''}

                <div class="article-content" style="font-size: 1.1rem; line-height: 1.8; color: var(--text-main, #1e293b);">
                    ${art.content}
                </div>

                <div class="article-share" style="margin-top: 40px; padding: 20px; background: var(--bg-card, #f8fafc); border-radius: 12px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
                    <span style="font-weight: 600; font-size: 0.9rem;">Deel dit artikel:</span>
                    <div style="display: flex; gap: 10px;">
                        <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(art.title + ' ' + window.location.href)}" target="_blank" rel="noopener" class="share-btn whatsapp" style="width: 36px; height: 36px; border-radius: 50%; background: #25D366; color: white; display: flex; align-items: center; justify-content: center; text-decoration: none;" aria-label="Deel op WhatsApp"><i class="fa-brands fa-whatsapp"></i></a>
                        <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}" target="_blank" rel="noopener" class="share-btn linkedin" style="width: 36px; height: 36px; border-radius: 50%; background: #0077b5; color: white; display: flex; align-items: center; justify-content: center; text-decoration: none;" aria-label="Deel op LinkedIn"><i class="fa-brands fa-linkedin-in"></i></a>
                        <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(art.title)}&url=${encodeURIComponent(window.location.href)}" target="_blank" rel="noopener" class="share-btn twitter" style="width: 36px; height: 36px; border-radius: 50%; background: #000000; color: white; display: flex; align-items: center; justify-content: center; text-decoration: none;" aria-label="Deel op X"><i class="fa-brands fa-x-twitter"></i></a>
                    </div>
                </div>

                ${relatedHtml}
            </article>
        `;
    }

    // -------------------------------------------------------------
    // 4. RECENTE BLOGS IN FOOTER OF WIDGET (#footer-recent-blogs)
    // -------------------------------------------------------------
    async function loadFooterBlogs() {
        const container = document.getElementById('footer-recent-blogs');
        if (!container) return;

        try {
            const res = await fetch('articles.json?v=' + Date.now());
            if (!res.ok) return;
            const articles = await res.json();
            const recent = articles.filter(a => a.status === 'published' || !a.status).slice(0, 3);

            if (recent.length === 0) {
                container.innerHTML = '<p style="font-size:0.85rem; color:var(--text-muted, #94a3b8);">Binnenkort nieuwe artikelen.</p>';
                return;
            }

            container.innerHTML = recent.map(art => `
                <a href="blog-artikel.html?id=${art.id}" style="display:block; font-size:0.85rem; margin-bottom:8px; text-decoration:none; color:inherit; line-height:1.4;">
                    ${art.title}
                </a>
            `).join('');
        } catch (e) {
            console.error("Fout bij laden van recente footer blogs:", e);
        }
    }

    // -------------------------------------------------------------
    // 5. MOBIELE MENU TOGGLE & HELPERS
    // -------------------------------------------------------------
    function attachMobileMenuListeners() {
        const hamburger = document.getElementById('hamburger');
        const mobileMenu = document.getElementById('mobile-menu');
        const closeBtn = document.getElementById('mobile-close');

        if (hamburger && mobileMenu) {
            hamburger.onclick = () => mobileMenu.classList.add('open');
        }
        if (closeBtn && mobileMenu) {
            closeBtn.onclick = () => mobileMenu.classList.remove('open');
        }
    }

    // -------------------------------------------------------------
    // 6. INITIATIE
    // -------------------------------------------------------------
    loadCMSContent();
    initBlogs();
    loadFooterBlogs();
    attachMobileMenuListeners();

    // Automatisch huidig jaar in footer
    document.querySelectorAll('#footer-year, .current-year').forEach(el => {
        el.textContent = new Date().getFullYear();
    });
});
