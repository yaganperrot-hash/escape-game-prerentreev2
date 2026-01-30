# 🔐 Système d'Authentification - ETNA Escape Game

## 📋 Vue d'ensemble

Le système d'authentification demande aux étudiants de s'identifier avec leur login ETNA avant d'accéder au jeu.

## 🚀 Solution Actuelle : Liste Locale (logins.json)

### Comment ça marche ?

1. L'étudiant arrive sur `index.html`
2. Après "Aujourd'hui commence votre pré-rentrée", un champ de login apparaît
3. L'étudiant entre son login (format: `prenom_nom`)
4. Le système affiche "Connexion en cours..."
5. Si le login est valide → le jeu continue
6. Si le login est invalide → message d'erreur et réessai

### 📝 Gérer la liste des logins

**Fichier:** `logins.json`

```json
{
  "logins": [
    "dupont_j",
    "martin_a",
    "bernard_m"
  ]
}
```

**Pour ajouter/modifier des logins :**
1. Ouvrez `logins.json`
2. Ajoutez les logins dans le tableau (format: `"prenom_nom"`)
3. Sauvegardez
4. Redéployez sur Netlify

**Important :** Les logins doivent être en **minuscules** et au format `prenom_nom`

---

## 📊 Solution Avancée : Google Sheets (à venir)

Si vous souhaitez gérer les logins via Google Sheets :

### Avantages
- Mise à jour facile sans redéploiement
- Interface familière
- Partage avec l'équipe pédagogique

### Prérequis
1. Un compte Google Cloud Platform (gratuit)
2. Créer une Google Sheet avec les logins
3. Activer l'API Google Sheets
4. Créer une clé API

### Configuration

1. **Créer votre Google Sheet**
   ```
   Colonne A : Login
   ----------------
   dupont_j
   martin_a
   bernard_m
   ```

2. **Obtenir l'ID de la Sheet**
   - URL de votre sheet : `https://docs.google.com/spreadsheets/d/[ID_ICI]/edit`
   - Copiez l'ID

3. **Créer une clé API**
   - Allez sur [Google Cloud Console](https://console.cloud.google.com/)
   - Créez un nouveau projet
   - Activez "Google Sheets API"
   - Créez une clé API (Credentials → Create Credentials → API Key)
   - **Restreignez la clé** : HTTP referrers → Ajoutez votre domaine Netlify

4. **Modifier le code**
   
   Dans `script.js`, remplacez la fonction `validateLogin()` :

   ```javascript
   async function validateLogin(login) {
     const SHEET_ID = 'VOTRE_SHEET_ID_ICI';
     const API_KEY = 'VOTRE_API_KEY_ICI';
     const RANGE = 'Sheet1!A:A'; // Colonne A
     
     try {
       const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;
       const response = await fetch(url);
       const data = await response.json();
       
       // Extraire les logins (sauter la première ligne si c'est un header)
       const logins = data.values.slice(1).map(row => row[0].toLowerCase().trim());
       
       return logins.includes(login);
     } catch (error) {
       console.error('Erreur Google Sheets:', error);
       // Fallback sur la liste locale
       return validateLoginLocal(login);
     }
   }
   ```

5. **Sécurité importante**
   - ⚠️ **Ne commitez JAMAIS votre API key dans Git**
   - Utilisez les **Environment Variables** de Netlify
   - Ou utilisez **Netlify Functions** pour cacher la clé

### Option sécurisée : Netlify Functions

Pour éviter d'exposer votre clé API, créez une fonction serverless :

```javascript
// netlify/functions/check-login.js
exports.handler = async (event) => {
  const { login } = JSON.parse(event.body);
  const SHEET_ID = process.env.GOOGLE_SHEET_ID;
  const API_KEY = process.env.GOOGLE_API_KEY;
  
  // Appeler Google Sheets API ici
  // ...
  
  return {
    statusCode: 200,
    body: JSON.stringify({ valid: true/false })
  };
}
```

Puis dans votre code frontend :
```javascript
async function validateLogin(login) {
  const response = await fetch('/.netlify/functions/check-login', {
    method: 'POST',
    body: JSON.stringify({ login })
  });
  const data = await response.json();
  return data.valid;
}
```

---

## 🎯 Recommandation

**Pour débuter :** Utilisez `logins.json` (simple et rapide)

**Pour production :** Passez à Google Sheets + Netlify Functions (sécurisé et pratique)

---

## 🐛 Dépannage

**Le login ne fonctionne jamais :**
- Vérifiez que `logins.json` est bien déployé avec le site
- Ouvrez la console (F12) pour voir les erreurs
- Vérifiez que les logins sont en minuscules

**"Connexion en cours" reste bloqué :**
- Le fichier `logins.json` n'est pas trouvé
- Vérifiez le chemin du fichier

**Login valide mais rejeté :**
- Vérifiez les espaces
- Format exact : `prenom_nom` (underscore, pas tiret)
- Tout en minuscules

---

## 📧 Contact

Pour toute question sur l'implémentation, contactez l'équipe technique.
