// =========================================================================
// WASHMOUNTAIN CMS CONFIGURATIEBESTAND (admin-config.js)
// =========================================================================

window.CMS_CONFIG = {
    // ---------------------------------------------------------------------
    // 1. BRANDING & IDENTITEIT
    // ---------------------------------------------------------------------
    siteName: "Washmountain",
    domain: "washmountain.nl",
    logoUrlLogin: "../images/logos/washmountain-logo-white.png",
    logoUrlInvoice: "images/logos/washmountain-logo.png",
    defaultEmail: "info@washmountain.nl",
    defaultAuthor: "Washmountain Crew",

    // ---------------------------------------------------------------------
    // 2. FEATURE FLAGS
    // ---------------------------------------------------------------------
    features: {
        contentEditor: true,   // data-cms-id teksten bewerken
        partnerLogos: true,    // Partner- en sponsorlogo's in de marquee balk
        blog: false,           // Blogs uitgeschakeld
        pageBuilder: true,     // Subpagina's beheren
        seo: true,             // Meta titels & Google omschrijvingen
        analytics: true,       // Statistieken
        navigation: false,     // Vaste menustructuur
        agencyCRM: false,      // CRM uitgeschakeld
        users: true            // CMS gebruikers en toegangsrechten
    },

    // ---------------------------------------------------------------------
    // 3. INLOGGEGEVENS (Gebruikersnaam: Admin | Wachtwoord: JohnJanssen)
    // ---------------------------------------------------------------------
    fallbackCredentials: {
        'Admin': { 
            password: 'JohnJanssen', 
            permissions: ['*'] 
        },
        'admin': { 
            password: 'JohnJanssen', 
            permissions: ['*'] 
        }
    },

    // ---------------------------------------------------------------------
    // 4. VASTE PAGINA'S VAN DE WASHMOUNTAIN WEBSITE
    // ---------------------------------------------------------------------
    pagesConfig: [
        { id: 'home', name: 'Dashboard (Home)', icon: 'fa-house', file: 'index.html', category: 'Hoofdmenu' },
        { id: 'games', name: 'Games Arcade', icon: 'fa-gamepad', file: 'games.html', category: 'Community' },
        { id: 'files', name: 'Leden & Files', icon: 'fa-folder-open', file: 'files.html', category: 'Community' },
        { id: 'evenementen', name: 'Evenementen', icon: 'fa-calendar-check', file: 'evenementen.html', category: 'Community' },
        { id: 'radio', name: 'Live Radio & DJ', icon: 'fa-radio', file: 'radio.html', category: 'Media' },
        { id: 'app', name: 'Washmountain App', icon: 'fa-mobile-screen', file: 'app.html', category: 'Media' }
    ],

    // ---------------------------------------------------------------------
    // 5. TEMPLATES
    // ---------------------------------------------------------------------
    templates: [
        { 
            id: 'landing', 
            name: 'Landingspagina / Gids', 
            icon: 'fa-bullhorn', 
            file: 'template-landing.html',
            description: 'Bouw een speciale landingspagina of themapagina.'
        }
    ],

    companyName: "Washmountain Community",
    githubOwner: "smolenaarsnoah",
    githubRepo: "washmountain-v3",
    companyKvk: "",
    companyBtw: "",
    companyIban: "",
    supabaseUrl: "",
    supabaseKey: ""
};
