# 🚀 Déploiement sur Vercel — Pressing by Ramou Diouf

## ⚠️ Important à savoir

Ce projet est construit avec **TanStack Start** et configuré par défaut pour **Cloudflare Workers** (l'hébergement Lovable). Pour déployer sur Vercel, il faut quelques ajustements manuels après export.

---

## 📋 Étapes de déploiement

### 1️⃣ Exporter le code sur GitHub

Dans Lovable :
1. Clique sur le bouton **GitHub** (menu **+** en bas à gauche du chat)
2. **Connecter le projet** → Autoriser l'application Lovable
3. **Créer le repository** → Lovable pousse tout le code

### 2️⃣ Adapter la config pour Vercel (sur ton repo local)

Une fois le code cloné depuis GitHub :

```bash
git clone https://github.com/<ton-user>/<ton-repo>.git
cd <ton-repo>
bun install
```

**a)** Supprime la config Cloudflare :
```bash
rm wrangler.jsonc
```

**b)** Remplace `vite.config.ts` par :
```ts
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tsConfigPaths(),
    tailwindcss(),
    tanstackStart({ target: "vercel" }),
    viteReact(),
  ],
});
```

**c)** Installe les dépendances manquantes :
```bash
bun add -d @tanstack/react-start vite @vitejs/plugin-react @tailwindcss/vite vite-tsconfig-paths
```

**d)** Commit & push :
```bash
git add . && git commit -m "Configure Vercel deployment" && git push
```

### 3️⃣ Importer sur Vercel

1. Va sur https://vercel.com → **Add New… → Project**
2. Importe ton repo GitHub
3. Framework Preset : **Other**
4. Build Command : `bun run build`
5. Output Directory : `.vercel/output` (auto-détecté avec le preset Vercel)

### 4️⃣ Variables d'environnement Vercel

Dans **Project Settings → Environment Variables**, ajoute :

| Nom | Valeur |
|-----|--------|
| `VITE_SUPABASE_URL` | `https://ksbbibxljtvmezrudzpu.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | (la clé publique de ton `.env`) |
| `VITE_SUPABASE_PROJECT_ID` | `ksbbibxljtvmezrudzpu` |
| `SUPABASE_URL` | identique à `VITE_SUPABASE_URL` |
| `SUPABASE_PUBLISHABLE_KEY` | identique à `VITE_SUPABASE_PUBLISHABLE_KEY` |

### 5️⃣ Configurer Supabase Auth

Dans **Lovable Cloud → Users → URL Configuration**, ajoute ton URL Vercel (ex : `https://ton-app.vercel.app`) aux **Redirect URLs**, sinon la connexion Google échouera.

---

## 🔁 Workflow recommandé

- **Développement** : continue dans Lovable (sync auto avec GitHub)
- **Déploiement** : Vercel redéploie automatiquement à chaque push GitHub

---

## 💡 Alternative simple

Si tu veux éviter cette config manuelle, l'app est **déjà déployée** sur :
👉 https://pressing-ramou-diouf.lovable.app

Clique sur **Publier** en haut à droite dans Lovable pour mettre à jour.
