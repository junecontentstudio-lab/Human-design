# Ma Boussole Business

Page de vente et outil en ligne (français, tutoiement) : charte Human Design gratuite → bilan d'orientation gratuit → accès payant à 22 € (pistes de business, idées par IA, comité de 6 experts IA, offre + récap envoyé par e-mail). Hébergement Vercel, paiement SumUp, e-mails Brevo, IA Claude (API Anthropic).

## Structure
- `src/page.html` : gabarit HTML + tout le CSS (palette crème/beige/marron en tokens, thème sombre inclus). Contient les marqueurs `/*ENGINE*/ /*CONTENT*/ /*APP*/`.
- `src/engine.js` : calcul de la charte (éphémérides simplifiées de Schlyter, portes, canaux, type, autorité, profil). Aucune dépendance.
- `src/content.js` : tous les textes (types, autorités, profils, centres, canaux, questions du bilan, 30 idées de business, textes « business » des 4 clés).
- `src/app.js` : logique de la page (formulaire, bilan en 7 modules, scoring des idées, paywall, comité d'experts, récap, e-mails).
- `public/index.html` : **fichier généré**, ne pas modifier à la main. Régénérer avec `npm run build` après toute modification de `src/`.
- `public/*.html` : pages légales (placeholders surlignés entre crochets à compléter).
- `api/` : fonctions serverless Vercel (Node 18+, `fetch` natif, aucune dépendance).
  - `checkout.js` : crée un Hosted Checkout SumUp (`POST /v0.1/checkouts`, `hosted_checkout.enabled`), renvoie `{id, url}`.
  - `verify.js` : `GET /v0.1/checkouts/{id}` ; si `status === 'PAID'` et montant/marchand corrects, renvoie un jeton HMAC (`lib/token.js`).
  - `claude.js` : relais vers `POST /v1/messages`, réservé aux détenteurs d'un jeton valide ; renvoie `{data}` (JSON parsé).
  - `send-email.js` : Brevo (`/v3/contacts` puis `/v3/smtp/email` avec pièce jointe HTML). Type `carte` gratuit, type `recap` exige le jeton.
- `.env.example` : variables à définir dans Vercel.

## Flux de paiement
Front : clic « Débloquer » (case CGV obligatoire) → `/api/checkout` → `S.pendingCheckout = id` (localStorage) → redirection SumUp → retour sur `SITE_URL/?paiement=ok#pistes` → `verifyReturn()` appelle `/api/verify` → `S.paid = true`, `S.token` stocké.

## État côté client
Tout l'état est dans `localStorage` sous la clé `boussole-business-v1` (objet `S` : `birth`, `ans`, `chart`, `offer`, `experts`, `email`, `paid`, `token`). `S.example = true` affiche le profil fictif « Camille » à l'ouverture.

## À faire / pistes
- Tester les vrais appels SumUp et Brevo (prix à 1 € via `PRICE_EUR`), vérifier la forme exacte des réponses SumUp.
- Ajouter un webhook SumUp pour confirmer les paiements côté serveur.
- Limiter le nombre d'appels IA par jeton (ex. Vercel KV / Upstash) et protéger `/api/send-email` type `carte` contre les abus (rate limit, captcha).
- Accès multi-appareils : retrouver l'accès par e-mail (lien magique).
- Valider le calcul de charte sur plusieurs dates contre un calculateur de référence (précision ~1 minute d'arc ; le nœud lunaire utilise une approximation du nœud vrai).

## Conventions
- Textes en français, tutoiement, ton chaleureux et concret. Le Human Design est toujours présenté comme une grille de réflexion, jamais comme une science.
- Ne jamais utiliser l'expression « bilan de compétences » (prestation réglementée en France).
