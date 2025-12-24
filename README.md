# Fondue

**Fondue** est un outil web moderne pour optimiser vos polices de caractères (subsetting) et les convertir au format WOFF2, standard actuel pour le web. Il est conçu pour être simple, rapide et respectueux de la vie privée, fonctionnant entièrement dans votre navigateur.

## 🚀 Fonctionnalités

- **Importation facile** : Support du glisser-déposer pour les fichiers `.ttf`, `.otf`, `.woff` et `.woff2`.
- **Analyse détaillée** : Affiche les métadonnées de la police (nom, format, poids, nombre de glyphes, fonderie, etc.).
- **Support des Fontes Variables** : Détection automatique des axes de variation (poids, largeur, etc.) avec prévisualisation interactive.
- **Subsetting (Jeu de caractères)** : Réduisez la taille de vos fichiers en ne conservant que les caractères nécessaires (Latin Basic, Latin-1 Supplement, etc.).
- **Prévisualisation en direct** : Testez le rendu de la police avec votre propre texte avant l'export.
- **Export WOFF2** : Génération de fichiers optimisés prêts pour la production.
- **100% Client-side** : Vos fichiers de police ne sont jamais envoyés sur un serveur. Tout le traitement se fait localement dans votre navigateur via WebAssembly.

## 🌐 Démo

L'outil est accessible en ligne ici : **[fondue.alsacreations.com](https://fondue.alsacreations.com)**

## 🛠️ Installation et Développement local

Ce projet utilise [Vite](https://vitejs.dev/) comme outil de build.

### Prérequis

- Node.js (version 20 recommandée)
- pnpm (recommandé) ou npm

### Étapes

1. **Cloner le dépôt**

   ```bash
   git clone https://github.com/votre-user/caractere.git
   cd caractere
   ```

2. **Installer les dépendances**

   ```bash
   pnpm install
   ```

3. **Lancer le serveur de développement**

   ```bash
   pnpm run dev
   ```

   L'application sera accessible sur `http://localhost:5173`.

4. **Construire pour la production**

   ```bash
   pnpm run build
   ```

   Les fichiers générés se trouveront dans le dossier `dist/`.

## 🧰 Technologies utilisées

- **HTML5 & CSS3** : Interface moderne et responsive, sans framework CSS lourd (CSS Vanilla + Custom Properties).
- **JavaScript (ES6+)** : Logique applicative.
- **[Vite](https://vitejs.dev/)** : Bundler et serveur de développement ultra-rapide.
- **[opentype.js](https://opentype.js.org/)** : Parsing et analyse des fichiers de police.
- **[harfbuzzjs](https://github.com/harfbuzz/harfbuzzjs)** : Moteur de rendu et de subsetting de texte haute performance (via WebAssembly).

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.
