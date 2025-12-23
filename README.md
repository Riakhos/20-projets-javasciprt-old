# Cours — 20 projets JavaScript (Résumé des projets)

Ce dépôt regroupe 20 projets JavaScript progressifs, chacun disponible en deux versions pour apprendre par la pratique :
- Projets de départ → votre version à coder
- Projets terminés → version finale de référence

Structure du dépôt
- 1. Projets de départ/ → projets à réaliser (HTML/CSS/JS de base)
- 2. Projets terminés/ → solutions complètes et optimisées
- assets/ → ressources communes
- README.md ← ce fichier

Comment lancer un projet localement
1. Ouvrir le dossier du projet (ex. 1. Projets de départ/13. Liste filtrable).
2. Recommandé : servir en local pour éviter CORS.
   - Python 3 : `python -m http.server 8000`
   - Node (serve) : `npx serve .`
3. Ouvrir l’entrée du projet via http://localhost:8000 (index.html).

Conventions et bonnes pratiques
- Fichiers principaux : index.html, style.css, app.js ou script.js.
- Classes simples et lisibles (ex. .app-header, .search-input).
- Tester l’accessibilité (focus clavier, aria-live) et le responsive.
- Les ressources (images/icônes) sont dans assets/ ou ressources/.

Résumé harmonisé des 20 projets
1. IMC — calculateur d’IMC (poids/taille), validation des inputs, classement via IMCData.
2. Quizz — formulaire de quiz, messages et couleurs selon résultats, revalidation possible.
3. WikiApp — recherche d’articles via Wikipedia API, loader et gestion d’erreurs.
4. Cookies — créateur/afficheur de cookies, suppression et toasts (notification).
5. AppMétéo — météo via IQAir API (géolocalisation), loader, affichage ville/pays/température/icône.
6. CouleursJS — générateur de dégradés (linear-gradient), orientation, copie et aléatoire.
7. Pomodoro — minuteur travail/repos, play/pause, cycles, reset et animation de statut.
8. ValidationForm — pseudo/email/mot de passe avec regex, jauge de force et confirmation.
9. MemoryCard — jeu de paires, retournement, score par essais, relance de partie.
10. ScrollInfini — images Unsplash avec Intersection Observer et recherche.
11. Slider — composant slider avec transitions entrées/sorties et boucle des index.
12. Générateur de mot de passe — options (minuscules/majuscules/symboles/chiffres), taille, crypto sécurisé.
13. Liste filtrable — liste d’utilisateurs (RandomUser), tri, filtrage en temps réel.
14. CustomLecteurVidéo — lecteur vidéo custom : play/pause, durée, volume, seek, plein écran.
15. JeuDuMorpion — morpion (X/O), détection de combinaisons gagnantes, message et nouvelle partie.
16. ParticulesJS — animation Canvas 2D, particules connectées, requestAnimationFrame, responsive.
17. Animations — machine à écrire, reveals au scroll (Intersection Observer), curseur personnalisé.
18. TypingGame — jeu de frappe : API de phrases, chrono 1 min, score WPM/précision.
19. Calculatrice — saisie décimale, parsing et évaluation d’expressions (sans eval), CE/C, priorité opérateurs.
20. Player audio — lecteur audio : play/pause, progression cliquable, suivant/précédent, shuffle.

Conseils rapides
- Avancer projet par projet, lire HTML/CSS puis JS.
- En cas de blocage, comparer avec la version “Projets terminés”.
- Faire des commits fréquents et explicites.

Crédits & Licence
- Source : cours « 20 projets JavaScript ».
- Usage personnel et pédagogique autorisé. Redistribution globale interdite sans accord.

Bon codage ! 🚀