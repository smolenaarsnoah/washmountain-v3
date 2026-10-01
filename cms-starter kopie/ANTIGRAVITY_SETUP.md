# Antigravity Instructies — Bouw een Nieuwe Website met dit Headless CMS

> **Instructie voor de Antigravity AI Agent**:
> Dit project is een **universeel, statisch Headless CMS** dat draait via **Cloudflare Pages** en de **GitHub REST API**.
> Volg de onderstaande richtlijnen strikt wanneer de gebruiker vraagt om een nieuwe website of blog (bijv. over keukens, tech, lifestyle, reizen) te bouwen op basis van deze template.

---

## 1. Hoe dit CMS-systeem werkt

1. **100% Statisch & Serverless**:
   Er is geen backend server nodig. Alle pagina's zijn statische HTML-bestanden die worden gehost op Cloudflare Pages.
2. **Beheeromgeving (`/admin/`)**:
   - `admin/index.html`: Een modern, responsief CMS-dashboard.
   - `admin/admin-config.js`: Centrale configuratie (naam, logo, kleuren, actieve modules, inlogaccounts).
   - `admin/config.json`: Bevat het met het wachtwoord versleutelde GitHub Personal Access Token (PAT).
3. **Frontend Runtime (`js/cms-client.js`)**:
   - Zoekt op elke HTML-pagina naar elementen met het attribuut `data-cms-id="sleutel-naam"`.
   - Haalt bij het laden `content.json` op en vult automatisch de teksten en afbeeldingen in.
   - Rendert de blog-overzichtspagina (`#blog-grid`) en detailpagina (`#blog-detail-container`) direct uit `articles.json`.
   - Rendert dynamisch het hoofdmenu en mobiele menu.
4. **Cloudflare Pages & GitHub Sync**:
   Wanneer de gebruiker in `/admin/` op **Opslaan** of **Publiceren** klikt, pleegt het CMS via de GitHub REST API direct een commit naar `content.json`, `articles.json` of nieuwe HTML-bestanden. Cloudflare Pages detecteert deze commit automatisch en zet de wijzigingen binnen ~1 minuut live.

---

## 2. Stappenplan voor het transformeren naar een nieuwe niche

Wanneer de gebruiker vraagt: *"Bouw een nieuwe website over [Onderwerp / Bedrijfsnaam]"*, voer dan de volgende stappen uit:

### Stap 1: Pas `admin/admin-config.js` aan
1. Wijzig `siteName`, `domain`, `defaultEmail` en `defaultAuthor` naar het nieuwe onderwerp.
2. Stel de `features` in:
   - Voor blogs & affiliate sites: zet `agencyCRM: false`.
   - Voor freelance bureaus / dienstverleners: zet `agencyCRM: true`.
3. Pas de standaard inloggegevens (`fallbackCredentials`) eventueel aan naar wens van de gebruiker.

### Stap 2: Stem de huisstijl af in `css/style.css`
Pas de CSS-variabelen bovenaan `css/style.css` aan zodat de sfeer past bij het onderwerp:
- *Keukens / Interieur*: Warme aardetinten, walnoot, zand en stijlvolle accenten (`#0f172a`, `#c5a059`, `#b45309`).
- *Tech / SaaS*: Modern blauw of paars (`#2563eb`, `#7c3aed`).
- *Gezondheid / Natuur*: Fris groen of salietinten (`#15803d`, `#0d9488`).

### Stap 3: Vul `content.json` met relevante teksten
Zorg dat alle sleutels overeenkomen met de `data-cms-id` attributen op de pagina's:
- `home-hero-tag`, `home-hero-title`, `home-hero-subtitle`, `home-hero-btn1-text`, etc.
- `home-about-title`, `home-about-text`.
- `blog-title`, `blog-subtitle`.
- `footer-tagline`, `footer-email`.

### Stap 4: Genereer 3 tot 5 kwalitatieve voorbeeldartikelen in `articles.json`
Schrijf realistische, diepgaande en aantrekkelijke artikelen die direct passen bij de gekozen niche:
- Elk artikel heeft een unieke `id`, `slug`, `title`, `category`, `date`, `author`, `image` (hoge kwaliteit Unsplash URL), `excerpt` en rijke `content` (inclusief `<h2>`, `<p>`, `<blockquote>` en opsommingen).
- Zet `"status": "published"`.

### Stap 5: Werk `img/logo.svg` en pagina-titels bij
- Pas `img/logo.svg` aan met de nieuwe websitenaam.
- Controleer `<title>` en `<meta name="description">` in `index.html`, `blog.html`, `blog-artikel.html` en `contact.html`.

---

## 3. Belangrijke Ontwikkelregels

1. **Behoud van `data-cms-id`**:
   Verwijder nooit zomaar `data-cms-id` attributen uit de HTML. Deze zorgen ervoor dat de beheerder de teksten later via het dashboard kan aanpassen.
2. **Altijd scripts laden**:
   Zorg dat elke HTML-pagina altijd de volgende twee scripts onderaan heeft:
   ```html
   <script src="admin/admin-config.js"></script>
   <script src="js/cms-client.js"></script>
   ```
3. **Lokale preview starten**:
   Je kunt de website lokaal testen en bekijken via:
   ```bash
   npx wrangler pages dev . --port 8788
   ```
   Open `http://localhost:8788` voor de frontend en `http://localhost:8788/admin/` voor het beheerportaal.
