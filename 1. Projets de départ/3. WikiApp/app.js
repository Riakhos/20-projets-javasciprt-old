// ===========================
// GESTION NAVIGATION
// ===========================

// Listener pour les messages des extensions de navigateur
// Empêche les erreurs d'extensions qui essaient de communiquer avec la page
window.addEventListener(
    "message",
    (event) => {
        // Ignorer les messages des extensions (ils viennent généralement de l'extension elle-même)
        // Cette fonction retourne undefined (pas true) pour éviter l'erreur
        return;
    },
    false
);

document.addEventListener("DOMContentLoaded", function () {
    // ===========================
    // GESTION DU MENU BURGER
    // ===========================
    const burger = document.getElementById("burger-menu");
    const navUl = document.querySelector("#nav-links");

    if (burger && navUl) {
        // Au clic sur le burger, ouvrir/fermer le menu
        // Toggle la classe 'open' pour afficher/masquer la navigation mobile
        burger.addEventListener("click", () => {
            // Bascule entre l'état ouvert et fermé
            const isOpen = navUl.classList.contains("open");
            if (isOpen) {
                // Ajoute la classe 'closing' pour déclencher l'animation de sortie
                navUl.classList.add("closing");
                // Retire la classe 'open' après l'animation (1s)
                setTimeout(() => {
                    navUl.classList.remove("open", "closing");
                }, 1000);
            } else {
                // Retire la classe 'closing' et ajoute 'open' pour ouvrir le menu
                navUl.classList.remove("closing");
                navUl.classList.add("open");
            }
            // Change l'icône du burger en fonction de l'état du menu
            burger.src = navUl.classList.contains("open")
                ? "./assets/close.svg" // Icône de fermeture quand le menu est ouvert
                : "./assets/burger.svg"; // Icône burger par défaut
        });

        // Ferme le menu si on repasse en mode desktop lors d'un redimensionnement
        // Écoute les changements de taille de fenêtre
        window.addEventListener("resize", () => {
            // Si la largeur dépasse 820px (breakpoint desktop)
            if (window.innerWidth > 820) {
                // Réinitialise l'état du menu
                navUl.classList.remove("open");
                burger.src = "./assets/burger.svg";
            }
        });

        // Fermer le menu quand on clique sur un lien en mode mobile
        // Améliore l'UX en fermant automatiquement le menu après navigation

        // Sélectionner tous les liens directs sauf les dropdown-toggle
        const navLinks = navUl.querySelectorAll("a:not(.dropdown-toggle)");
        // Ajouter aussi tous les liens dans les dropdown-menu
        const dropdownLinks = navUl.querySelectorAll(".dropdown-menu a");

        // Combiner tous les liens dans un seul tableau
        const allLinks = [...navLinks, ...dropdownLinks];

        // Pour chaque lien, ajouter un écouteur de clic
        allLinks.forEach((link) => {
            link.addEventListener("click", () => {
                // Uniquement en mode mobile (largeur <= 820px)
                if (window.innerWidth <= 820) {
                    // Ajoute la classe 'closing' pour déclencher l'animation de sortie
                    navUl.classList.add("closing");
                    // Retire la classe 'open' après l'animation (1s)
                    setTimeout(() => {
                        navUl.classList.remove("open", "closing");
                        burger.src = "./assets/burger.svg";
                    }, 1000);
                }
            });
        });
    } else {
        console.error("L'élément burger ou nav n'a pas été trouvé");
    }

    // ===========================
    // GESTION DES DROPDOWNS
    // ===========================
    const dropdowns = document.querySelectorAll(".dropdown");

    // Fonction utilitaire pour fermer tous les dropdowns ouverts
    // Permet de s'assurer qu'un seul dropdown est ouvert à la fois
    function closeAllDropdowns() {
        dropdowns.forEach((dropdown) => {
            dropdown.classList.remove("active");
        });
    }

    // Gestion des événements pour chaque dropdown
    dropdowns.forEach((dropdown) => {
        const toggle = dropdown.querySelector(".dropdown-toggle");

        // Gestion du clic sur le bouton toggle (lien avec flèche)
        toggle.addEventListener("click", function (e) {
            // Empêche le comportement par défaut du lien
            e.preventDefault();
            // Empêche la propagation pour éviter de fermer immédiatement le dropdown
            e.stopPropagation();

            // Si ce dropdown est déjà actif, le fermer (comportement toggle)
            if (dropdown.classList.contains("active")) {
                closeAllDropdowns();
                return; // Sortir de la fonction
            }

            // Fermer tous les autres dropdowns avant d'ouvrir celui-ci
            // Garantit qu'un seul dropdown est ouvert à la fois
            closeAllDropdowns();

            // Activer ce dropdown en ajoutant la classe 'active'
            dropdown.classList.add("active");
        });

        // Empêcher la fermeture quand on clique à l'intérieur du dropdown
        // Permet de cliquer sur les liens du menu sans fermer le dropdown prématurément
        const dropdownMenu = dropdown.querySelector(".dropdown-menu");
        if (dropdownMenu) {
            dropdownMenu.addEventListener("click", function (e) {
                // Stoppe la propagation de l'événement vers le document
                e.stopPropagation();
            });
        }
    });

    // Fermer les dropdowns en cliquant ailleurs ou sur l'overlay mobile
    // Gestion différente selon le contexte (mobile ou desktop)
    document.addEventListener("click", function (e) {
        // Si on clique sur l'overlay mobile (pseudo-element ::before)
        const activeDropdown = document.querySelector(".dropdown.active");
        if (activeDropdown && window.innerWidth <= 820) {
            const dropdownMenu = activeDropdown.querySelector(".dropdown-menu");
            // Vérifie que le clic n'est pas sur le menu ou le bouton toggle
            if (
                dropdownMenu &&
                !dropdownMenu.contains(e.target) &&
                !e.target.closest(".dropdown-toggle")
            ) {
                closeAllDropdowns();
            }
        } else if (!e.target.closest(".dropdown")) {
            // En desktop, fermer si on clique en dehors d'un dropdown
            closeAllDropdowns();
        }
    });

    // Fermer avec la touche Escape
    // Améliore l'accessibilité clavier
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
            closeAllDropdowns();
        }
    });
});

