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
// GESTION QUIZZ
// ===========================

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
const resultsElement = document.getElementById("results"); // Conteneur dédié à l'affichage des résultats

// ===========================
// VARIABLES GLOBALES
// ===========================
let shuffledQuestions; // Tableau des questions mélangées aléatoirement
let currentQuestionIndex; // Index de la question actuellement affichée
let userAnswers = {}; // Objet pour stocker les réponses de l'utilisateur {index: answerText}

// ===========================
// ÉCOUTEURS D'ÉVÉNEMENTS
// ===========================

// Démarrer le quiz au clic sur le bouton de démarrage
// DÉMARRER LE QUIZZ
startButton.addEventListener("click", startQuiz);

// Passer à la question suivante au clic sur le bouton "Suivant"
nextButton.addEventListener("click", () => {
    // Passe à la question suivante
    currentQuestionIndex++;
    setNextQuestion();
});

// Valider les réponses au clic sur le bouton "Valider"
submitButton.addEventListener("click", () => {
    // Affiche le résumé des réponses lorsque l'utilisateur clique sur "Valider"
    showResults();
});

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
    // Réinitialise les réponses de l'utilisateur
    userAnswers = {};
    // Réinitialise et masque le conteneur des résultats
    resultsElement.innerHTML = "";
    resultsElement.classList.add("hide");
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
    // Affiche le conteneur du quiz
    quizContainer.classList.remove("hide");
    // Cache le bouton "Valider"
    submitButton.classList.add("hide");
    // Affiche le texte de la question
    questionElement.innerText = question.question;
    // Pour chaque réponse possible, créer un bouton
    question.answers.forEach((answer) => {
        // Crée un élément bouton
        const button = document.createElement("button");
        // Définit explicitement le type pour éviter le comportement par défaut
        button.type = "button";
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
    // Supprime tous les boutons de réponse existants
    while (answerButtonsElement.firstChild) {
        answerButtonsElement.removeChild(answerButtonsElement.firstChild);
    }
}

// ===========================
// FONCTION : Sélectionner une réponse
// Gère le clic sur un bouton de réponse et enregistre le choix
// ===========================
function selectAnswer(e) {
    // Récupère le bouton cliqué
    const selectedButton = e.target;
    // Enlève la classe 'selected' de tous les autres boutons
    Array.from(answerButtonsElement.children).forEach((button) => {
        button.classList.remove("selected");
    });
    // Ajoute la classe 'selected' au bouton cliqué
    selectedButton.classList.add("selected");
    // Enregistre la réponse sélectionnée dans l'objet userAnswers
    userAnswers[currentQuestionIndex] = {
        text: selectedButton.innerText,
        correct: selectedButton.dataset.correct === "true",
    };
    // Affiche le bouton "Suivant" ou "Valider"
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
        nextButton.classList.remove("hide");
    } else {
        submitButton.classList.remove("hide");
        nextButton.classList.add("hide");
    }
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
// FONCTION : Afficher les résultats
// Affiche un résumé de toutes les questions avec les réponses correctes et incorrectes
// ===========================
function showResults() {
    // Cache le conteneur des questions et le bouton "Valider"
    quizContainer.classList.add("hide");
    submitButton.classList.add("hide");

    // Nettoie et affiche le conteneur de résultats dédié
    resultsElement.innerHTML = "";
    resultsElement.classList.remove("hide");

    // Parcourt toutes les questions et affiche les résultats
    let correctCount = 0;
    shuffledQuestions.forEach((question, index) => {
        const userAnswer = userAnswers[index];
        const isCorrect = userAnswer && userAnswer.correct;

        if (isCorrect) {
            correctCount++;
        }

        // Crée un élément pour chaque question
        const questionResult = document.createElement("div");
        questionResult.classList.add("result-item");
        questionResult.classList.add(isCorrect ? "correct" : "incorrect");

        // Affiche la question
        const questionText = document.createElement("h3");
        questionText.innerText = question.question;
        questionResult.appendChild(questionText);

        // Affiche la réponse de l'utilisateur
        const userAnswerText = document.createElement("p");
        userAnswerText.innerText = `Votre réponse : ${userAnswer ? userAnswer.text : "Non répondu"
            }`;
        questionResult.appendChild(userAnswerText);

        resultsElement.appendChild(questionResult);
    });

    // Tableau d'emojis pour l'affichage des résultats
    const emojis = ["✔️", "✨", "👀", "😭", "👎"];

    // Phrase récapitulative avec emojis selon le score
    let detailText =
        "Retentez une autre réponse dans les cases rouges, puis re-validez !";

    // Variables pour les emojis et le texte
    let emoji1 = "";
    let textContent = "";
    let emoji2 = "";

    switch (correctCount) {
        case 0:
            emoji1 = emojis[4]; // 👎
            textContent = " Peut mieux faire ! ";
            emoji2 = emojis[4]; // 👎
            break;
        case 1:            
            emoji1 = emojis[3]; // 😭
            textContent = " Il reste quelques erreurs. ";
            emoji2 = emojis[3]; // 😭
            break;
        case 2:
            emoji1 = emojis[2]; // 👀
            textContent = " Encore un effort ... ";
            emoji2 = emojis[2]; // 👀
            break;
        case 3:
            emoji1 = emojis[1]; // ✨
            textContent = " Vous y êtes presque ! ";
            emoji2 = emojis[1]; // ✨
            break;
        case 4:
            emoji1 = emojis[0]; // ✔️
            textContent = " Bravo, c'est un sans faute ! ";
            emoji2 = emojis[0]; // ✔️
            detailText = "Quelle culture ...";
            break;
        default:
            textContent = "Continuez !";
            break;
    }

    const summaryBlock = document.createElement("div");
    summaryBlock.classList.add("results-summary");

    // Créer le h2 avec la classe title et les emojis dans des spans
    const summaryP = document.createElement("h2");
    summaryP.classList.add("title");

    // Ajouter le premier emoji dans un span
    if (emoji1) {
        const span1 = document.createElement("span");
        span1.innerText = emoji1;
        summaryP.appendChild(span1);
    }

    // Ajouter le texte
    summaryP.appendChild(document.createTextNode(textContent));

    // Ajouter le deuxième emoji dans un span
    if (emoji2) {
        const span2 = document.createElement("span");
        span2.innerText = emoji2;
        summaryP.appendChild(span2);
    }

    const detailP = document.createElement("p");
    detailP.innerText = detailText;

    const scoreP = document.createElement("h3");
    scoreP.innerText = `Score : ${correctCount} / ${shuffledQuestions.length}`;

    summaryBlock.appendChild(summaryP);
    summaryBlock.appendChild(detailP);
    summaryBlock.appendChild(scoreP);

    // Insère le récap avant la liste détaillée
    resultsElement.insertBefore(summaryBlock, resultsElement.firstChild);

    // Affiche un bouton pour recommencer
    const restartBtn = document.createElement("button");
    restartBtn.type = "button";
    restartBtn.innerText = "Recommencer le quiz";
    restartBtn.classList.add("btn");
    restartBtn.addEventListener("click", () => {
        // Réinitialise l'interface et retour au début
        resultsElement.classList.add("hide");
        resultsElement.innerHTML = "";
        startButton.classList.remove("hide");
        quizContainer.classList.add("hide");
        questionContainer.classList.remove("hide");
        answerButtonsElement.innerHTML = "";
    });
    resultsElement.appendChild(restartBtn);
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
