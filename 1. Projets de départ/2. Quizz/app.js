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
            navUl.classList.toggle("open");
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
});

// ===========================
// GESTION QUIZZ
// ===========================

// Données pour l'ancien système de notation (non utilisé actuellement)
// QUESTION ET RÉPONSES
const responses = ["c", "a", "b", "a", "c"];
const emojis = ["✔️", "✨", "👀", "😭", "👎"];

// ===========================
// ÉLÉMENTS DU DOM
// Sélection de tous les éléments nécessaires au fonctionnement du quiz
// ===========================
const startButton = document.getElementById("start-btn"); // Bouton pour démarrer le quiz
const nextButton = document.getElementById("next-btn"); // Bouton pour passer à la question suivante
const submitButton = document.getElementById("submit-btn"); // Bouton pour valider la réponse
const quizContainer = document.querySelector(".quiz-container"); // Conteneur principal du quiz
const questionContainer = document.getElementById("question-container"); // Conteneur de la question et des réponses
const questionElement = document.getElementById("question"); // Élément qui affiche le texte de la question
const answerButtonsElement = document.getElementById("answer-buttons"); // Conteneur des boutons de réponse

// ===========================
// VARIABLES GLOBALES
// ===========================
let shuffledQuestions; // Tableau des questions mélangées aléatoirement
let currentQuestionIndex; // Index de la question actuellement affichée

// ===========================
// ÉCOUTEURS D'ÉVÉNEMENTS
// ===========================

// Démarrer le quiz au clic sur le bouton de démarrage
// DÉMARRER LE QUIZZ
startButton.addEventListener("click", startQuiz);

// Passer à la question suivante
// Incrémente l'index et affiche la prochaine question
// QUESTION SUIVANTE
nextButton.addEventListener("click", () => {
    currentQuestionIndex++;
    setNextQuestion();
});

// Soumettre la réponse sélectionnée (système alternatif)
// SOUMETTRE LA RÉPONSE
submitButton.addEventListener("click", submitAnswer);

// ===========================
// FONCTION : Démarrer le quiz
// Initialise le quiz en mélangeant les questions et en affichant la première
// ===========================
function startQuiz() {
    // Cache le bouton de démarrage
    startButton.classList.add("hide");
    // Mélange aléatoirement les questions pour chaque session
    shuffledQuestions = questions.sort(() => Math.random() - 0.5);
    // Commence à la première question
    currentQuestionIndex = 0;
    // Affiche les conteneurs du quiz
    quizContainer.classList.remove("hide");
    questionContainer.classList.remove("hide");
    // Affiche la première question
    setNextQuestion();
}

// ===========================
// FONCTION : Préparer la question suivante
// Réinitialise l'état de la page et affiche la question actuelle
// ===========================
function setNextQuestion() {
    // Nettoie l'état précédent (boutons, classes CSS)
    resetState();
    // Affiche la question basée sur l'index actuel
    showQuestion(shuffledQuestions[currentQuestionIndex]);
}

// ===========================
// FONCTION : Afficher une question
// Crée dynamiquement les boutons de réponse pour la question donnée
// ===========================
function showQuestion(question) {
    // Affiche le texte de la question
    questionElement.innerText = question.question;
    // Pour chaque réponse possible, créer un bouton
    question.answers.forEach((answer) => {
        // Crée un élément bouton
        const button = document.createElement("button");
        // Définit le texte du bouton avec la réponse
        button.innerText = answer.text;
        // Ajoute la classe CSS pour le style
        button.classList.add("btn");
        // Si c'est la bonne réponse, stocke l'info dans un attribut data
        if (answer.correct) {
            button.dataset.correct = answer.correct;
        }
        // Ajoute un écouteur pour gérer la sélection de cette réponse
        button.addEventListener("click", selectAnswer);
        // Ajoute le bouton au conteneur des réponses
        answerButtonsElement.appendChild(button);
    });
}

// ===========================
// FONCTION : Réinitialiser l'état
// Nettoie les classes CSS et les boutons de réponse de la question précédente
// ===========================
function resetState() {
    // Retire les classes 'correct' ou 'wrong' du body
    clearStatusClass(document.body);
    // Cache le bouton "Suivant"
    nextButton.classList.add("hide");
    // Affiche le bouton "Soumettre" (pour le système alternatif)
    submitButton.classList.remove("hide");
    // Supprime tous les boutons de réponse existants
    while (answerButtonsElement.firstChild) {
        answerButtonsElement.removeChild(answerButtonsElement.firstChild);
    }
}

