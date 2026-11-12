# Ma Boussole Business : mise en ligne sur Vercel

Ce dossier contient tout le site, prêt à être publié :

| Élément | Rôle |
| --- | --- |
| `public/index.html` | La page de vente et l'outil complet (charte, bilan, pistes, comité, récap) |
| `public/mentions-legales.html`, `cgv.html`, `confidentialite.html` | Les 3 pages légales, à compléter |
| `api/checkout.js` | Crée la page de paiement SumUp |
| `api/verify.js` | Vérifie le paiement auprès de SumUp et débloque l'accès |
| `api/claude.js` | Relais vers l'IA Claude (idées sur mesure et comité d'experts), réservé aux clients |
| `api/send-email.js` | Envoie le profil gratuit et le récap avec Brevo, enregistre les prospects dans Supabase |
| `api/sumup-webhook.js` | Reçoit la confirmation de paiement de SumUp, même si la cliente ferme la page |
| `api/restore.js` | « Déjà acheté ? » : renvoie le lien d'accès par e-mail |
| `supabase/migrations/…sql` | Les tables de la base Supabase (prospects, paiements) |
| `.env.example` | La liste des clés à renseigner dans Vercel |

Compte environ 2 heures pour tout faire, sans écrire de code.

---

## Étape 1 : préparer les comptes (30 min)

**SumUp (paiement)**
1. Connecte-toi à ton compte SumUp et note ton **code marchand** (il commence par M, visible dans ton profil).
2. Dans **Développeurs → Clés API**, crée une clé secrète (elle commence par `sup_sk_`). Garde-la précieusement.
3. Vérifie que les paiements en ligne sont activés sur ton compte. Si la création de paiement échoue, contacte le support SumUp pour activer le « Hosted Checkout ».

**Brevo (e-mails)**
1. Crée un compte sur brevo.com.
2. Dans **Expéditeurs, domaines et IP dédiées**, ajoute ton adresse d'envoi (par exemple bonjour@ton-domaine.fr) et **authentifie ton domaine** : sans cela, tes e-mails finiront en courrier indésirable.
3. Dans **Contacts → Listes**, crée deux listes : « Prospects » et « Clients ». Note leur numéro (ID).
4. Dans **Contacts → Paramètres → Attributs**, vérifie que l'attribut `PRENOM` existe.
5. Dans **SMTP & API → Clés API**, crée une clé (elle commence par `xkeysib-`).

**Claude (IA)**
1. Crée un compte sur console.anthropic.com et ajoute un moyen de paiement.
2. Crée une clé API (elle commence par `sk-ant-`).
3. Fixe une **limite de dépense mensuelle** dans les paramètres, pour éviter toute surprise.

**Supabase (base de données)**
1. Ouvre ton projet sur supabase.com (ou crée-en un).
2. Va dans **SQL Editor → New query**, colle tout le contenu de `supabase/migrations/20261030_boussole.sql`, puis clique sur **Run**.
3. Dans **Project Settings → API**, note l'**URL du projet** et la clé **service_role** (secrète : elle ne va que dans Vercel).
4. Pour suivre tes chiffres : **Table Editor** → `boussole_leads` (prospects), `boussole_purchases` (paiements), ou la vue `boussole_stats`.

## Étape 2 : mettre le dossier sur GitHub (15 min)

1. Crée un compte gratuit sur github.com.
2. Crée un nouveau dépôt **privé**, nommé par exemple `ma-boussole-business`.
3. Clique sur **uploading an existing file** et glisse tout le contenu de ce dossier (les dossiers `public`, `api`, `lib` et le fichier `package.json`).

## Étape 3 : publier sur Vercel (15 min)

1. Sur vercel.com, connecte-toi avec ton compte GitHub.
2. **Add New → Project**, choisis ton dépôt, laisse « Framework Preset » sur **Other**, puis clique sur **Deploy**.
3. Va dans **Settings → Environment Variables** et ajoute chaque ligne de `.env.example` avec tes vraies valeurs :
   - `SITE_URL` : l'adresse de ton site (au début, celle donnée par Vercel, par exemple https://ma-boussole-business.vercel.app).
   - `TOKEN_SECRET` : une longue phrase au hasard que tu ne communiques à personne.
   - `PRICE_EUR` : **mets 1 pour ton premier test**.
   - Les clés SumUp, Brevo, Claude et Supabase, et les numéros de tes listes Brevo.
4. Va dans **Deployments**, clique sur les trois points du dernier déploiement, puis **Redeploy** pour prendre en compte les clés.

## Étape 4 : ton nom de domaine (15 min)

1. Achète ton domaine (OVH, Gandi, Ionos… environ 10 € par an).
2. Dans Vercel, **Settings → Domains**, ajoute-le et suis les indications pour modifier les DNS chez ton registraire.
3. Mets à jour `SITE_URL` avec ce nouveau domaine, puis redéploie.

## Étape 5 : compléter les pages légales (20 min)

Ouvre les 3 fichiers légaux dans `public/` (directement sur GitHub, avec le crayon « Edit ») et remplace tout ce qui est entre crochets et surligné : nom, adresse, SIRET, e-mail, date, médiateur de la consommation.

- **SIRET** : il te faut un statut. La micro-entreprise se crée gratuitement sur formalites.entreprise.gouv.fr.
- **Médiateur** : l'adhésion à un médiateur de la consommation est obligatoire pour vendre à des particuliers (comptes quelques dizaines d'euros par an).
- Ces modèles couvrent les points habituels, mais fais-les relire par un juriste si tu as un doute.

## Étape 6 : tester avant d'ouvrir (20 min)

Avec `PRICE_EUR=1` :
1. Calcule une charte et demande la carte par e-mail : elle doit arriver, et le contact apparaître dans Brevo.
2. Remplis le bilan, coche la case des CGV et paie 1 € avec ta propre carte.
3. Au retour sur le site, les pistes, le comité et le récap doivent être débloqués.
4. Lance le comité d'experts, puis envoie-toi le récap par e-mail.
5. Rembourse-toi le test depuis SumUp, remets `PRICE_EUR=46` et redéploie.

En cas de problème, Vercel affiche les erreurs dans **Logs** : copie-les-moi et je t'aide à corriger.

---

## Bon à savoir

- **Coût par client** : un paiement SumUp en ligne prélève une commission (voir leurs tarifs), et une analyse complète du comité consomme quelques centimes à quelques dizaines de centimes d'API Claude. La limite de dépense protège ton budget.
- **Accès sur un autre appareil** : après le paiement, la cliente reçoit un e-mail avec son lien d'accès personnel, valable sur tous ses appareils. Elle peut le redemander avec « Déjà acheté ? » dans l'encadré de paiement.
- **Sécurité** : les idées par IA et l'envoi du récap ne fonctionnent qu'avec un paiement vérifié par SumUp. Les 4 pistes classiques sont calculées dans la page : une personne très technique pourrait les afficher sans payer, ce qui reste marginal.
- **Modifier le prix affiché** : dans `public/index.html`, cherche `const PRICE = '46 €'`. Pense à changer aussi `PRICE_EUR` dans Vercel et le prix dans les CGV.
