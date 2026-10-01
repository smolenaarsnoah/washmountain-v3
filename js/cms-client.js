/**
 * =========================================================================
 * WASHMOUNTAIN CMS CLIENT RUNTIME (js/cms-client.js)
 * =========================================================================
 * Dit script verzorgt:
 * 1. Het live inladen en toepassen van bewerkbare teksten uit content.json (via data-cms-id)
 * 2. Het renderen van de blog-artikelen (#blog-grid) met categorie- en zoekfilter
 * 3. Het renderen van blog detailpagina's (#blog-detail-container)
 * 4. Het tonen van de nieuwste blogs op de homepage (#home-blog-grid)
 * =========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {

    // -------------------------------------------------------------
    // 1. DYNAMISCHE TEKSTEN (content.json)
    // -------------------------------------------------------------
    async function loadCMSContent() {
        try {
            const response = await fetch('content.json?v=' + Date.now());
            if (!response.ok) return;
            const data = await response.json();
            applyContent(data);
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
                if (typeof value === 'string' && (value.includes('<p>') || value.includes('<br>') || value.includes('<strong>') || value.includes('<span>') || value.includes('<div'))) {
                    el.innerHTML = value;
                } else {
                    el.textContent = value;
                }
            }
        });
    }

    // -------------------------------------------------------------
    // 2. BLOG & NIEUWS RENDER ENGINE (articles.json)
    // -------------------------------------------------------------
    function calculateReadingTime(text) {
        if (!text) return '2 min leestijd';
        const cleanText = text.replace(/<[^>]*>?/gm, '');
        const wordCount = cleanText.trim().split(/\s+/).length;
        const minutes = Math.max(1, Math.ceil(wordCount / 200));
        return `${minutes} min leestijd`;
    }

    function formatArticleDate(dateStr) {
        if (!dateStr) return '';
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
        } catch (e) {
            return dateStr;
        }
    }

    async function initBlogs() {
        const grid = document.getElementById('blog-grid');
        const homeGrid = document.getElementById('home-blog-grid');
        const detailContainer = document.getElementById('blog-detail-container');

        if (!grid && !homeGrid && !detailContainer) return;

        try {
            const res = await fetch('articles.json?v=' + Date.now());
            if (!res.ok) return;
            const articles = await res.json();
            const published = articles.filter(a => a.status === 'published' || !a.status);

            // A. Blog Overzichtspagina (#blog-grid)
            if (grid) {
                renderBlogOverview(published);
            }

            // B. Homepage Latest Blogs Widget (#home-blog-grid)
            if (homeGrid) {
                renderHomeBlogs(published.slice(0, 3));
            }

            // C. Detailpagina (#blog-detail-container)
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
                btn.addEventListener('click', () => {
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
                    <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
                        <div style="font-size: 2.5rem; margin-bottom: 12px;">🔍</div>
                        <h3 style="font-size: 1.3rem; color: #ffffff; margin-bottom: 8px;">Geen artikelen gevonden</h3>
                        <p>Probeer een andere zoekterm of selecteer een andere categorie.</p>
                    </div>
                `;
                return;
            }

            grid.innerHTML = filtered.map(art => {
                const dateStr = formatArticleDate(art.date);
                const readingTime = calculateReadingTime(art.content);
                const linkUrl = art.slug ? `blog-artikel.html?slug=${encodeURIComponent(art.slug)}` : `blog-artikel.html?id=${encodeURIComponent(art.id)}`;
                const imageSrc = art.image || 'images/Website logo linksboven url.png';

                return `
                    <article class="article-card">
                        <a href="${linkUrl}" class="article-card-image-wrap">
                            <img src="${imageSrc}" alt="${art.title}" class="article-card-img" loading="lazy">
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

        filterAndRender();
    }

    function renderHomeBlogs(articles) {
        const homeGrid = document.getElementById('home-blog-grid');
        if (!homeGrid) return;

        if (articles.length === 0) {
            homeGrid.innerHTML = '<p style="color: var(--text-muted); grid-column: 1/-1;">Binnenkort nieuwe artikelen.</p>';
            return;
        }

        homeGrid.innerHTML = articles.map(art => {
            const dateStr = formatArticleDate(art.date);
            const readingTime = calculateReadingTime(art.content);
            const linkUrl = art.slug ? `blog-artikel.html?slug=${encodeURIComponent(art.slug)}` : `blog-artikel.html?id=${encodeURIComponent(art.id)}`;
            const imageSrc = art.image || 'images/Website logo linksboven url.png';

            return `
                <article class="article-card">
                    <a href="${linkUrl}" class="article-card-image-wrap">
                        <img src="${imageSrc}" alt="${art.title}" class="article-card-img" loading="lazy">
                        ${art.category ? `<span class="category-badge">${art.category}</span>` : ''}
                    </a>
                    <div class="article-card-body">
                        <div class="article-meta">
                            <span><i class="fa-regular fa-calendar"></i> ${dateStr}</span>
                            <span><i class="fa-regular fa-clock"></i> ${readingTime}</span>
                        </div>
                        <h3 class="article-card-title" style="font-size: 1.15rem;">
                            <a href="${linkUrl}">${art.title}</a>
                        </h3>
                        <p class="article-card-excerpt">${art.excerpt || ''}</p>
                        <a href="${linkUrl}" class="article-card-link">
                            Lees artikel <i class="fa-solid fa-arrow-right"></i>
                        </a>
                    </div>
                </article>
            `;
        }).join('');
    }

    function renderBlogDetail(articles) {
        const detailContainer = document.getElementById('blog-detail-container');
        const urlParams = new URLSearchParams(window.location.search);
        const artId = urlParams.get('id');
        const artSlug = urlParams.get('slug');

        const art = articles.find(a => (artId && String(a.id) === String(artId)) || (artSlug && a.slug === artSlug));

        if (!art) {
            detailContainer.innerHTML = `
                <div class="article-box" style="text-align: center; padding: 80px 20px;">
                    <div style="font-size: 3rem; margin-bottom: 16px;">📰</div>
                    <h1 style="font-size: 2rem; color: #ffffff; margin-bottom: 12px;">Artikel niet gevonden</h1>
                    <p style="color: var(--text-muted); margin-bottom: 24px;">Het artikel dat je zoekt bestaat niet of is verplaatst.</p>
                    <a href="blog.html" class="rainbow-bg" style="display: inline-block;">Naar alle artikelen</a>
                </div>
            `;
            return;
        }

        // Dynamische page titel & metadata
        document.title = `${art.title} — Washmountain`;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', art.excerpt || '');

        const dateStr = formatArticleDate(art.date);
        const readingTime = calculateReadingTime(art.content);
        const authorName = art.author || 'Washmountain Crew';

        // Gerelateerde artikelen
        const related = articles
            .filter(a => a.id !== art.id && (a.status === 'published' || !a.status))
            .slice(0, 2);

        let relatedHtml = '';
        if (related.length > 0) {
            relatedHtml = `
                <div style="margin-top: 50px; padding-top: 30px; border-top: 1px solid rgba(255, 255, 255, 0.08);">
                    <h3 style="font-size: 1.3rem; color: #ffffff; margin-bottom: 20px; font-weight: 700;">Lees ook</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 18px;">
                        ${related.map(r => `
                            <a href="${r.slug ? `blog-artikel.html?slug=${encodeURIComponent(r.slug)}` : `blog-artikel.html?id=${encodeURIComponent(r.id)}`}" style="display: flex; gap: 14px; background: rgba(17, 34, 64, 0.5); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 12px; text-decoration: none; color: inherit; transition: 0.2s;" onmouseover="this.style.borderColor='rgba(96, 165, 250, 0.4)'" onmouseout="this.style.borderColor='rgba(255, 255, 255, 0.08)'">
                                ${r.image ? `<img src="${r.image}" alt="${r.title}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; flex-shrink: 0;">` : ''}
                                <div style="display: flex; flex-direction: column; justify-content: center;">
                                    <span style="font-size: 11px; color: #60a5fa; font-weight: 700; text-transform: uppercase;">${r.category || 'Artikel'}</span>
                                    <h4 style="font-size: 0.95rem; color: #ffffff; margin: 4px 0 0; line-height: 1.35;">${r.title}</h4>
                                </div>
                            </a>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        const shareUrl = window.location.href;
        const shareText = encodeURIComponent(art.title + ' — Washmountain');

        detailContainer.innerHTML = `
            <div class="article-box">
                <nav class="breadcrumbs">
                    <a href="index.html">Dashboard</a>
                    <span>/</span>
                    <a href="blog.html">Nieuws & Blog</a>
                    <span>/</span>
                    <span style="color: #ffffff;">${art.title}</span>
                </nav>

                ${art.category ? `<span class="article-badge">${art.category}</span>` : ''}

                <h1 class="article-hero-title">${art.title}</h1>

                <div class="article-meta-row">
                    <span><i class="fa-regular fa-user" style="color:#60a5fa;"></i> ${authorName}</span>
                    <span><i class="fa-regular fa-calendar" style="color:#60a5fa;"></i> ${dateStr}</span>
                    <span><i class="fa-regular fa-clock" style="color:#60a5fa;"></i> ${readingTime}</span>
                </div>

                ${art.image ? `
                    <div class="article-main-image">
                        <img src="${art.image}" alt="${art.title}">
                    </div>
                ` : ''}

                <div class="article-rich-content">
                    ${art.content}
                </div>

                <div class="article-share-bar">
                    <span style="font-size: 13px; font-weight: 600; color: var(--text-secondary);">Deel dit artikel:</span>
                    <div class="share-btns-group">
                        <a href="https://api.whatsapp.com/send?text=${shareText}%20${encodeURIComponent(shareUrl)}" target="_blank" rel="noopener" class="social-share-btn btn-wa" title="WhatsApp" aria-label="WhatsApp"><i class="fa-brands fa-whatsapp"></i></a>
                        <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}" target="_blank" rel="noopener" class="social-share-btn btn-in" title="LinkedIn" aria-label="LinkedIn"><i class="fa-brands fa-linkedin-in"></i></a>
                        <a href="https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(shareUrl)}" target="_blank" rel="noopener" class="social-share-btn btn-tw" title="X / Twitter" aria-label="X / Twitter"><i class="fa-brands fa-x-twitter"></i></a>
                    </div>
                </div>

                ${relatedHtml}
            </div>
        `;
    }

    // Start runtime
    loadCMSContent();
    initBlogs();
});