// ===========================
// GESTION WIKIAPP
// ===========================

// API ENDPOINT : `https://fr.wikipedia.org/w/api.php?action=query&list=search&format=json&origin=*&srlimit=20&srsearch=${searchInput}`

// Initialisation de WikiApp après le chargement complet du DOM
document.addEventListener("DOMContentLoaded", () => {
    // ===========================
    // SÉLECTION DES ÉLÉMENTS DOM
    // ===========================
    const form = document.getElementById("wiki-form");
    const input = document.getElementById("wiki-input");
    const results = document.getElementById("wiki-results");
    const errorMsg = document.querySelector(".wiki-app__error-msg");
    const loader = document.querySelector(".wiki-app__loader");

    // Vérification de la présence de tous les éléments requis
    // Si un élément manque, on arrête l'exécution pour éviter des erreurs
    if (!form || !input || !results || !errorMsg || !loader) {
        console.warn("WikiApp: éléments manquants dans le DOM");
        return;
    }

    // ===========================
    // CONFIGURATION DE L'API
    // ===========================
    // Endpoint de l'API Wikipedia (version française)
    // Paramètres : format JSON, origine acceptée, limite de 20 résultats
    const ENDPOINT =
        "https://fr.wikipedia.org/w/api.php?action=query&list=search&format=json&origin=*&srlimit=20&srsearch=";

    // ===========================
    // FONCTIONS UTILITAIRES
    // ===========================

    // Afficher ou masquer le loader pendant le chargement
    // Utilise 'flex' pour respecter le justify-content du CSS
    const toggleLoader = (show) => {
        loader.style.display = show ? "flex" : "none";
    };

    // Afficher les résultats de recherche sous forme de cartes
    const renderResults = (items) => {
        // Vider le conteneur de résultats et retirer la classe 'hide'
        results.innerHTML = "";
        results.classList.remove("hide");

        // Utiliser un fragment pour optimiser les performances DOM
        const fragment = document.createDocumentFragment();

        // Créer une carte pour chaque résultat
        items.forEach(({ title, snippet, pageid }) => {
            // Article contenant le résultat
            const card = document.createElement("article");
            card.className = "wiki-card";

            // Lien cliquable vers l'article Wikipedia
            const link = document.createElement("a");
            link.href = `https://fr.wikipedia.org/?curid=${pageid}`;
            link.target = "_blank"; // Ouvrir dans un nouvel onglet
            link.rel = "noopener"; // Sécurité : éviter l'accès à window.opener

            // Titre de l'article
            const h3 = document.createElement("h3");
            h3.textContent = title;

            // Extrait (snippet) de l'article avec les balises HTML
            const p = document.createElement("p");
            p.innerHTML = `${snippet}...`;

            // Assembler les éléments
            link.append(h3, p);
            card.appendChild(link);
            fragment.appendChild(card);
        });

        // Ajouter tous les résultats au DOM en une seule fois
        results.appendChild(fragment);
    };

    // ===========================
    // GESTION DE LA SOUMISSION DU FORMULAIRE
    // ===========================
    form.addEventListener("submit", async (e) => {
        // Empêcher le rechargement de la page
        e.preventDefault();

        // Récupérer et nettoyer la valeur de l'input
        const query = input.value.trim();

        // Validation : vérifier que l'input n'est pas vide
        if (!query) {
            errorMsg.textContent = "Entrez un terme à rechercher.";
            return;
        }

        // Réinitialiser l'état avant une nouvelle recherche
        errorMsg.textContent = "";
        results.innerHTML = "";
        results.classList.add("hide"); // Masquer les anciens résultats
        toggleLoader(true); // Afficher le loader

        try {
            // Requête à l'API Wikipedia avec le terme encodé
            const response = await fetch(`${ENDPOINT}${encodeURIComponent(query)}`);

            // Vérifier si la requête a réussi (status 200-299)
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            // Parser la réponse JSON
            const data = await response.json();

            // Extraire les résultats de recherche (ou tableau vide si absent)
            const items = data?.query?.search || [];

            // Vérifier si des résultats ont été trouvés
            if (!items.length) {
                errorMsg.textContent = "Aucun résultat trouvé.";
                return;
            }

            // Afficher les résultats
            renderResults(items);
        } catch (err) {
            // Gestion des erreurs (réseau, API, parsing, etc.)
            console.error("WikiApp fetch error", err);
            errorMsg.textContent =
                "Erreur lors de la récupération des résultats. Réessayez.";
        } finally {
            // Dans tous les cas, masquer le loader à la fin
            toggleLoader(false);
        }
    });
});
