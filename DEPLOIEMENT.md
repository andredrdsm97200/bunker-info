# 🚀 Déployer Bunker — Guide Mac complet

## Structure du projet
```
bunker/
├── api/
│   └── check.js       ← Backend sécurisé (contient la clé API côté serveur)
├── public/
│   └── index.html     ← Le site Bunker (carte monde + 11 hotspots)
├── vercel.json        ← Configuration Vercel
├── package.json
└── DEPLOIEMENT.md     ← Ce guide
```

Architecture sécurisée :
```
Visiteur → bunker-info.vercel.app → /api/check → API Anthropic
                                    (clé cachée ici,
                                     jamais exposée)
```

---

## Étape 1 — Créer les 3 comptes (5 min)

### A. Anthropic (clé API)
1. **https://console.anthropic.com** → créez un compte
2. Menu **API Keys** → **Create Key** → nommez-la `Bunker`
3. **Copiez la clé immédiatement** (`sk-ant-...`) dans une note — elle ne sera affichée qu'une seule fois
4. **Settings → Billing** → ajoutez une carte + fixez un plafond à 5 €/mois

### B. GitHub
- **https://github.com** → Sign up

### C. Vercel
- **https://vercel.com** → Sign up → **"Continue with GitHub"**

---

## Étape 2 — Installer les outils sur Mac (5 min)

Ouvrez **Terminal** : ⌘ + Espace → tapez "Terminal" → Entrée

Vérifiez Git :
```bash
git --version
```
- Si Mac demande d'installer les Command Line Tools → cliquez **Installer**
- Sinon, Git est déjà prêt ✓

**Node.js** : https://nodejs.org → bouton **LTS** → téléchargez le `.pkg` → double-cliquez → Installer

**VS Code** : https://code.visualstudio.com → téléchargez → glissez dans Applications

Vérifiez que tout est ok :
```bash
node --version
git --version
```

---

## Étape 3 — Préparer le projet

1. Dézippez le fichier `bunker-projet-complet.zip`
2. Déplacez le dossier `bunker/` dans **Documents**
3. Ouvrez **VS Code** → **File → Open Folder** → `Documents/bunker`

---

## Étape 4 — Pousser sur GitHub (5 min)

Dans VS Code : **Terminal → New Terminal** (ou ⌃ + ` ).

Tapez ces commandes une par une :

```bash
git init
git add .
git commit -m "Bunker - premier déploiement"
```

Créez le repo GitHub :
1. **https://github.com/new**
2. **Repository name** : `bunker-info`
3. Laissez **Public**
4. **Ne cochez rien d'autre**
5. **Create repository**

Retournez dans le terminal VS Code (remplacez `VOTRE-NOM` par votre pseudo GitHub) :

```bash
git branch -M main
git remote add origin https://github.com/VOTRE-NOM/bunker-info.git
git push -u origin main
```

Mac ouvre une fenêtre pour vous connecter à GitHub → autorisez, c'est fait.

---

## Étape 5 — Déployer sur Vercel (5 min)

1. **https://vercel.com/new**
2. Vous voyez `bunker-info` → cliquez **Import**
3. **Project Name** : `bunker-info`
4. **Dépliez la section "Environment Variables"** :
   - **Key** : `ANTHROPIC_API_KEY`
   - **Value** : collez votre clé `sk-ant-...`
   - Cliquez **Add**
5. **Deploy**

⏱ Patientez 30 secondes.

🎉 **Votre site est en ligne !** URL : `https://bunker-info.vercel.app`

---

## Étape 6 — Tester chaque fonctionnalité

Ouvrez l'URL Vercel et testez :

- [ ] **Barre de recherche** : tapez "La Terre est plate ?" → verdict doit s'afficher
- [ ] **Suggestions** (💉 Vaccin, 🌡 Climat…) : cliquez → ça doit lancer une analyse
- [ ] **Bouton Actualiser** dans les tendances → 6 nouveaux fact-checks
- [ ] **Carte monde** : cliquez sur des pays → deviennent verts
- [ ] **Points chauds** : survolez les points rouges clignotants → tooltip avec info
- [ ] **Newsletter** : remplissez un email → validation
- [ ] **Sur mobile** : testez l'URL depuis votre téléphone aussi

---

## Étape 7 — Modifier le site ensuite

### Workflow standard (depuis VS Code)
```bash
# 1. Modifier les fichiers dans VS Code
# 2. Dans le terminal intégré :
git add .
git commit -m "Description des changements"
git push
# 3. Vercel redéploie automatiquement en 20s, URL identique
```

### Aperçu local avant publication
```bash
cd Documents/bunker
vercel dev
# Ouvre http://localhost:3000 — vous voyez vos changements en live
```

### Petite modif urgente depuis le téléphone
1. Allez sur `github.com/VOTRE-NOM/bunker-info`
2. Cliquez sur le fichier → crayon ✏️
3. Modifiez → **Commit changes**
4. Vercel redéploie tout seul

---

## Quels fichiers modifier pour quoi ?

| Pour modifier... | Fichier | Endroit |
|---|---|---|
| Le texte du site | `public/index.html` | Cherchez le texte dans le HTML |
| Le design / couleurs | `public/index.html` | Section `<style>` en haut |
| Les questions du fond animé | `public/index.html` | Cherchez `const newsData` |
| Les fact-checks initiaux | `public/index.html` | Cherchez `const defaultTrend` |
| Les points chauds de la carte | `public/index.html` | Cherchez `HOTSPOTS` |
| Le prompt IA (comportement) | `api/check.js` | Variable `prompts` |
| Le modèle IA utilisé | `api/check.js` | Cherchez `model:` |

---

## 💰 Coûts

- **Vercel** : Gratuit (100 GB bande passante/mois suffisent largement)
- **Anthropic** : ~0,003 $ par vérification
  - 100 vérifs ≈ 30 centimes
  - 1 000 vérifs ≈ 3 €
  - Pour un usage personnel : quelques centimes/mois

---

## 🆘 Dépannage

**"Clé API non configurée sur le serveur"**
→ Variable d'environnement manquante dans Vercel, OU il faut redéployer après l'avoir ajoutée.
→ Solution : Vercel → votre projet → Settings → Environment Variables → vérifiez `ANTHROPIC_API_KEY` → puis Deployments → "..." → Redeploy

**"Error 500" lors d'une vérification**
→ Vérifiez que votre compte Anthropic a du crédit (console.anthropic.com → Billing)

**Le site s'affiche mais la vérif ne marche pas**
→ Ouvrez la console du navigateur (clic droit → Inspecter → Console) pour voir l'erreur précise

**"Command not found: vercel"**
→ `npm install -g vercel` dans le terminal

---

## 🎁 Nom de domaine personnalisé

Pour avoir `bunker-info.com` au lieu de `bunker-info.vercel.app` :
1. Achetez le domaine (Namecheap, OVH, etc., ~12 €/an)
2. Vercel → votre projet → Settings → Domains
3. Entrez votre domaine → Vercel vous guide pour le DNS