// ===========================
// FONCTION : Sélectionner une réponse
// Gère le clic sur un bouton de réponse et affiche le résultat
// ===========================
function selectAnswer(e) {
    // Récupère le bouton cliqué
    const selectedButton = e.target;
    // Vérifie si c'est la bonne réponse via l'attribut data-correct
    const correct = selectedButton.dataset.correct;
    // Applique la classe CSS 'correct' ou 'wrong' au body (pour l'effet visuel global)
    setStatusClass(document.body, correct);
    // Pour chaque bouton de réponse, applique la classe appropriée
    // Cela colore en vert la bonne réponse et en rouge la mauvaise
    Array.from(answerButtonsElement.children).forEach((button) => {
        setStatusClass(button, button.dataset.correct);
    });
    // Affiche le bouton "Suivant" pour continuer
    nextButton.classList.remove("hide");
    // Cache le bouton "Soumettre"
    submitButton.classList.add("hide");
}

// ===========================
// FONCTION : Soumettre la réponse (système alternatif)
// Valide la réponse pré-sélectionnée par l'utilisateur
// ===========================
function submitAnswer() {
    // Trouve le bouton qui a la classe 'selected'
    const selectedButton = Array.from(answerButtonsElement.children).find(
        (button) => button.classList.contains("selected")
    );
    // Si aucune réponse n'est sélectionnée, ne rien faire
    if (!selectedButton) return;

    // Vérifie si c'est la bonne réponse
    const correct = selectedButton.dataset.correct;
    // Applique les classes CSS appropriées au body
    setStatusClass(document.body, correct);
    // Colore tous les boutons selon leur statut (correct/incorrect)
    Array.from(answerButtonsElement.children).forEach((button) => {
        setStatusClass(button, button.dataset.correct);
    });

    // Affiche le bouton "Suivant"
    nextButton.classList.remove("hide");
    // Cache le bouton "Soumettre"
    submitButton.classList.add("hide");
}

// ===========================
// FONCTION : Appliquer les classes de statut
// Ajoute la classe 'correct' (vert) ou 'wrong' (rouge) à un élément
// ===========================
function setStatusClass(element, correct) {
    // Nettoie d'abord les anciennes classes
    clearStatusClass(element);
    // Applique la classe appropriée selon le résultat
    if (correct) {
        element.classList.add("correct"); // Classe pour réponse correcte (vert)
    } else {
        element.classList.add("wrong"); // Classe pour réponse incorrecte (rouge)
    }
}

// ===========================
// FONCTION : Nettoyer les classes de statut
// Retire les classes 'correct' et 'wrong' d'un élément
// ===========================
function clearStatusClass(element) {
    element.classList.remove("correct");
    element.classList.remove("wrong");
}

// ===========================
// DONNÉES : Questions du quiz
// Tableau d'objets contenant toutes les questions et leurs réponses
// Chaque question a un texte et un tableau de 4 réponses possibles
// Une seule réponse par question a la propriété correct: true
// ===========================
const questions = [
    {
        question: "Quelle est la capitale de la France ?",
        answers: [
            { text: "Berlin", correct: false },
            { text: "Madrid", correct: false },
            { text: "Paris", correct: true }, // Bonne réponse
            { text: "Rome", correct: false },
        ],
    },
    {
        question: "Quel est le plus grand océan du monde ?",
        answers: [
            { text: "Océan Atlantique", correct: false },
            { text: "Océan Pacifique", correct: true }, // Bonne réponse
            { text: "Océan Indien", correct: false },
            { text: "Océan Arctique", correct: false },
        ],
    },
    {
        question: "Qui a écrit 'Roméo et Juliette' ?",
        answers: [
            { text: "Charles Dickens", correct: false },
            { text: "William Shakespeare", correct: true }, // Bonne réponse
            { text: "Mark Twain", correct: false },
            { text: "Jane Austen", correct: false },
        ],
    },
    {
        question: "Quelle est la formule chimique de l'eau ?",
        answers: [
            { text: "CO2", correct: false },
            { text: "H2O", correct: true }, // Bonne réponse
            { text: "O2", correct: false },
            { text: "NaCl", correct: false },
        ],
    },
    {
        question: "Quel pays a remporté la Coupe du Monde de la FIFA 2018 ?",
        answers: [
            { text: "Brésil", correct: false },
            { text: "Allemagne", correct: false },
            { text: "France", correct: true }, // Bonne réponse
            { text: "Argentine", correct: false },
        ],
    },
];
