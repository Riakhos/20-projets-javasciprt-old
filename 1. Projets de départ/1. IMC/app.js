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
        burger.addEventListener("click", () => {
            navUl.classList.toggle("open");
            burger.src = navUl.classList.contains("open")
                ? "./assets/close.svg"
                : "./assets/burger.svg";
        });

        // Ferme le menu si on repasse en mode desktop lors d'un redimensionnement
        window.addEventListener("resize", () => {
            if (window.innerWidth > 820) {
                navUl.classList.remove("open");
                burger.src = "./assets/burger.svg";
            }
        });

        // Fermer le menu quand on clique sur un lien en mode mobile
        // Sélectionner tous les liens sauf les dropdown-toggle
        const navLinks = navUl.querySelectorAll("a:not(.dropdown-toggle)");
        // Ajouter aussi tous les liens dans les dropdown-menu
        const dropdownLinks = navUl.querySelectorAll(".dropdown-menu a");

        // Combiner tous les liens
        const allLinks = [...navLinks, ...dropdownLinks];

        allLinks.forEach((link) => {
            link.addEventListener("click", () => {
                if (window.innerWidth <= 820) {
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

    // Fonction pour fermer tous les dropdowns
    function closeAllDropdowns() {
        dropdowns.forEach((dropdown) => {
            dropdown.classList.remove("active");
        });
    }

    // Gestion des événements pour chaque dropdown
    dropdowns.forEach((dropdown) => {
        const toggle = dropdown.querySelector(".dropdown-toggle");

        // Gestion du clic sur le bouton toggle
        toggle.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();

            // Si ce dropdown est déjà actif, le fermer
            if (dropdown.classList.contains("active")) {
                closeAllDropdowns();
                return;
            }

            // Fermer tous les autres dropdowns
            closeAllDropdowns();

            // Activer ce dropdown
            dropdown.classList.add("active");
        });

        // Empêcher la fermeture quand on clique à l'intérieur du dropdown
        const dropdownMenu = dropdown.querySelector(".dropdown-menu");
        if (dropdownMenu) {
            dropdownMenu.addEventListener("click", function (e) {
                e.stopPropagation();
            });
        }
    });

    // Fermer les dropdowns en cliquant ailleurs ou sur l'overlay mobile
    document.addEventListener("click", function (e) {
        // Si on clique sur l'overlay mobile (::before pseudo-element)
        const activeDropdown = document.querySelector(".dropdown.active");
        if (activeDropdown && window.innerWidth <= 820) {
            const dropdownMenu = activeDropdown.querySelector(".dropdown-menu");
            if (
                dropdownMenu &&
                !dropdownMenu.contains(e.target) &&
                !e.target.closest(".dropdown-toggle")
            ) {
                closeAllDropdowns();
            }
        } else if (!e.target.closest(".dropdown")) {
            closeAllDropdowns();
        }
    });

    // Fermer avec la touche Escape
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
            closeAllDropdowns();
        }
    });

    // ===================================
    // BOUTONS CUSTOM POUR INPUT NUMBER
    // ===================================
    const numberContainers = document.querySelectorAll(".number-input");
    numberContainers.forEach((container) => {
        const input = container.querySelector('input[type="number"]');
        const btnUp = container.querySelector(".step-btn.up");
        const btnDown = container.querySelector(".step-btn.down");

        const getStep = () => {
            const stepAttr = parseFloat(input.getAttribute("step"));
            return isNaN(stepAttr) ? 1 : stepAttr;
        };
        const getMin = () => {
            const minAttr = parseFloat(input.getAttribute("min"));
            return isNaN(minAttr) ? -Infinity : minAttr;
        };
        const getMax = () => {
            const maxAttr = parseFloat(input.getAttribute("max"));
            return isNaN(maxAttr) ? Infinity : maxAttr;
        };

        const clamp = (val) => Math.min(Math.max(val, getMin()), getMax());

        if (btnUp) {
            btnUp.addEventListener("click", (e) => {
                e.preventDefault();
                const current = parseFloat(input.value || "0");
                const next = clamp(current + getStep());
                input.value = Number.isFinite(next) ? next : "";
                input.dispatchEvent(new Event("input", { bubbles: true }));
                input.dispatchEvent(new Event("change", { bubbles: true }));
            });
        }
        if (btnDown) {
            btnDown.addEventListener("click", (e) => {
                e.preventDefault();
                const current = parseFloat(input.value || "0");
                const next = clamp(current - getStep());
                input.value = Number.isFinite(next) ? next : "";
                input.dispatchEvent(new Event("input", { bubbles: true }));
                input.dispatchEvent(new Event("change", { bubbles: true }));
            });
        }
    });
});

// ===============================
// LOGIQUE DE L'APPLICATION IMC
// ===============================

const BMIData = [
    { name: "Maigreur", color: "#5bc0ff", range: [0, 18.5] },
    { name: "Bonne santé", color: "#28a745", range: [18.5, 25] },
    { name: "Surpoids", color: "#ffa500", range: [25, 30] },
    { name: "Obésité modérée", color: "#f7df1e", range: [30, 35] },
    { name: "Obésité sévère", color: "#ff5f6d", range: [35, 40] },
    { name: "Obésité morbide", color: "#c17aff", range: [40, 50] },
];

// Sélection des éléments du DOM
const weight = document.getElementById("weight");
const height = document.getElementById("height");
const calculateBtn = document.getElementById("calculate-btn");
const resultDiv = document.getElementById("result");

// Message initial
resultDiv.innerHTML = `
    <p class="result-number">Votre IMC est de <strong>0</strong></p>
    <p class="result-text">En attente du résultat...</p>`;

// Gestion du clic sur le bouton de calcul
calculateBtn.addEventListener("click", () => {
    // Récupération et validation des valeurs
    const w = parseFloat(weight.value);
    const h = parseFloat(height.value) / 100; // conversion en mètres

    // Calcul de l'IMC
    if (w > 0 && h > 0) {
        // IMC = poids en kg / taille² en m
        const bmi = w / (h * h);

        // Détermination de la catégorie
        let category = null;

        // Parcours des données pour trouver la catégorie correspondante
        for (const item of BMIData) {
            // Vérification si la plage est un tableau (intervalle) ou une valeur unique
            if (Array.isArray(item.range)) {
                // Intervalle
                if (bmi >= item.range[0] && bmi < item.range[1]) {
                    category = item;
                    break;
                }
            } else {
                // Valeur unique
                if (bmi >= item.range) {
                    category = item;
                    break;
                }
            }
        }

        // Affichage du résultat
        if (category) {
            // Adapter le style du cadre résultat en fonction de la catégorie trouvée
            resultDiv.style.borderColor = category.color;
            resultDiv.style.backgroundColor = `${category.color}1a`; // légère teinte avec transparence

            resultDiv.innerHTML = `
                <p class="result-number">Votre IMC est de <strong>${bmi.toFixed(2)}</strong></p>
                <p class="result-text"> Ce qui correspond à la catégorie : <span style="color:${category.color}; font-weight:bold;">${category.name}</span>.</p>`;
        } else {
            resultDiv.innerHTML = `<p class="result-text">Catégorie IMC non trouvée.</p>`;
        }
    } else {
        alert("Veuillez entrer des valeurs valides pour le poids et la taille.");
        return;
    }
});
