# Ma Boussole Business

Page de vente et outil en ligne (français, tutoiement). **Bloc gratuit** : charte Human Design → quiz express (9 questions, dont le choix du parcours « pas encore d'idée » / « déjà un projet ») → e-mail demandé pour révéler le profil (archétype d'entrepreneur·e + piste n°1, envoyé par e-mail). **Version complète à 22 €** : bilan approfondi en 7 modules, 4 pistes classées, idées par IA, comité de 6 experts IA, offre + récap. Hébergement Vercel, base Supabase, paiement SumUp, e-mails Brevo, IA Claude (API Anthropic).

## Structure
- `src/page.html` : gabarit HTML + tout le CSS (palette crème/beige/marron en tokens, thème sombre inclus). Contient les marqueurs `/*ENGINE*/ /*CONTENT*/ /*APP*/`.
- `src/engine.js` : calcul de la charte (éphémérides simplifiées de Schlyter, portes, canaux, type, autorité, profil). Aucune dépendance.
- `src/content.js` : tous les textes (types, autorités, profils, centres, canaux, questions du bilan, 30 idées de business, textes « business » des 4 clés, `QUIZ` express, `ARCHETYPES`).
- `src/app.js` : logique de la page (formulaire, quiz express, porte e-mail, profil gratuit, paywall, bilan en 7 modules, scoring des idées, comité d'experts, récap, mode exemple, barre « étape suivante »).
- `public/index.html` : **fichier généré**, ne pas modifier à la main. Régénérer avec `npm run build` après toute modification de `src/`.
- `public/*.html` : pages légales (placeholders surlignés entre crochets à compléter).
- `api/` : fonctions serverless Vercel (Node 18+, `fetch` natif, aucune dépendance).
  - `checkout.js` : crée un Hosted Checkout SumUp (`POST /v0.1/checkouts`, `hosted_checkout.enabled`, `return_url` = webhook), enregistre la ligne `boussole_purchases` (PENDING + e-mail), renvoie `{id, url}`.
  - `verify.js` : `{id}` → `confirmCheckout` (lib/payments.js) ; `{token}` → vérifie un lien d'accès. Renvoie un jeton HMAC (`lib/token.js`).
  - `sumup-webhook.js` : notification SumUp ; relit le checkout chez SumUp avant de confirmer.
  - `verify.js` accepte aussi `{code}` : si `ACCESS_CODE` correspond, délivre un jeton de test `code-<empreinte du code>-<uuid>` (version complète sans paiement, hors quota IA et hors statistiques). Changer ou vider `ACCESS_CODE` révoque ces jetons. Lien de test : `/?code=XXX`.
  - `restore.js` : « Déjà acheté ? » → renvoie le lien d'accès (`/?acces=<jeton>`) à l'e-mail d'achat ; réponse identique que l'adresse soit cliente ou non.
  - `claude.js` : relais vers `POST /v1/messages`, réservé aux détenteurs d'un jeton valide, plafonné par achat (`AI_CALLS_LIMIT`, RPC `boussole_use_ai`) ; renvoie `{data}` (JSON parsé).
  - `send-email.js` : Brevo. Type `carte` (profil gratuit) : enregistre le prospect dans `boussole_leads` (1 envoi/min, 10 max par adresse). Type `recap` exige le jeton.
- `lib/` : `db.js` (Supabase REST, service_role ; renvoie `null` si non configuré, le site continue de marcher), `brevo.js`, `payments.js` (`confirmCheckout` : passe à PAID une seule fois, marque le prospect client, envoie l'e-mail avec le lien d'accès), `token.js`.
- `supabase/migrations/` : schéma SQL (tables `boussole_leads`, `boussole_purchases`, fonction `boussole_use_ai`, vue `boussole_stats`). À exécuter dans le SQL Editor de Supabase. Tables préfixées car la base est partagée avec d'autres projets.
- `.claude/agents/expert-tunnel-vente.md` : agent spécialisé tunnel de vente / expérience client pour cette niche.
- `docs/recherche-human-design-business-design.md` : dossier de recherche (méthode Business Design en 5 étapes, limites éthiques et légales, sources) et tableau de ce qui est déjà mis en œuvre. À relire avant toute évolution du contenu.
- `.env.example` : variables à définir dans Vercel.

## Flux de paiement
Front : clic « Débloquer » (e-mail + case CGV obligatoires) → `/api/checkout` → `S.pendingCheckout = id` (localStorage) → redirection SumUp → retour sur `SITE_URL/?paiement=ok#bilan` → `verifyReturn()` appelle `/api/verify` (jusqu'à 6 essais) → `S.paid = true`, `S.token` stocké. En parallèle, le webhook SumUp confirme côté serveur et l'e-mail « Ton accès complet » part une seule fois avec le lien `/?acces=<jeton>#bilan` (accès multi-appareils).

## État côté client
Tout l'état est dans `localStorage` sous la clé `boussole-business-v1` (objet `S` : `birth`, `quick` (quiz express, dont `path` : `idee` ou `projet`), `reson`, `ans` (bilan), `chart`, `offer`, `experts`, `email`, `emailSent`, `optin`, `utm`, `paid`, `token`). Les pistes utilisent `activeAns()` : le quiz express, remplacé module par module par le bilan approfondi terminé. Le mode exemple « Camille » s'ouvre via le bouton du hero (`data-example`) : l'état réel est mis de côté sous `boussole-business-v1-mine` et restauré en quittant l'exemple.

## À faire / pistes
- Tester les vrais appels SumUp et Brevo (prix à 1 € via `PRICE_EUR`), vérifier la forme exacte des réponses SumUp (champ `transactions`, notification webhook).
- Séquence d'e-mails de relance Brevo pour les prospects non clients (automatisation sur la liste Prospects).
- Captcha éventuel sur le formulaire e-mail gratuit si des abus apparaissent.
- Valider le calcul de charte sur plusieurs dates contre un calculateur de référence (précision ~1 minute d'arc ; le nœud lunaire utilise une approximation du nœud vrai).

## Conventions
- Textes en français, tutoiement, ton chaleureux et concret. Le Human Design est toujours présenté comme une grille de réflexion, jamais comme une science.
- Ne jamais utiliser l'expression « bilan de compétences » (prestation réglementée en France).
- Le Human Design n'entre jamais dans le score des pistes et n'attribue jamais un métier à un type : il inspire des questions (`TYPE_Q`, `AUTH_Q`, `LINE_Q`, `CENTER_Q`) et des conseils sur la façon de travailler et de vendre.
- Chaque lecture peut être contestée (« Ça me parle / Pas vraiment », `S.reson`) ; le comité ne s'appuie pas sur ce qui est rejeté.
- Le parcours suit la méthode du dossier : se découvrir (charte, quiz, profil) → comprendre ses forces (bilan) → explorer (pistes) → choisir (comité, piste prioritaire + alternative) → passer à l'action (plan 30 jours + critères de validation `VALIDATION`).
