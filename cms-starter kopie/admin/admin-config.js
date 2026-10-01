// =========================================================================
// UNIVERSEEL CMS CONFIGURATIEBESTAND (admin-config.js)
// =========================================================================
// Pas dit bestand aan voor elke nieuwe website. Hier bepaal je de naam, het
// domein, welke modules actief zijn (bijv. blog wel, boekhouding niet) en
// wie er kan inloggen.

window.CMS_CONFIG = {
    // ---------------------------------------------------------------------
    // 1. BRANDING & IDENTITEIT
    // ---------------------------------------------------------------------
    siteName: "Keuken Inspiratie",                      // Naam van de site in het dashboard & login
    domain: "keukeninspiratie.nl",                      // Domeinnaam (voor previews en canonical links)
    logoUrlLogin: "../img/logo.svg",                    // Logo op inlogscherm en sidebar (relatief vanaf /admin/)
    logoUrlInvoice: "img/logo.svg",                     // Logo op facturen/offertes (relatief vanaf root)
    defaultEmail: "info@keukeninspiratie.nl",           // Standaard contactadres
    defaultAuthor: "Redactie Keuken Inspiratie",         // Standaard auteur voor nieuwe blogs

    // ---------------------------------------------------------------------
    // 2. FEATURE FLAGS (Welke modules zijn zichtbaar?)
    // ---------------------------------------------------------------------
    // Zet functies aan of uit naar gelang het type website:
    // - Voor blogs / content sites: zet agencyCRM op false.
    // - Voor freelance / marketing bureaus: zet agencyCRM op true.
    features: {
        contentEditor: true,   // data-cms-id inline tekst & afbeeldingen bewerken
        blog: true,            // Blog & artikelenbeheer met Quill editor & image upload
        pageBuilder: true,     // Nieuwe subpagina's genereren met templates
        seo: true,             // Meta titels, beschrijvingen en OpenGraph tags
        analytics: true,       // Cloudflare / Google Analytics & klikstatistieken
        navigation: true,      // Menu en footer links beheren
        agencyCRM: false,      // Facturen, offertes, urenregistratie & belasting (intern)
        users: true            // CMS gebruikers en toegangsrechten
    },

    // ---------------------------------------------------------------------
    // 3. EERSTE INLOGGEGEVENS (Fallback Accounts)
    // ---------------------------------------------------------------------
    // Deze gegevens zijn actief totdat er een versleuteld GitHub-token is opgeslagen
    // in admin/config.json, of dienen als nood-inlog.
    // Rechten: '*' = volledige toegang.
    fallbackCredentials: {
        'admin': { 
            password: 'welkom123', 
            permissions: ['*'] 
        }
    },

    // ---------------------------------------------------------------------
    // 4. STANDAARD VASTE PAGINA'S (In de CMS zijbalk)
    // ---------------------------------------------------------------------
    pagesConfig: [
        { id: 'home', name: 'Home', icon: 'fa-house', file: 'index.html', category: 'Hoofdmenu' },
        { id: 'blog', name: 'Blog Overzicht', icon: 'fa-newspaper', file: 'blog.html', category: 'Hoofdmenu' },
        { id: 'contact', name: 'Contact', icon: 'fa-envelope', file: 'contact.html', category: 'Hoofdmenu' }
    ],

    // ---------------------------------------------------------------------
    // 5. PAGE BUILDER TEMPLATES
    // ---------------------------------------------------------------------
    templates: [
        { 
            id: 'blog', 
            name: 'Blog / Artikel', 
            icon: 'fa-pen-nib', 
            file: 'blog-artikel.html',
            description: 'Schrijf een nieuw inspirerend artikel. Met hero-afbeelding, categorisering en volledige SEO-velden.'
        },
        { 
            id: 'landing', 
            name: 'Landingspagina / Gids', 
            icon: 'fa-bullhorn', 
            file: 'template-landing.html',
            description: 'Bouw een conversiegerichte landingspagina of themapagina met call-to-action.'
        }
    ],

    // ---------------------------------------------------------------------
    // 6. BEDRIJFSGEGEVENS (Alleen van toepassing indien agencyCRM actief is)
    // ---------------------------------------------------------------------
    companyName: "Keuken Inspiratie B.V.",
    companyKvk: "12345678",
    companyBtw: "NL123456789B01",
    companyIban: "NL00 BANK 0123 4567 89",

    // Supabase verbinding (optioneel, alleen bij urenregistratie/CRM)
    supabaseUrl: "",
    supabaseKey: ""
};
