# Headless CMS Website Starter Kit (Cloudflare Pages + GitHub)

Dit starter-pakket is een complete, kant-en-klare blauwdruk voor het razendsnel opzetten van nieuwe websites, niche-blogs (bijv. keukens, interieur, gadgets) en lead-generatie sites met een eigen ingebouwd beheerportaal.

---

## 🚀 In 3 Minuten een Nieuwe Website Starten

### Stap 1: Kopieer deze map
Kopieer de inhoud van de map `cms-starter` naar een nieuwe projectmap op je computer (bijvoorbeeld `Mijn-Nieuwe-Keukenblog`).

### Stap 2: Open een nieuwe chat met Antigravity
Open Antigravity in je nieuwe projectmap en stuur simpelweg:
> *"Lees ANTIGRAVITY_SETUP.md en bouw een complete website over moderne keukens genaamd KeukenExclusief"*

Antigravity zal automatisch:
- De configuratie in `admin/admin-config.js` aanpassen.
- De kleurstelling en het logo updaten.
- `content.json` vullen met pakkende teksten.
- Prachtige artikelen toevoegen aan `articles.json`.

### Stap 3: Live zetten via GitHub en Cloudflare Pages
1. Maak een nieuwe lege repository aan op [GitHub](https://github.com/new).
2. Push je code naar GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit van nieuwe website"
   git branch -M main
   git remote add origin https://github.com/jouw-gebruikersnaam/jouw-nieuwe-repo.git
   git push -u origin main
   ```
3. Ga naar [Cloudflare Pages](https://dash.cloudflare.com/), klik op **Create a project** > **Connect to Git** en selecteer je nieuwe repository.
4. Klik op **Save and Deploy**. Je website staat binnen 1 minuut live op een `.pages.dev` URL of je eigen gekoppelde domein!

---

## 🔑 Het Beheersysteem Gebruiken (`/admin/`)

1. Ga in je browser naar `https://jouw-website.nl/admin/` (of `http://localhost:8788/admin/` lokaal).
2. Log in met de inloggegevens uit `admin/admin-config.js`:
   - **Gebruikersnaam**: `admin`
   - **Wachtwoord**: `welkom123`
3. Klik rechtsboven op **Instellingen** (het tandwiel-icoon).
4. Vul je **GitHub gebruikersnaam**, **Repository naam** en je **GitHub Personal Access Token (PAT)** in en klik op **Opslaan**.
5. *Klaar!* Het CMS versleutelt deze gegevens automatisch met je wachtwoord in `admin/config.json`. Voortaan worden alle bewerkingen die je doet (teksten aanpassen, nieuwe blogs publiceren, afbeeldingen uploaden) direct via de GitHub API weggeschreven en door Cloudflare live gezet.

---

## ⚙️ Structuur & Belangrijke Bestanden

| Bestand / Map | Doel |
|---|---|
| `admin/` | Het complete beheerportaal (index.html, configuratie en versleuteling). |
| `admin/admin-config.js` | Centrale instellingen: websitenaam, domein, actieve modules en accounts. |
| `js/cms-client.js` | De frontend engine die teksten, navigatie en blogs automatisch rendert. |
| `css/style.css` | Moderne, responsive opmaak met eenvoudig aanpasbare CSS-kleurvariabelen. |
| `articles.json` | De blog-artikelen database (titel, inhoud, datum, categorie, auteur, thumbnail). |
| `content.json` | De database met alle bewerkbare teksten van de vaste pagina's. |
| `pages.json` | Het register van alle aangemaakte pagina's voor de CMS zijbalk. |
| `wrangler.toml` | De Cloudflare Pages configuratie. |
| `ANTIGRAVITY_SETUP.md` | Speciale instructies voor Antigravity om direct een nieuwe site te genereren. |
