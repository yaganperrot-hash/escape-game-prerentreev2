# 🎮 ETNA Escape Game - Terminal Edition

Escape game interactif avec interface terminal style VSCode pour découvrir l'ETNA.

## 🚀 Caractéristiques

### Design Terminal VSCode
- Interface style VSCode avec thème sombre
- Logo ETNA intégré dans l'en-tête
- Animations typewriter pour un effet immersif
- Timer pour suivre votre progression
- Couleurs professionnelles inspirées de VSCode

### Fonctionnalités
- ✅ 7 énigmes progressives
- ✅ Timer persistant entre les pages
- ✅ Effets d'animation caractère par caractère
- ✅ Navigation par boutons ou commandes terminal
- ✅ Design responsive (mobile/desktop)
- ✅ Feedback visuel pour chaque étape

## 📁 Structure des fichiers

```
escape-game/
├── index.html          # Page d'accueil
├── etape1.html         # Étape 1 - Services
├── etape2.html         # Étape 2 - Le maître du code
├── etape3.html         # Étape 3 - Décoder le binaire
├── etape4.html         # Étape 4 - Debug HTML
├── etape5.html         # Étape 5 - Base de données (drag & drop)
├── etape6.html         # Étape 6 - Découvrir le hacker
├── etape7.html         # Étape 7 - Mot de passe final
├── final.html          # Page de félicitations
└── assets/
    ├── style.css       # Styles terminal VSCode
    └── script.js       # Logique du jeu
```

## 🎯 Les énigmes

1. **Étape 1 - Services** : Associer les salles aux bons services
   - Lettre obtenue : **V**

2. **Étape 2 - Le maître du code** : Identifier l'école
   - Lettre obtenue : **O**

3. **Étape 3 - Décoder le binaire** : Déchiffrer les formations
   - Lettre obtenue : **L**

4. **Étape 4 - Debug HTML** : Réparer le bouton de connexion
   - Lettre obtenue : **C**

5. **Étape 5 - Base de données** : Organiser les fichiers par drag & drop
   - Lettre obtenue : **A**

6. **Étape 6 - Découvrir le hacker** : Identifier le coupable
   - Lettre obtenue : **N**

7. **Étape 7 - Mot de passe final** : Utiliser les lettres pour former VOLCAN

## 🎨 Personnalisation

### Couleurs du thème
Les couleurs sont définies dans `assets/style.css` :

```css
:root {
  --bg-primary: #1e1e1e;        /* Fond principal */
  --bg-secondary: #252526;       /* Fond secondaire */
  --text-primary: #d4d4d4;       /* Texte principal */
  --accent-blue: #569cd6;        /* Accent bleu */
  --accent-green: #4ec9b0;       /* Accent vert */
  --accent-yellow: #dcdcaa;      /* Accent jaune */
  --etna-blue: #0066cc;          /* Bleu ETNA */
}
```

### Polices utilisées
- **JetBrains Mono** : Police principale
- **Fira Code** : Police alternative

## 🚦 Installation

1. Téléchargez tous les fichiers
2. Assurez-vous que la structure des dossiers est respectée
3. Ouvrez `index.html` dans un navigateur moderne
4. Profitez de l'escape game !

## 💡 Fonctionnalités techniques

### Timer persistant
Le timer utilise `sessionStorage` pour persister entre les pages :
```javascript
sessionStorage.setItem('escapeGameStartTime', Date.now());
```

### Animation typewriter
Effet de frappe caractère par caractère :
```javascript
typeWriter(element, text, speed = 30);
```

### Drag & Drop (Étape 5)
Système de glisser-déposer natif HTML5 pour organiser la base de données.

### Validation intelligente
Chaque énigme a sa propre logique de validation avec feedback visuel.

## 🎮 Navigation

### Par boutons
- Cliquez sur les boutons pour naviguer entre les étapes

### Par commandes (pour les utilisateurs avancés)
- `next` / `suivant` : Passer à l'étape suivante
- `validate` / `valider` : Valider la réponse actuelle
- `help` / `aide` : Afficher l'aide
- `Ctrl/Cmd + Enter` : Raccourci pour valider

## 🌐 Compatibilité

- ✅ Chrome (recommandé)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile (responsive design)

## 📝 Remarques

- Les lettres sont : V-O-L-C-A-N
- Le mot de passe final est : **VOLCAN**
- Le hacker est : **Yagan PERROT**

## 🎉 Crédits

Escape game créé pour l'ETNA avec une interface terminal moderne inspirée de VSCode.

---

**Bonne chance pour déjouer les plans du hacker ! 🚀**
