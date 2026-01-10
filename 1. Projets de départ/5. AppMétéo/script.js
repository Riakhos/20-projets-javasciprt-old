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

    // ===========================
    // GESTION API MÉTÉO
    // ===========================

    // Sélection des éléments DOM pour la gestion de la météo
    const weatherForm = document.getElementById("weather-form");
    const cityInput = document.getElementById("city-input");
    const weatherResult = document.getElementById("weather-result");

    async function searchCityAndFetchForecast(cityInput) {
        // Détecte si l'utilisateur a saisi un code postal (4-6 chiffres)
        const postal = getPostalCode(cityInput);
        let latitude, longitude, name, country, postalCode;

        if (postal) {
            // 1a) Géocodage via code postal (service zippopotam.us gratuit)
            const place = await fetchByPostalCode(postal);
            ({ latitude, longitude, name, country, postalCode } = place);
        } else {
            // 1b) Géocodage via nom de ville (Open-Meteo)
            const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
                cityInput
            )}&language=fr&count=5`;
            const geoRes = await fetch(geoUrl);
            if (!geoRes.ok) throw new Error("Erreur géocodage");
            const geoData = await geoRes.json();
            if (!geoData.results || geoData.results.length === 0)
                throw new Error("Ville introuvable");
            // Choix du meilleur résultat : exact match (accent/majuscules ignorés) sinon par population
            const best = selectBestResult(geoData.results, cityInput);
            ({ latitude, longitude, name, country } = best);
            // Récupère le code postal via reverse géocodage (Nominatim → fallback BigDataCloud)
            postalCode = await fetchPostalCodeByCoords(latitude, longitude);
        }

        // 2) Prévisions météo
            const meteoUrl =
                `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
                `&hourly=temperature_2m,relative_humidity_2m,precipitation` +
                `&daily=weathercode,temperature_2m_max,temperature_2m_min` +
                `&current_weather=true` +
                `&timezone=auto&forecast_days=7`;

        const meteoRes = await fetch(meteoUrl);
        if (!meteoRes.ok) throw new Error("Erreur prévisions");
        const meteo = await meteoRes.json();

        // 3) Exemple de rendu minimal + infos d'icône
        const currentTemp =
            meteo.current_weather?.temperature ?? meteo.hourly.temperature_2m?.[0];
        const tmax = meteo.daily.temperature_2m_max?.[0];
        const tmin = meteo.daily.temperature_2m_min?.[0];
        const currentWeatherCode =
            meteo.current_weather?.weathercode ?? meteo.daily.weathercode?.[0];
        const isDay = meteo.current_weather?.is_day === 1;

        return {
            city: `${name}, ${country || ""}`.trim(),
            latitude,
            longitude,
            currentTemp,
            tmin,
            tmax,
            icon: getIconFromWeatherCode(currentWeatherCode, isDay),
            postalCode,
            raw: meteo,
        };
    }

    // Mapping des codes Open-Meteo vers les icônes locales (OWM-style) dans ressources/icons
    function getIconFromWeatherCode(code, isDay = true) {
        if (code === undefined || code === null) return null;

        const suffix = isDay ? "d" : "n";

        // Regroupement des codes selon la grille Open-Meteo
        if (code === 0) return `./ressources/icons/01${suffix}.svg`; // ciel clair
        if ([1, 2].includes(code)) return `./ressources/icons/02${suffix}.svg`; // peu nuageux
        if (code === 3) return `./ressources/icons/03${suffix}.svg`; // nuages plus denses
        if ([45, 48].includes(code)) return `./ressources/icons/50${suffix}.svg`; // brouillard

        if (code >= 51 && code <= 57) return `./ressources/icons/09${suffix}.svg`; // bruine
        if (code >= 61 && code <= 67) return `./ressources/icons/10${suffix}.svg`; // pluie
        if (code >= 71 && code <= 77) return `./ressources/icons/13${suffix}.svg`; // neige
        if (code >= 80 && code <= 82) return `./ressources/icons/10${suffix}.svg`; // averses pluie
        if (code >= 85 && code <= 86) return `./ressources/icons/13${suffix}.svg`; // averses neige

        if (code === 95) return `./ressources/icons/11${suffix}.svg`; // orage
        if (code === 96 || code === 99) return `./ressources/icons/11${suffix}.svg`; // orage avec grêle

        return `./ressources/icons/04${suffix}.svg`; // couverture nuageuse par défaut
    }

    // ===========================
    // Helpers géocodage
    // ===========================
    function normalizeString(str) {
        return (str || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/\p{Diacritic}/gu, "")
            .replace(/[-']/g, " ")
            .trim();
    }

    function selectBestResult(results, query) {
        const target = normalizeString(query);

        // 1) Exact match sur le nom normalisé
        const exact = results.find((r) => normalizeString(r.name) === target);
        if (exact) return exact;

        // 2) Sinon, on prend le plus peuplé
        const sorted = [...results].sort(
            (a, b) => (b.population || 0) - (a.population || 0)
        );
        return sorted[0];
    }

    // Reverse géocodage pour extraire le code postal depuis des coordonnées
    async function fetchPostalCodeByCoords(lat, lon) {
        // 1) Nominatim (OpenStreetMap)
        try {
            const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1&accept-language=fr`;
            const res = await fetch(nominatimUrl, { headers: { Accept: "application/json" } });
            if (res.ok) {
                const data = await res.json();
                const cp = data?.address?.postcode || null;
                if (cp) return cp;
            }
        } catch (e) {
            // Ignore et tente le fallback
        }

        // 2) BigDataCloud (fallback léger)
        try {
            const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=fr`;
            const res2 = await fetch(bdcUrl);
            if (res2.ok) {
                const data2 = await res2.json();
                return data2?.postcode || null;
            }
        } catch (e) {
            // Ignore
        }

        return null;
    }

    // Détecte un code postal (4-6 chiffres, espaces tolérés)
    function getPostalCode(input) {
        const digits = (input || "").replace(/\s+/g, "");
        return /^\d{4,6}$/.test(digits) ? digits : null;
    }

    // Géocodage via code postal (France principalement, via zippopotam.us)
    async function fetchByPostalCode(postal) {
        // Essai France d'abord
        const url = `https://api.zippopotam.us/FR/${postal}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Code postal introuvable");
        const data = await res.json();

        // On prend le premier lieu retourné
        const place = data.places?.[0];
        if (!place) throw new Error("Code postal introuvable");

        return {
            latitude: parseFloat(place.latitude),
            longitude: parseFloat(place.longitude),
            name: place["place name"] || postal,
            country: data.country || "",
            postalCode: postal,
        };
    }

    // ===========================
    // RENDU UI + ÉCOUTEURS
    // ===========================

    // Rendu des informations météo dans le conteneur prévu
    function renderWeather(data) {
        const { city, currentTemp, tmin, tmax, icon, postalCode } = data;

        const iconImg = icon
            ? `<img class="weather-icon" src="${icon}" alt="conditions météo" />`
            : "";

        const postalLine = postalCode ? `<p>Code postal : ${postalCode}</p>` : "";

        weatherResult.innerHTML = `
            <div class="weather-card">
                <div class="weather-card__header">
                    <h2>${city}</h2>
                    ${iconImg}
                </div>
                <p>Température actuelle : <strong>${currentTemp ?? "N/C"
            }°C</strong></p>
                <p>Min : ${tmin ?? "N/C"}°C — Max : ${tmax ?? "N/C"}°C</p>
                ${postalLine}
                <button id="show-forecast-btn" type="button">Afficher les prévisions</button>
                ${renderDailyForecast(data.raw)}
            </div>
        `;

        weatherResult.classList.remove("hide");

        // Ajouter l'événement pour afficher les prévisions
        const showForecastBtn = document.getElementById("show-forecast-btn");
        if (showForecastBtn) {
            showForecastBtn.addEventListener("click", function() {
                // Enlever la classe hide de toutes les cartes de prévision
                const forecastCards = document.querySelectorAll(".forecast-day-card");
                forecastCards.forEach(card => card.classList.remove("hide"));
                // Masquer le bouton
                showForecastBtn.classList.add("hide");
            });
        }
    }

    // Affichage d'un message d'erreur simple dans le même conteneur
    function renderError(message) {
        weatherResult.innerHTML = `<p class="weather-error">${message}</p>`;
        weatherResult.classList.remove("hide");
    }

    function renderDailyForecast(raw) {
        const daily = raw?.daily;
        if (!daily || !daily.time || !daily.weathercode) return "";

        const dates = daily.time;
        const wcodes = daily.weathercode;
        const mins = daily.temperature_2m_min || [];
        const maxs = daily.temperature_2m_max || [];

        const items = dates.map((iso, i) => {
            const date = new Date(iso);
            const label = date.toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit", month: "short" });
            const code = wcodes[i];
            const icon = getIconFromWeatherCode(code, true);
            const tmin = mins[i] ?? "N/C";
            const tmax = maxs[i] ?? "N/C";

            return `
                <div class="forecast-day-card hide">
                    <h2 class="forecast-day">${label}</h2>
                    ${icon ? `<img class="forecast-day-icon" src="${icon}" alt="icône" />` : ""}
                    <p class="forecast-temps">${tmin}°C / ${tmax}°C</p>
                </div>
            `;
        }).join("");

        return `
            <div class="forecast-grid">
                ${items}
            </div>
        `;
    }

    // Gestion du formulaire de recherche ville → météo
    if (weatherForm && cityInput && weatherResult) {
        weatherForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const city = cityInput.value.trim();
            if (!city) {
                renderError("Veuillez saisir le nom d'une ville.");
                return;
            }

            try {
                weatherResult.classList.remove("hide");
                weatherResult.innerHTML = "<p>Chargement...</p>";

                const data = await searchCityAndFetchForecast(city);
                renderWeather(data);
            } catch (err) {
                renderError(
                    err.message || "Erreur lors de la récupération de la météo."
                );
            } finally {
                weatherForm.reset();
            }
        });
    }
});
