Je souhaite créer un outil web (HTML/JS/CSS) qui permet de faire du 'subsetting' de polices variables (Variable Fonts) localement dans le navigateur.

Fonctionnalités requises :

Un choix de police parmi celles de Google Fonts (exemple pratique : <https://gwfh.mranftl.com/fonts>)

Une zone de drag & drop pour accepter des fichiers .ttf ou .woff.

Utiliser la bibliothèque 'opentype.js' pour analyser le fichier et lister les axes de variation disponibles (ex: wght, wdth).

Permettre à l'utilisateur de sélectionner des plages de caractères (ex: Latin de base U+0000-007F).

Utiliser une approche client-side pour générer un nouveau fichier de police réduit (subset).

Afficher une prévisualisation de la police avec un slider pour tester les axes variables. Exemple pratique : <https://wakamaifondue.com/beta/>

Proposer un bouton de téléchargement du fichier optimisé (en .woff2)

Contraintes techniques :

Pas de backend (100% Vanilla JS ou une petite application React/Vite).

Utilise des bibliothèques modernes comme 'opentype.js' ou une version WASM de 'harfbuzz' si nécessaire pour le subsetting réel.

Le code doit être propre, commenté en français, et inclure un CSS moderne. Utiliser :

- assets/layouts.css pour les positionnements
- assets/natives.css pour les styles des éléments HTML natifs
- assets/theme.css et theme-tokens.css pour les themes (tu peux ajouter une teinte primaire si tu souhaites)
- assets/anime.css pour les animations au scroll si besoin
- assets/styles.css pour les styles du projet

Peux-tu me générer le fichier index.html et le script main.js correspondant ?
