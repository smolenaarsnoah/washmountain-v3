/* ===== Washmountain — main.js ===== */

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  initHamburger();
  initPage();
  initActiveNav();
});

function checkAuth() {
  const isLoggedIn = localStorage.getItem('wm_isLoggedIn') === 'true';
  const username = localStorage.getItem('wm_username');
  if (isLoggedIn) {
    document.body.classList.add('logged-in');
    
    // Member lookup voor profielgegevens
    const members = FALLBACK['members.json'] || [];
    const member = members.find(m => 
        m.naam.toLowerCase().includes(username.toLowerCase()) ||
        (m.username && m.username.toLowerCase().includes(username.toLowerCase()))
    );
    
    const bubbleElems = document.querySelectorAll('.user-profile-bubble');
    bubbleElems.forEach(el => {
      // Create avatar content
      if (member && member.afbeelding) {
        el.innerHTML = `<img src="${member.afbeelding}" class="user-avatar-img" alt="${username}">`;
      } else {
        const initials = member ? member.initialen : (username ? username.substring(0, 2).toUpperCase() : '?');
        const bgColor = member ? member.kleur : 'var(--gradient-accent)';
        el.innerHTML = `<div class="user-avatar-small" style="background:${bgColor}"><span class="user-initials">${initials}</span></div>`;
      }
      
      el.onclick = () => window.location.href = 'account.html';
    });
  } else {
    document.body.classList.remove('logged-in');
  }
}

function logout() {
  localStorage.removeItem('wm_isLoggedIn');
  localStorage.removeItem('wm_username');
  window.location.href = 'index.html';
}

/* ===== Hamburger Menu ===== */
function initHamburger() {
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (!hamburger || !navLinks) return;

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });
}

/* ===== Highlight Active Navigation ===== */
function initActiveNav() {
  const rawPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-links a');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    // Verwijder 'active' class van alle links eerst
    link.classList.remove('active');
    
    const cleanHref = href.replace(/\.html$/, '');
    const cleanPath = (rawPath || 'index').replace(/\.html$/, '') || 'index';
    
    if (cleanHref === cleanPath || (cleanPath === 'index' && (cleanHref === 'index' || cleanHref === ''))) {
        link.classList.add('active');
    }
  });
}

/* ===== Page Router ===== */
function initPage() {
  const rawPath = window.location.pathname.split('/').pop() || '';
  const path = rawPath.replace(/\.html$/, '') || 'index';
  
  const isLoggedIn = localStorage.getItem('wm_isLoggedIn') === 'true';
  const protectedPages = ['files', 'diensten', 'lid', 'account'];

  if (protectedPages.includes(path) && !isLoggedIn) {
     window.location.href = 'login.html';
     return;
  }

  if (path === 'index' || path === '') {
    loadHomeEvents();
    loadMarqueeLogos();
    initFeedbackForm();
    initDashboardCountdown();
  } else if (path === 'evenementen') {
    loadEvenementen();
  } else if (path === 'nieuws') {
    loadNieuws();
  } else if (path === 'planning') {
    loadPlanning();
  } else if (path === 'files') {
    initMembers();
  } else if (path === 'lid') {
    initLid();
  } else if (path === 'games') {
    // Handled in games.js
  } else if (path === 'radio') {
    // Radio page logic
  }
}

