## Application Pressing by Ramou Diouf

Application web de gestion complète, 100% en français, palette bleu personnalisée, devise FCFA.

### 1. Base de données (Supabase)

Tables créées via migration :
- `clients` : id, nom, whatsapp, created_at
- `articles` : id, nom, prix, type_prix (enum: 'kilo' | 'fixe'), actif
- `commandes` : id, numero_ticket (unique), client_id, statut (enum), date_depot, date_recuperation_estimee, date_recuperation_reelle, total_fcfa, created_at
- `lignes_commande` : id, commande_id, article_id, poids_kg, quantite, sous_total

Enums : `type_prix_enum` (kilo, fixe), `statut_commande_enum` (en_attente, en_cours, pret, recupere)

Séquence pour numéro de ticket auto : `PRE-0001`, `PRE-0002`, ...

Seed des 12 articles tarifaires fournis.

**Sécurité (simplification)** : pas d'auth — application interne pressing. RLS désactivé sur ces tables (accès anon autorisé en lecture/écriture). Note : pour un déploiement réel, ajouter un login admin.

### 2. Design system

- Primaire `#355872`, Secondaire `#7AAACE`, Accent `#9CD5FF`, Fond `#F7F8F0`
- Tokens dans `src/styles.css` (oklch)
- Layout avec sidebar shadcn

### 3. Pages / Routes

- `/` — Tableau de bord (KPIs + graphiques)
- `/nouvelle-commande` — Formulaire création
- `/commandes` — Liste avec filtres (statut/date/client) + recherche
- `/commandes/$id` — Détail + ticket imprimable + bouton WhatsApp + changement statut
- `/articles` — Gestion des tarifs

### 4. Composants clés

- `AppSidebar` — navigation
- `FormulaireCommande` — sélection articles, poids/quantité, calcul total
- `Ticket` — version imprimable (CSS @media print)
- `BoutonWhatsApp` — génère lien `wa.me/221XXX?text=...`
- `KPICard`, `GraphiqueEvolution` (recharts), `TopArticles`

### 5. Fonctionnalités

- Création commande : choix client (nom + WhatsApp), articles multiples, calcul auto
- Génération `numero_ticket` côté serveur (function SQL)
- Workflow statuts : En attente → En cours → Prêt → Récupéré
- Recherche par ticket ou nom
- KPIs : CA jour/mois, nb commandes jour/total, en attente, récupérées ce mois
- Graphique commandes/semaine + top 5 articles

### Détails techniques

- Stack : TanStack Start + React + Tailwind + shadcn + Supabase + Recharts
- Toutes les écritures via le client Supabase côté navigateur (pas d'auth donc pas besoin de serverFn protégé)
- Numérotation ticket : function PostgreSQL `generer_numero_ticket()` avec séquence
- Date pickers : react-day-picker (déjà installé)
- WhatsApp : format `https://wa.me/221XXXXXXXX?text=...` (URI encoded)

Je démarre l'implémentation directement après validation.
