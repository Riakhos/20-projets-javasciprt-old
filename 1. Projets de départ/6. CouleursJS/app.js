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

    // =============================================
    // GÉNÉRATEUR DE DÉGRADÉS - LOGIQUE PRINCIPALE
    // =============================================
    
    // Références DOM utilisées par l'outil de dégradé
    const colorLabels = document.querySelectorAll(".gradient-app__color-label");
    const colorInputs = [...document.querySelectorAll(".gradient-app__color-input")];
    const gradientBodyApp = document.querySelector("body");
    const rangeLabelValue = document.querySelector(".gradient-app__orientation-value");
    const rangeInput = document.querySelector(".gradient-app__range");
    
    // Sélectionner le bouton de copie et ajouter l'écouteur
    const copyBtn = document.querySelector(".js-copy-btn");
    const cssDisplay = document.querySelector(".gradient-app__css-display");
    const cssOutput = document.getElementById("css-output");
    
    // Sélectionner le bouton aléatoire
    const randomGradientBtn = document.querySelector(".js-random-btn");

    // État du dégradé (angle + palette)
    const gradientData = {
        angle: 90, // Angle en degrés
        colors: ["#f7df1e", "#ffa500"], // Palette JavaScript
    };

    /**
        * Met à jour l'UI et le body avec les valeurs courantes
        * @return {void}
    **/
    function updateGradient() {
        const color1 = gradientData.colors[0];
        const color2 = gradientData.colors[1];
        const angle = gradientData.angle;

        // Affiche les valeurs en texte
        colorLabels[0].textContent = color1;
        colorLabels[1].textContent = color2;

        // Synchronise les color inputs
        colorInputs[0].value = color1;
        colorInputs[1].value = color2;

        // Applique les couleurs sur les pastilles de label
        colorLabels[0].style.backgroundColor = color1;
        colorLabels[1].style.backgroundColor = color2;

        // Applique le dégradé sur le body
        gradientBodyApp.style.background = `linear-gradient(${angle}deg, ${color1}, ${color2}, ${color1})`;

        // Affiche l'angle courant à côté du slider
        rangeLabelValue.textContent = `${angle}°`;
    }

    // Initialiser l'affichage du dégradé au chargement de la page
    updateGradient();
    
    // Initialiser le pourcentage du slider
    const volumePercent = (rangeInput.value / rangeInput.max) * 100;
    rangeInput.style.setProperty("--volume-percent", `${volumePercent}%`);

    // ===========================
    // GESTION DE L'ANGLE DU DÉGRADÉ
    // ===========================

    // Slider angle → met à jour l'état et rafraîchit l'affichage
    rangeInput.addEventListener("input", updateGradientAngle);

    /**
        * Met à jour l'angle du dégradé depuis le range input
    **/
    function updateGradientAngle() {
        // Mettre à jour l'état
        gradientData.angle = rangeInput.value;

        // Calculer le pourcentage de remplissage du slider (0-360 degrés)
        const volumePercent = (rangeInput.value / rangeInput.max) * 100;
        rangeInput.style.setProperty("--volume-percent", `${volumePercent}%`);

        // Rafraîchir l'interface
        updateGradient();
    }
    
    // ===========================
    // GESTION DES COULEURS
    // ===========================

    // Inputs couleur → mise à jour de la palette
    colorInputs.forEach((input) =>
        input.addEventListener("input", colorInputModification)
    );

    /**
        * Gère la modification des couleurs via les color inputs
        * @param {Event} e - Événement input du color input
    **/
    function colorInputModification(e) {
        // Déterminer quel input a changé
        const currentColorInputIndex = colorInputs.indexOf(e.target);

        // Mettre à jour la couleur correspondante (en majuscules)
        gradientData.colors[currentColorInputIndex] = e.target.value.toUpperCase();

        // Rafraîchir l'interface avec la nouvelle couleur
        updateGradient();
    }

    // ===========================
    // GESTION DE LA COPIE DU DÉGRADÉ
    // ===========================

    copyBtn.addEventListener("click", handleGradientCopy);

    // Verrou pour empêcher les clics multiples pendant l'animation
    let lock = false;

    /**
     * Gère la copie du dégradé CSS dans le presse-papiers
     * Génère la chaîne CSS complète et déclenche l'animation de confirmation
     */
    function handleGradientCopy() {
        // Protection contre les clics multiples
        if (lock) return;
        lock = true;

        // Construire la chaîne de dégradé CSS complète
        const gradient = `linear-gradient(${gradientData.angle}deg, ${gradientData.colors[0]}, ${gradientData.colors[1]}, ${gradientData.colors[0]})`;
        const fullCSSRule = `background: ${gradient};`;

        // Copier dans le presse-papiers (API moderne)
        navigator.clipboard
            .writeText(gradient)
            .then(() => {
                console.log("📋 Dégradé copié:", gradient);
            })
            .catch((err) => {
                console.error("❌ Erreur lors de la copie:", err);
            });

        // Afficher le code CSS généré
        cssOutput.textContent = fullCSSRule;
        cssDisplay.classList.remove("hide");

        // Déclencher l'animation de confirmation "Copié !"
        copyBtn.classList.add("js-active-copy-btn");

        // Réinitialiser après l'animation (1 seconde)
        setTimeout(() => {
            copyBtn.classList.remove("js-active-copy-btn");
            lock = false; // Libérer le verrou pour permettre une nouvelle copie
        }, 1000);
    }
    
    // ===========================
    // GÉNÉRATION DE DÉGRADÉ ALÉATOIRE
    // ===========================

    // Ajouter l'écouteur au bouton
    randomGradientBtn.addEventListener("click", createRandomGradient);

    /**
     * Génère un dégradé aléatoire avec deux couleurs hexadécimales complètement aléatoires
     * Utilise l'algorithme Math.random() pour créer des combinaisons de couleurs uniques
     */
    function createRandomGradient() {
        console.log("🎲 Génération d'un dégradé aléatoire...");

        // Boucle pour générer autant de couleurs que d'inputs disponibles
        for (let i = 0; i < colorLabels.length; i++) {
            // Générer un nombre aléatoire entre 0 et 16777215 (0xFFFFFF en décimal)
            // 16777216 = 256³ représente toutes les combinaisons RGB possibles
            const randomDecimal = Math.floor(Math.random() * 16777216);

            // Convertir en hexadécimal et assurer 6 caractères avec padStart
            const hexString = randomDecimal.toString(16).padStart(6, "0");

            // Construire la couleur hexadécimale complète avec #
            const randomColor = `#${hexString}`;

            // Stocker en majuscules pour la cohérence
            gradientData.colors[i] = randomColor.toUpperCase();

            console.log(`🎨 Couleur ${i + 1} générée: ${randomColor.toUpperCase()}`);
        }

        // Rafraîchir l'interface avec les nouvelles couleurs aléatoires
        updateGradient();

        console.log("✅ Dégradé aléatoire appliqué:", gradientData.colors);
    }
});