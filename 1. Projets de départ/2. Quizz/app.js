// ===========================
// GESTION NAVIGATION
// ===========================

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
            navUl.classList.toggle("open");
            // Change l'icône du burger en fonction de l'état du menu
            burger.src = navUl.classList.contains("open")
                ? "./assets/close.svg"  // Icône de fermeture quand le menu est ouvert
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
                    // Fermer le menu et réinitialiser l'icône
                    navUl.classList.remove("open");
                    burger.src = "./assets/burger.svg";
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
		const btnUp = container.querySelector(".step-btn.up");   // Bouton incrémenter
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
});

// ===========================
// GESTION QUIZZ
// ===========================

const responses = ["c", "a", "b", "a", "c"];
const emojis = ["✔️", "✨", "👀", "😭", "👎"];
