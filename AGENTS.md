# Fondue - Agent Guide

Outil web 100% client-side pour l'optimisation (subsetting) et la conversion de polices en WOFF2.

## Tech Stack

- **Core** : HTML5, CSS Vanilla (Custom Properties), JavaScript (ES6+).
- **Build/Dev** : Vite, pnpm.
- **Font Stack** :
  - `opentype.js` : Analyse et manipulation des tables de fontes.
  - `harfbuzzjs` : Moteur de subsetting haute performance via WebAssembly (`hb-subset.wasm`).
  - `woff2-encoder` : Compression et décompression au format WOFF2.

## Commandes Essentielles

- `pnpm install` : Installation des dépendances.
- `pnpm dev` : Lancer le serveur de développement local (Vite).
- `pnpm build` : Builder le projet pour la production (sortie dans `/dist`).
- `pnpm preview` : Tester localement le build de production.

## Conventions Critiques

- **Zéro Backend** : Tout le traitement doit rester dans le navigateur (WebAssembly/Blobs).
- **CSS Vanilla** : Ne pas ajouter de framework CSS. Utiliser les variables CSS existantes.
- **Performance** : Les opérations lourdes (parsing, subsetting) doivent être asynchrones pour ne pas bloquer l'UI.
- **Naming** : Les fichiers exportés suivent la convention `Nom-opti.woff2`.
- **Assets** : Les polices d'exemple sont dans `/public/fonts` et la collection dans `/public/collection`.

---
*Note : Pour des détails sur HarfBuzz ou OpenType, voir les skills dédiées.*