/* ===== Fallback Data (for local file:// preview) ===== */
const FALLBACK = {
  'evenementen.json': [
    { id: 1, naam: "C1 op circuit Zolder", datum: "2026-04-11", locatie: "Circuit Zolder, België", beschrijving: "Op het circuit met de Citroën C1 van Mr. Worldwide.", afbeelding: "images/evenementen/c1-zolder.jpeg", voorbij: false },
    { id: 2, naam: "Viering Verjaardag Burgemeester", datum: "2026-04-11", locatie: "Hoofdkantoor der Washmountain", beschrijving: "Viering van de eerdere verjaardag van de Burgemeester. Dit wordt gedaan in een special diner: ookwel \"Kaasfondue van Lau\" genoemd", afbeelding: "images/evenementen/kaasfondue.webp", voorbij: false },
    { id: 3, naam: "Verjaardag President", datum: "2026-06-04", locatie: "Hoofdkantoor der Smol City", beschrijving: "Verjaardag van de President. Viering zal later plaatsvinden, datum hiervan wordt binnenkort bekend gemaakt.", afbeelding: "images/evenementen/bbq.webp", voorbij: false },
    { id: 4, naam: "Verjaardag Advocaat", datum: "2026-06-09", locatie: "Rechtszaal Kloosterstraat", beschrijving: "Onze advocaat zal deze dag jarig zijn. De datum voor de viering zal binnenkort bekend gemaakt worden. Er is momenteel nog een overleg gaande tussen hem en de leidinggevende van het huisfront.", afbeelding: "images/evenementen/rode-golf-cabrio.webp", voorbij: false },
    { id: 5, naam: "Zomervakantie Saint-Tropez", datum: "2026-07-15", datumEind: "2026-07-22", locatie: "Saint-Tropez, Frankrijk", beschrijving: "Deze vakantie kan vanwege omstandigheden niet doorgaan.", afbeelding: "images/evenementen/port-saint-tropez.jpg", voorbij: false, gecanceld: true },
    { id: 6, naam: "DTM Hockenheim", datum: "2026-10-10", datumEind: "2026-10-11", locatie: "Hockenheimring, Duitsland", beschrijving: "Met de leden van de Washmountain richting de DTM race van Hockenheim.", afbeelding: "images/evenementen/dtm-hockenheim.jpeg", voorbij: false }
  ],
  'nieuws.json': [
    { id: 1, titel: "Washmountain website is live!", datum: "2025-04-01", tekst: "De nieuwe site staat online. Meer updates volgen snel.", afbeelding: "" },
    { id: 2, titel: "Weekendtrip in de maak", datum: "2025-04-08", tekst: "We plannen iets speciaals voor augustus, stay tuned.", afbeelding: "" }
  ],
  'planning.json': [
    { id: 1, periode: "April 2026", titel: "C1 op circuit Zolder", beschrijving: "Op het circuit met de Citroën C1 van Mr. Worldwide.", status: "bevestigd", afbeelding: "images/evenementen/c1-zolder.jpeg" },
    { id: 2, periode: "April 2026", titel: "Viering Verjaardag Burgemeester", beschrijving: "Viering van de eerdere verjaardag van de Burgemeester. Dit wordt gedaan in een special diner: ookwel \"Kaasfondue van Lau\" genoemd", status: "bevestigd", afbeelding: "images/evenementen/kaasfondue.webp" },
    { id: 3, periode: "Juni 2026", titel: "Verjaardag President", beschrijving: "Verjaardag van de President. Viering zal later plaatsvinden, datum hiervan wordt binnenkort bekend gemaakt.", status: "bevestigd", afbeelding: "images/evenementen/bbq.webp" },
    { id: 4, periode: "Juni 2026", titel: "Verjaardag Advocaat", beschrijving: "Onze advocaat zal deze dag jarig zijn. De datum voor de viering zal binnenkort bekend gemaakt worden.", status: "bevestigd", afbeelding: "images/evenementen/rode-golf-cabrio.webp" },
    { id: 5, periode: "Juli 2026", titel: "Zomervakantie Saint-Tropez", beschrijving: "Deze vakantie kan vanwege omstandigheden niet doorgaan.", status: "gecanceld", afbeelding: "images/evenementen/port-saint-tropez.jpg" },
    { id: 6, periode: "Oktober 2026", titel: "DTM Hockenheim", beschrijving: "Met de leden van de Washmountain richting de DTM race van Hockenheim.", status: "bevestigd", afbeelding: "images/evenementen/dtm-hockenheim.jpeg" }
  ],
  'members.json': [
    { id: 1, naam: "Noah Smolenaars", functie: "President", initialen: "NS", lidSinds: "21 juni 2023", afbeelding: "images/files/Noah profielfoto.jpeg", kleur: "#004AAD", rang: "hoofd", username: "LilSmollo" },
    { id: 2, naam: "Tygo Kerckhoffs", functie: "Burgemeester", initialen: "TK", lidSinds: "21 juni 2023", afbeelding: "images/files/Tygo profielfoto.jpeg", kleur: "#0a3d8f", rang: "hoofd", username: "BlueMotionGaming" },
    { id: 3, naam: "Vica Schledz", functie: "Chauffeur", initialen: "VS", lidSinds: "21 juni 2023", afbeelding: "images/files/Vica profielfoto.jpeg", kleur: "#1a5276", rang: "lid", username: "Yoshi12102005" },
    { id: 4, naam: "Caspar van de Hoef", functie: "Penningsmeester", initialen: "CH", lidSinds: "21 juni 2023", afbeelding: "images/files/Caspar profielfoto.jpeg", kleur: "#1a5276", rang: "lid", username: "Twsted_69" },
    { id: 5, naam: "Robert van Rooijen", functie: "Advocaat", initialen: "RR", lidSinds: "18 augustus 2024", afbeelding: "images/files/Robert profielfoto.jpeg", kleur: "#1a5276", rang: "lid", username: "RbrtPhantom" },
    { id: 6, naam: "Martijn Caris", functie: "Bewaker", initialen: "MC", lidSinds: "27 mei 2025", afbeelding: "images/files/Martijn profielfoto.jpeg", kleur: "#1a5276", rang: "lid", username: "Gametijger5678" }
  ]
};

