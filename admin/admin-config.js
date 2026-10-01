// =========================================================================
// WASHMOUNTAIN CMS CONFIGURATIEBESTAND (admin-config.js)
// =========================================================================

window.CMS_CONFIG = {
    // ---------------------------------------------------------------------
    // 1. BRANDING & IDENTITEIT
    // ---------------------------------------------------------------------
    siteName: "Washmountain",
    domain: "washmountain.nl",
    logoUrlLogin: "../images/logos/washmountain-logo-white.png", // Logo op inlogscherm en sidebar
    logoUrlInvoice: "images/logos/washmountain-logo.png",
    defaultEmail: "info@washmountain.nl",
    defaultAuthor: "Washmountain Crew",

    // ---------------------------------------------------------------------
    // 2. FEATURE FLAGS (Welke modules zijn zichtbaar?)
    // ---------------------------------------------------------------------
    features: {
        contentEditor: true,   // data-cms-id inline tekst & afbeeldingen bewerken
        blog: true,            // Blog & nieuws artikelenbeheer met Quill editor
        partnerLogos: true,    // Partner- en sponsorlogo's in de scrolling marquee balk
        pageBuilder: true,     // Subpagina's beheren
        seo: true,             // Meta titels, beschrijvingen en OpenGraph tags
        analytics: true,       // Analytics & statistieken
        navigation: true,      // Menu en footer links beheren
        agencyCRM: false,      // CRM uitgeschakeld voor Washmountain community
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
        { id: 'blog', name: 'Blog & Nieuws', icon: 'fa-newspaper', file: 'blog.html', category: 'Hoofdmenu' },
        { id: 'games', name: 'Games Arcade', icon: 'fa-gamepad', file: 'games.html', category: 'Community' },
        { id: 'files', name: 'Leden & Files', icon: 'fa-folder-open', file: 'files.html', category: 'Community' },
        { id: 'evenementen', name: 'Evenementen', icon: 'fa-calendar-check', file: 'evenementen.html', category: 'Planning' },
        { id: 'planning', name: 'Projectplanning', icon: 'fa-timeline', file: 'planning.html', category: 'Planning' },
        { id: 'diensten', name: 'Dienstensysteem', icon: 'fa-clipboard-list', file: 'diensten.html', category: 'Organisatie' },
        { id: 'radio', name: 'Live Radio & DJ', icon: 'fa-radio', file: 'radio.html', category: 'Media' },
        { id: 'app', name: 'Washmountain App', icon: 'fa-mobile-screen', file: 'app.html', category: 'Media' }
    ],

    // ---------------------------------------------------------------------
    // 5. PAGE BUILDER TEMPLATES
    // ---------------------------------------------------------------------
    templates: [
        { 
            id: 'blog', 
            name: 'Nieuws & Blog Artikel', 
            icon: 'fa-pen-nib', 
            file: 'blog-artikel.html',
            description: 'Plaats een nieuw community update, verslag van een rit of evenementenaankondiging.'
        },
        { 
            id: 'landing', 
            name: 'Landingspagina / Gids', 
            icon: 'fa-bullhorn', 
            file: 'template-landing.html',
            description: 'Bouw een speciale landingspagina of themapagina.'
        }
    ],

    // ---------------------------------------------------------------------
    // 6. ORGANISATIE GEGEVENS
    // ---------------------------------------------------------------------
    companyName: "Washmountain Community",
    companyKvk: "",
    companyBtw: "",
    companyIban: "",

    supabaseUrl: "",
    supabaseKey: ""
};
