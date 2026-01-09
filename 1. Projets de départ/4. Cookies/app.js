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

    // ===================================
    // BOUTONS CUSTOM POUR INPUT NUMBER
    // ===================================
    // Création de boutons +/- stylisés pour remplacer les flèches natives des inputs number
    // Permet un meilleur contrôle visuel et une meilleure expérience utilisateur

    const numberContainers = document.querySelectorAll(".number-input");
    numberContainers.forEach((container) => {
        // Récupération des éléments pour chaque container d'input
        const input = container.querySelector('input[type="number"]');
        const btnUp = container.querySelector(".step-btn.up"); // Bouton incrémenter
        const btnDown = container.querySelector(".step-btn.down"); // Bouton décrémenter

        // Fonctions helper pour récupérer les attributs de l'input
        // Récupère l'incrément/décrément (step) de l'input, par défaut 1
        const getStep = () => {
            const stepAttr = parseFloat(input.getAttribute("step"));
            return isNaN(stepAttr) ? 1 : stepAttr;
        };
        // Récupère la valeur minimale autorisée, par défaut -Infinity (pas de limite)
        const getMin = () => {
            const minAttr = parseFloat(input.getAttribute("min"));
            return isNaN(minAttr) ? -Infinity : minAttr;
        };
        // Récupère la valeur maximale autorisée, par défaut +Infinity (pas de limite)
        const getMax = () => {
            const maxAttr = parseFloat(input.getAttribute("max"));
            return isNaN(maxAttr) ? Infinity : maxAttr;
        };

        // Fonction pour contraindre une valeur entre min et max
        const clamp = (val) => Math.min(Math.max(val, getMin()), getMax());

        // Gestion du clic sur le bouton d'incrémentation (+)
        if (btnUp) {
            btnUp.addEventListener("click", (e) => {
                e.preventDefault(); // Empêche le comportement par défaut du bouton
                // Récupère la valeur actuelle (0 si vide)
                const current = parseFloat(input.value || "0");
                // Calcule la nouvelle valeur en ajoutant le step, puis la contraint
                const next = clamp(current + getStep());
                // Met à jour l'input si la valeur est valide
                input.value = Number.isFinite(next) ? next : "";
                // Déclenche les événements pour notifier les autres écouteurs
                input.dispatchEvent(new Event("input", { bubbles: true }));
                input.dispatchEvent(new Event("change", { bubbles: true }));
            });
        }
        // Gestion du clic sur le bouton de décrémentation (-)
        if (btnDown) {
            btnDown.addEventListener("click", (e) => {
                e.preventDefault(); // Empêche le comportement par défaut du bouton
                // Récupère la valeur actuelle (0 si vide)
                const current = parseFloat(input.value || "0");
                // Calcule la nouvelle valeur en soustrayant le step, puis la contraint
                const next = clamp(current - getStep());
                // Met à jour l'input si la valeur est valide
                input.value = Number.isFinite(next) ? next : "";
                // Déclenche les événements pour notifier les autres écouteurs
                input.dispatchEvent(new Event("input", { bubbles: true }));
                input.dispatchEvent(new Event("change", { bubbles: true }));
            });
        }
    });

    // ===========================
    // GESTION COOKIES
    // ===========================
    // Système complet de gestion des cookies avec création, suppression et notifications visuelles

    // Sélection des éléments DOM pour la gestion des cookies
    const cookieForm = document.getElementById("cookie-form");
    const cookiesList = document.getElementById("cookies-list");
    const cookiesUl = document.getElementById("cookies-ul");
    const inputs = document.querySelectorAll("#cookie-form input");
    const toastsContainer = document.querySelector(".toasts-container");
    const displayCookieBtn = document.getElementById("view-cookies");

    // Fonction pour créer un élément de cookie dans la liste
    // Reçoit le nom et la valeur du cookie et retourne un <li> formaté
    function createCookieElement(name, value) {
        const li = document.createElement("li");
        li.className = "cookies-app__cookie";
        // Structure HTML : conteneur info + bouton suppression
        li.innerHTML = `
            <div class="cookies-app__cookie-info">
                <h3 class="cookies-app__cookie-text"><strong>Nom : </strong>${name}</h3>
                <h3 class="cookies-app__cookie-text"><strong>Valeur : </strong>${value}</h3>
            </div>
            <button class="cookies-app__cookie-btn" data-name="${name}">X</button>
        `;
        return li;
    }

    // Gestion de la soumission du formulaire de création de cookie
    cookieForm.addEventListener("submit", function (e) {
        // Empêche le rechargement de la page par défaut
        e.preventDefault();

        // Objet pour stocker les données du nouveau cookie
        const newCookie = {};

        // Parcourt tous les inputs pour récupérer leurs valeurs
        inputs.forEach((input) => {
            const nameAttribute = input.getAttribute("name");
            newCookie[nameAttribute] = input.value; // Stocke la valeur
        });

        // Récupère et nettoie (trim) les valeurs du nom et de la valeur
        const name = newCookie.name.trim();
        const value = newCookie.value.trim();

        // Validation : vérifie que les deux champs ne sont pas vides
        if (name === "" || value === "") {
            alert("Veuillez remplir les deux champs.");
            return;
        }

        // Calcule la date d'expiration du cookie (7 jours = 604800 secondes)
        const maxAge = 7 * 24 * 60 * 60; // 7 jours en secondes
        // Crée une date expiration en ajoutant 7 jours à la date actuelle
        newCookie.expires = new Date(new Date().getTime() + maxAge * 1000);

        // Appelle la fonction de création du cookie avec toutes les infos
        createCookie(newCookie);
    });

    // Fonction de création/mise à jour du cookie dans le navigateur et l'affichage
    function createCookie(newCookie) {
        // Vérifie si le cookie existe déjà pour afficher un message approprié
        if (doesCookieExist(newCookie.name)) {
            // Le cookie est modifié → notification orange
            createToast({
                name: newCookie.name,
                state: "modifié",
                color: "rgba(255, 165, 0, 0.1)",
            });
        } else {
            // Nouveau cookie créé → notification verte
            createToast({ 
                name: newCookie.name, 
                state: "créé", 
                color: "rgba(40, 167, 69, 0.1)" });
        }

        // Crée le cookie dans le navigateur avec encodage URI des valeurs
        // Format : nom=valeur; expires=date UTC; path=/
        document.cookie = `${encodeURIComponent(
            newCookie.name
        )}=${encodeURIComponent(
            newCookie.value
        )}; expires=${newCookie.expires.toUTCString()}; path=/`;

        // Crée l'élément visuel du cookie et l'ajoute à la liste
        const cookieElement = createCookieElement(newCookie.name, newCookie.value);
        cookiesUl.appendChild(cookieElement); // Ajoute le <li> au <ul>

        // Affiche le conteneur de la liste (retire la classe "hide")
        cookiesList.classList.remove("hide");

        // Auto-masquage : re-masque la liste après 15 secondes pour garder l'UI compacte
        setTimeout(() => {
            cookiesList.classList.add("hide");
        }, 15000); // 15000 ms = 15 secondes

        // Réinitialise le formulaire en vidant les champs
        const nameInput = document.getElementById("cookie-name");
        const valueInput = document.getElementById("cookie-value");
        if (nameInput) nameInput.value = ""; // Vide le champ nom
        if (valueInput) valueInput.value = ""; // Vide le champ valeur
    }

    // Fonction pour vérifier si un cookie existe déjà
    // Retourne true si le cookie existe, false sinon
    function doesCookieExist(name) {
        // Récupère tous les cookies du navigateur et les split par ";"
        const cookies = document.cookie.replace(/\s/g, "").split(";");

        // Extrait uniquement les noms des cookies (part avant le "=")
        const onlyCookiesName = cookies.map((cookie) => cookie.split("=")[0]);

        // Cherche si le cookie existe parmi les noms (avec encodage URI)
        const cookiePresence = onlyCookiesName.find(
            (cookie) => cookie === encodeURIComponent(name)
        );

        // Retourne truthy si trouvé, falsy sinon
        return cookiePresence;
    }

    // Fonction pour afficher une notification (toast) temporaire
    // Affiche un message avec couleur de fond selon l'action (créé/modifié/supprimé)
    function createToast({ name, state, color }) {
        // Crée l'élément p pour le message
        const toastInfo = document.createElement("h3");
        toastInfo.className = "toast"; // Classe CSS pour le style

        // Texte du message : "Cookie [nom] [état]."
        toastInfo.textContent = `Cookie ${name} ${state}.`;

        // Applique la couleur de fond dynamiquement au conteneur des toasts
        toastsContainer.style.backgroundColor = color; // green, orangered, etc.
        toastsContainer.style.borderColor = color; // green, orangered, etc.
        toastsContainer.style.boxShadow = `0 0 12px ${color}`;

        // Ajoute le toast au conteneur
        toastsContainer.appendChild(toastInfo);

        // Affiche le conteneur des toasts
        toastsContainer.classList.remove("hide");

        // Auto-suppression : retire le toast après 2.5 secondes
        setTimeout(() => {
            toastInfo.remove(); // Supprime l'élément du DOM
            toastsContainer.classList.add("hide"); // Masque le conteneur si vide
        }, 5000); // 5000 ms = 5 secondes
    }

    // Gestion de la suppression d'un cookie par clic sur le bouton "X"
    cookiesUl.addEventListener("click", function (e) {
        // Vérifie si le bouton cliqué est un bouton de suppression
        if (e.target.classList.contains("cookies-app__cookie-btn")) {
            // Récupère le nom du cookie à partir de l'attribut data-name du bouton
            const name = e.target.getAttribute("data-name");

            // Supprime le cookie en le mettant à jour avec une date d'expiration passée
            // max-age=0 supprime immédiatement le cookie du navigateur
            document.cookie = `${encodeURIComponent(name)}=; path=/; max-age=0`;

            // Retirer l'élément visuel de la liste
            const li = e.target.closest("li"); // Trouve le <li> parent du bouton
            if (li) {
                li.remove();
            }
        }
    });

    // Listener pour le bouton d'affichage des cookies
    displayCookieBtn.addEventListener("click", displayCookies);

    let lock = false;
    function displayCookies() {        
        // Vide la liste actuelle avant d'afficher les cookies
        if (cookiesUl.children.length) cookiesUl.textContent = "";

        // Récupère tous les cookies du navigateur et les split par ";"
        const cookies = document.cookie.replace(/\s/g, "").split(";").reverse();

        if (!cookies[0]) {
            if (lock) return;

            lock = true;
            createToast({ name: "Pas de cookies", state: "à afficher, créez-en un!", color: "rgba(255, 107, 107, 0.1)" });
            return;
        }
        
        // Réinitialise le lock pour les futurs appels
        lock = false;

        // Pour chaque cookie, crée un élément visuel et l'ajoute à la liste
        cookies.forEach((cookie) => {
            const [rawName, rawValue] = cookie.split("=");
            const name = decodeURIComponent(rawName);
            const value = decodeURIComponent(rawValue);

            const listItem = createCookieElement(name, value);
            cookiesUl.appendChild(listItem);
        });

        // Affiche le conteneur de la liste (retire la classe "hide")
        cookiesList.classList.remove("hide");
    }
});