/* ===== Helpers ===== */
async function fetchJSON(file) {
  try {
    const res = await fetch(`data/${file}`);
    const data = await res.json();
    return data.filter(item => !item._comment);
  } catch (e) {
    return FALLBACK[file] || [];
  }
}

function formatDate(dateStr) {
  const months = ['januari', 'februari', 'maart', 'april', 'mei', 'juni',
    'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function isUpcoming(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dateStr + 'T00:00:00') >= today;
}

/* ===== Dashboard Live Countdown ===== */
async function initDashboardCountdown() {
  const cdWrapper = document.getElementById('dashboard-countdown');
  if (!cdWrapper) return;

  const events = await fetchJSON('evenementen.json');
  const now = new Date();
  const nextEvent = events
    .filter(e => !e.gecanceld && new Date(e.datum + 'T00:00:00') >= now)
    .sort((a, b) => new Date(a.datum) - new Date(b.datum))[0];

  if (!nextEvent) {
    const titleEl = document.getElementById('dashboard-event-title');
    if (titleEl) titleEl.innerText = "Geen geplande evenementen";
    return;
  }

  const titleEl = document.getElementById('dashboard-event-title');
  const descEl = document.getElementById('dashboard-event-desc');
  const dateEl = document.getElementById('dashboard-event-date');

  if (titleEl) titleEl.innerText = nextEvent.naam;
  if (descEl) descEl.innerText = nextEvent.beschrijving;
  if (dateEl) dateEl.innerText = formatDate(nextEvent.datum);

  const targetDate = new Date(nextEvent.datum + 'T09:00:00').getTime();

  function updateClock() {
    const current = new Date().getTime();
    const diff = targetDate - current;

    if (diff <= 0) {
      const dEl = document.getElementById('cd-days');
      const hEl = document.getElementById('cd-hours');
      const mEl = document.getElementById('cd-minutes');
      const sEl = document.getElementById('cd-seconds');
      if (dEl) dEl.innerText = '00';
      if (hEl) hEl.innerText = '00';
      if (mEl) mEl.innerText = '00';
      if (sEl) sEl.innerText = '00';
      return;
    }

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    const elD = document.getElementById('cd-days');
    const elH = document.getElementById('cd-hours');
    const elM = document.getElementById('cd-minutes');
    const elS = document.getElementById('cd-seconds');

    if (elD) elD.innerText = String(d).padStart(2, '0');
    if (elH) elH.innerText = String(h).padStart(2, '0');
    if (elM) elM.innerText = String(m).padStart(2, '0');
    if (elS) elS.innerText = String(s).padStart(2, '0');
  }

  updateClock();
  setInterval(updateClock, 1000);
}

/* ===== Dynamic Marquee Logos Loader ===== */
async function loadMarqueeLogos() {
  const track = document.querySelector('.marquee-track');
  if (!track) return;

  try {
    const res = await fetch('data/logos.json');
    if (!res.ok) return;
    const logos = await res.json();
    if (!Array.isArray(logos) || logos.length === 0) return;

    // Render Set 1 & Set 2 for seamless infinite scroll
    const renderItems = (items) => items.map(l => {
      const src = l.file.startsWith('http') || l.file.startsWith('/') || l.file.startsWith('images/')
        ? l.file
        : `images/logos/${l.file}`;
      return `<img src="${src}" alt="${l.name}">`;
    }).join('\n      ');

    track.innerHTML = `
      <!-- Set 1 -->
      ${renderItems(logos)}
      <!-- Set 2 -->
      ${renderItems(logos)}
    `;
  } catch (e) {
    // Keep existing fallback HTML if fetch fails
  }
}

/* ===== Home — Events Widget (max 3) ===== */
async function loadHomeEvents() {
  const container = document.getElementById('home-events');
  if (!container) return;

  const events = await fetchJSON('evenementen.json');
  const upcoming = events.filter(e => isUpcoming(e.datum)).slice(0, 3);

  if (upcoming.length === 0) {
    container.innerHTML = '<p style="color: var(--color-subtext);">Geen aankomende evenementen.</p>';
    return;
  }

  container.innerHTML = upcoming.map(e => renderEventCard(e)).join('');
}

function renderEventCard(e, badgeType) {
  const imgHtml = e.afbeelding
    ? `<img src="${e.afbeelding}" alt="${e.naam}" class="card-image">`
    : '';
  const cancelledClass = e.gecanceld ? ' cancelled' : '';
  const upcomingClass = (badgeType === 'upcoming' && !e.gecanceld) ? ' upcoming' : '';
  const pastClass = badgeType === 'past' ? ' past' : '';
  const badgeHtml = badgeType === 'upcoming' ? '<span class="badge badge-upcoming">Aankomend</span>'
    : badgeType === 'past' ? '<span class="badge badge-past">Voorbij</span>'
    : '';
  const cancelBadge = e.gecanceld ? '<span class="badge badge-cancelled">Gecanceld</span>' : '';
  return `
    <div class="card${cancelledClass}${upcomingClass}${pastClass}">
      ${imgHtml}
      ${cancelBadge || badgeHtml}
      <div class="card-date"${badgeType ? ' style="margin-top: 10px;"' : ''}>${formatDate(e.datum)}${e.datumEind ? ' — ' + formatDate(e.datumEind) : ''}</div>
      <div class="card-title">${e.naam}</div>
      ${e.locatie ? `<div class="card-location">${e.locatie}</div>` : ''}
      <div class="card-text">${e.beschrijving}</div>
    </div>
  `;
}

/* ===== Home — News Widget (max 2) ===== */
async function loadHomeNews() {
  const container = document.getElementById('home-news');
  if (!container) return;

  const news = await fetchJSON('nieuws.json');
  const latest = news.sort((a, b) => b.datum.localeCompare(a.datum)).slice(0, 2);

  container.innerHTML = latest.map(n => renderNewsArticle(n)).join('');
}

/* ===== Evenementen Page ===== */
async function loadEvenementen() {
  const upcomingContainer = document.getElementById('events-upcoming');
  const pastContainer = document.getElementById('events-past');
  if (!upcomingContainer || !pastContainer) return;

  const events = await fetchJSON('evenementen.json');
  const upcoming = events.filter(e => isUpcoming(e.datum));
  const past = events.filter(e => !isUpcoming(e.datum));

  if (upcoming.length === 0) {
    upcomingContainer.innerHTML = '<p style="color: var(--color-subtext);">Geen aankomende evenementen.</p>';
  } else {
    upcomingContainer.innerHTML = upcoming.map(e => renderEventCard(e, 'upcoming')).join('');
  }

  if (past.length === 0) {
    pastContainer.innerHTML = '<p style="color: var(--color-subtext);">Geen verleden evenementen.</p>';
  } else {
    const noPast = document.getElementById('no-past');
    if (noPast) noPast.remove();
    pastContainer.innerHTML = past.map(e => renderEventCard(e, 'past')).join('');
  }
}

/* ===== Nieuws Page ===== */
async function loadNieuws() {
  const container = document.getElementById('news-list');
  if (!container) return;

  const news = await fetchJSON('nieuws.json');
  const sorted = news.sort((a, b) => b.datum.localeCompare(a.datum));

  container.innerHTML = sorted.map(n => renderNewsArticle(n)).join('');
}

function renderNewsArticle(n) {
  const imgHtml = n.afbeelding
    ? `<img src="${n.afbeelding}" alt="${n.titel}">`
    : '';
  return `
    <article class="news-article">
      ${imgHtml}
      <div class="news-body">
        <div class="news-date">${formatDate(n.datum)}</div>
        <div class="news-title">${n.titel}</div>
        <div class="news-text">${n.tekst}</div>
      </div>
    </article>
  `;
}

/* ===== Planning Page (Timeline) ===== */
async function loadPlanning() {
  const container = document.getElementById('timeline');
  if (!container) return;

  const items = await fetchJSON('planning.json');

  container.innerHTML = items.map(item => {
    const imgHtml = item.afbeelding
      ? `<img src="${item.afbeelding}" alt="${item.titel}" class="timeline-image">`
      : '';
    return `
      <div class="timeline-item">
        <div class="timeline-date">${item.periode}</div>
        <div class="timeline-dot-wrapper">
          <div class="timeline-dot ${item.status}"></div>
        </div>
        <div class="timeline-content ${item.status}">
          ${imgHtml}
          <h3>${item.titel}</h3>
          <p>${item.beschrijving}</p>
          <span class="timeline-status ${item.status}">${item.status}</span>
        </div>
      </div>
    `;
  }).join('');
}

/* ===== Files Page (files.html) ===== */
async function initMembers() {
  const isLoggedIn = localStorage.getItem('wm_isLoggedIn') === 'true';
  if (!isLoggedIn) {
     window.location.href = 'login.html';
     return;
  }
  
  const mainEl = document.getElementById('wie-is-wie-main');
  if (mainEl) mainEl.style.display = 'block';

  const members = await fetchJSON('members.json');
  renderMembers(members);
}

function renderMembers(members) {
  const featContainer = document.getElementById('members-featured');
  const gridContainer = document.getElementById('members-grid');
  const ereContainer = document.getElementById('members-ereleden');

  if (!featContainer || !gridContainer || !ereContainer) return;

  const getPhotoHtml = (m) => {
    if (m.afbeelding) {
      const styles = m.rotation ? `style="transform: rotate(${m.rotation}deg);"` : '';
      return `<img src="${m.afbeelding}" alt="${m.naam}" class="member-photo" ${styles}>`;
    }
    return `<div class="member-photo" style="background-color: ${m.kleur || 'var(--color-primary)'};">${m.initialen}</div>`;
  };

  const getCardHtml = (m, extraClass = '') => `
    <a href="lid.html?id=${m.id}" class="member-card ${extraClass}">
      ${getPhotoHtml(m)}
      <h3 class="member-name">${m.naam}</h3>
      <div class="member-role">${m.functie}</div>
      ${m.beschrijving ? `<p class="member-desc">${m.beschrijving}</p>` : ''}
    </a>
  `;

  // Filter
  const headers = members.filter(m => m.rang === 'hoofd');
  const regular = members.filter(m => m.rang === 'lid');
  const honorary = members.filter(m => m.rang === 'erelid');

  featContainer.innerHTML = headers.map(m => getCardHtml(m, 'featured')).join('');
  gridContainer.innerHTML = regular.map(m => getCardHtml(m, 'regular')).join('');
  ereContainer.innerHTML = honorary.map(m => getCardHtml(m, 'ere')).join('');
}

/* ===== Member Detail Page (lid.html) ===== */
async function initLid() {
  const isLoggedIn = localStorage.getItem('wm_isLoggedIn') === 'true';
  if (!isLoggedIn) {
     window.location.href = 'login.html';
     return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const idStr = urlParams.get('id');
  if (!idStr) {
    window.location.href = 'files.html';
    return;
  }
  
  const id = parseInt(idStr, 10);
  const members = await fetchJSON('data/members.json');
  const member = members.find(m => m.id === id);

  if (!member) {
    window.location.href = 'files.html';
    return;
  }

  renderLid(member);
}

function renderLid(m) {
  const container = document.getElementById('lid-detail-container');
  if (!container) return;

  const getPhotoHtml = (m) => {
    if (m.afbeelding) {
      const styles = m.rotation ? `style="transform: rotate(${m.rotation}deg);"` : '';
      return `<img src="${m.afbeelding}" alt="${m.naam}" class="lid-photo" ${styles}>`;
    }
    return `<div class="lid-photo placeholder" style="background-color: ${m.kleur || 'var(--color-primary)'};">${m.initialen}</div>`;
  };

  container.innerHTML = `
    <div class="lid-detail-card">
      <div class="lid-detail-header">
        ${getPhotoHtml(m)}
        <div class="lid-detail-titles">
          <h1>${m.naam}</h1>
          <div class="lid-role">${m.functie}</div>
        </div>
      </div>
      
      <div class="lid-info-grid">
        <div class="lid-info-item">
          <strong>Lid sinds</strong>
          <span>${m.lidSinds || 'N/A'}</span>
        </div>
        <div class="lid-info-item">
          <strong>Gevestigd in</strong>
          <span>${m.gevestigdIn || 'N/A'}</span>
        </div>
        <div class="lid-info-item">
          <strong>Username</strong>
          <span>${m.username || 'N/A'}</span>
        </div>
        <div class="lid-info-item">
          <strong>Bijnaam</strong>
          <span>${m.bijnaam || 'N/A'}</span>
        </div>
      </div>

      <div class="lid-detail-body">
        ${m.beschrijving ? `<p>${m.beschrijving}</p>` : '<p><i>Geen extra informatie beschikbaar.</i></p>'}
      </div>

      <div class="lid-momenten-sectie">
        <h3>Momenten</h3>
        <div class="lid-momenten-grid">
          ${(m.momenten || ['', '', '', '']).map(src => {
            if (!src) return `<div class="lid-moment-item placeholder-moment"><span>Geen afbeelding</span></div>`;
            const isVideo = src.toLowerCase().match(/\.(mp4|mov|webm)$/);
            if (isVideo) {
              return `
                <div class="lid-moment-item">
                  <video src="${src}" muted loop playsinline autoplay style="width: 100%; height: 100%; object-fit: cover;"></video>
                </div>`;
            }
            return `<div class="lid-moment-item"><img src="${src}" alt="Moment van ${m.naam}"></div>`;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}

/* ===== Feedback Form met Discord Webhook ===== */
function initFeedbackForm() {
  const form = document.getElementById('idea-form');
  const successMsg = document.getElementById('idea-success');
  const textArea = document.getElementById('idea-text');
  
  if (!form || !successMsg || !textArea) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const text = textArea.value.trim();
    if (!text) return;
    
    // Discord Webhook Configuratie
    const webhookUrl = 'https://discord.com/api/webhooks/1489237568888373489/3hd8Rq8wILUADABW3srSHpX99eTAVnNu-8Q-wlNLLLNw3ACdBY39YZLEa7wAiuCOgRLq';
    
    const payload = {
      content: "💡 **Nieuw website idee / feedback:**\n" + "> " + text.replace(/\n/g, "\n> ")
    };
    
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      // Succesvolle verzending
      textArea.value = '';
      successMsg.style.display = 'block';
      
      setTimeout(() => {
        successMsg.style.display = 'none';
      }, 4000);
      
    } catch (error) {
      console.error('Fout bij versturen naar Discord:', error);
      alert('Er ging iets mis bij het versturen. Probeer het later opnieuw.');
    }
  });
}
