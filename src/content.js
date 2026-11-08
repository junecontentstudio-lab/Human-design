const TYPES = {
  generator: { name: 'Générateur', strat: 'Répondre à ce qui se présente', sig: 'Satisfaction', ns: 'Frustration',
    desc: "Tu as une énergie de travail durable, faite pour les activités qui t'allument vraiment. Quand tu fais ce que tu aimes, tu peux le faire longtemps et devenir excellent.",
    biz: "Construis ton activité autour d'un savoir-faire que tu adores pratiquer. Les offres récurrentes (abonnements, clients réguliers) te conviennent. Laisse venir les opportunités et teste-les par ta réponse instinctive." },
  mg: { name: 'Générateur-Manifesteur', strat: 'Répondre, puis informer', sig: 'Satisfaction', ns: 'Frustration et colère',
    desc: "Tu as l'énergie durable du Générateur et la rapidité du Manifesteur. Tu avances vite, tu sautes des étapes et tu mènes plusieurs projets de front.",
    biz: "Un business à plusieurs facettes te va bien : plusieurs offres, des lancements courts, des tests rapides. Préviens tes clients et tes proches avant de changer de cap." },
  projector: { name: 'Projecteur', strat: "Attendre l'invitation", sig: 'Succès', ns: 'Amertume',
    desc: "Tu es fait pour guider : tu vois les personnes et les systèmes avec justesse. Ton énergie n'est pas faite pour travailler en continu ; tu donnes le meilleur en peu d'heures, quand on reconnaît ton talent.",
    biz: "Vends ton regard : conseil, coaching, audit, stratégie. Mise sur peu de clients bien accompagnés, et sur du contenu qui montre ton expertise pour être invité." },
  manifestor: { name: 'Manifesteur', strat: "Informer avant d'agir", sig: 'Paix', ns: 'Colère',
    desc: "Tu es là pour initier. Tu as des impulsions fortes et la capacité de lancer des choses que d'autres feront ensuite vivre.",
    biz: "Lance des concepts, des marques ou des projets, puis délègue l'exécution. Travaille par cycles : impulsion intense, puis repos. Annonce tes projets pour réduire les résistances." },
  reflector: { name: 'Réflecteur', strat: 'Attendre un cycle lunaire', sig: 'Surprise', ns: 'Déception',
    desc: "Tu es le miroir de ton environnement. Très rare (environ 1 % des personnes), tu ressens la santé d'un groupe ou d'un lieu.",
    biz: "Les rôles d'évaluation, de curation et d'animation de communauté te conviennent. Choisis ton environnement avec soin et prends environ 28 jours avant une grande décision." }
};

const AUTH = {
  emotional: ['Émotionnelle', "Ne décide jamais à chaud. Laisse passer la vague émotionnelle et attends une clarté calme, parfois après plusieurs jours."],
  sacral: ['Sacrale', "Ta réponse instinctive, dans l'instant, est fiable. Pose-toi des questions fermées et écoute ton corps dire oui ou non."],
  splenic: ['Splénique', "Ton intuition parle une seule fois, doucement, dans l'instant. Si quelque chose te semble juste ou risqué tout de suite, écoute-le."],
  ego: ['Ego (cœur)', "Demande-toi : est-ce que j'en ai vraiment envie ? Est-ce que je veux m'engager ? Ta volonté sincère est ta boussole."],
  self: ['Auto-projetée', "Parle de ta décision à voix haute à une personne de confiance. En t'entendant, tu sais ce qui est juste pour toi."],
  mental: ['Environnementale', "Discute de tes options avec plusieurs personnes de confiance, dans des lieux où tu te sens bien. La clarté vient en t'entendant réfléchir."],
  lunar: ['Lunaire', "Laisse passer un cycle lunaire complet (environ 28 jours) avant une grande décision, en en parlant autour de toi."]
};

const LINES = {
  1: ['Chercheur', "Tu vends par la profondeur : approfondis un sujet jusqu'à en devenir la référence."],
  2: ['Ermite', "Tes talents naturels se repèrent de l'extérieur : laisse-toi appeler et protège tes temps seul·e."],
  3: ['Expérimentateur', "Tu apprends en testant : raconte tes essais et tes échecs, c'est ton meilleur contenu."],
  4: ['Opportuniste', "Tes clients viennent de ton réseau : entretiens tes relations, le bouche-à-oreille est ton canal n°1."],
  5: ['Hérétique', "On attend de toi des solutions : propose des méthodes pratiques, simples à appliquer."],
  6: ['Modèle', "Ton autorité grandit avec l'expérience : incarne ce que tu transmets et vise le long terme."]
};

const DEFS = { none: 'Aucune définition', single: 'Définition simple', split: 'Définition partagée', triple: 'Triple définition', quadruple: 'Quadruple définition' };

const CENTER_TXT = {
  head: ['Tête', "Tu as une source d'inspiration constante et des questions qui t'animent.", "Tu captes les idées des autres ; ne cours pas après toutes les questions."],
  ajna: ['Ajna', "Ta façon de penser est fiable et constante.", "Ta pensée est souple ; tu n'as pas besoin de certitudes sur tout."],
  throat: ['Gorge', "Ta manière de t'exprimer est constante et reconnaissable.", "Tu t'adaptes à ton public ; inutile de forcer l'attention."],
  g: ['G (identité)', "Tu as un sens stable de qui tu es et d'où tu vas.", "Ton identité évolue selon les lieux et les gens : choisis bien ton environnement."],
  heart: ['Cœur', "Ta volonté est fiable : tu peux tenir tes engagements.", "Tu n'as rien à prouver ; évite les promesses faites pour te sentir à la hauteur."],
  sacral: ['Sacral', "Tu disposes d'une énergie de travail durable.", "Ton énergie n'est pas faite pour le travail continu : arrête-toi avant l'épuisement."],
  solar: ['Plexus solaire', "Tu vis des vagues émotionnelles ; ta clarté vient avec le temps.", "Tu ressens fort les émotions des autres ; ne les prends pas pour les tiennes."],
  spleen: ['Rate', "Tu as une intuition et un instinct fiables.", "Tu peux t'accrocher à ce qui ne te fait plus de bien : ose lâcher."],
  root: ['Racine', "Tu gères la pression de façon stable.", "Tu ressens la pression ambiante : ne te précipite pas pour t'en libérer."]
};

const CHANNEL_TXT = {
  '64-47': ['Abstraction', "donner du sens au passé, transformer l'expérience en enseignement"],
  '61-24': ['Conscience', 'penser en profondeur, trouver des idées originales'],
  '63-4': ['Logique', 'analyser, questionner, trouver des solutions fiables'],
  '17-62': ['Acceptation', 'organiser les idées, expliquer avec clarté'],
  '43-23': ['Structuration', 'traduire des intuitions nouvelles en mots simples'],
  '11-56': ['Curiosité', 'raconter des histoires, transmettre des idées qui inspirent'],
  '16-48': ['Longueur d\'onde', 'développer une maîtrise par la pratique répétée'],
  '20-57': ['Onde cérébrale', 'sentir juste dans l\'instant, conseiller avec intuition'],
  '20-10': ['Éveil', 'incarner ses convictions, inspirer par l\'exemple'],
  '20-34': ['Charisme', 'agir vite et seul·e, transformer l\'idée en action'],
  '31-7': ['Alpha', 'diriger, être la voix d\'un groupe'],
  '8-1': ['Inspiration', 'créer de façon originale et montrer une autre voie'],
  '33-13': ['Prodigue', 'écouter, garder la mémoire, raconter des parcours'],
  '45-21': ['Argent', 'gérer des ressources, piloter un business'],
  '35-36': ['Transitoire', 'vivre des expériences variées et les partager'],
  '12-22': ['Ouverture', 'toucher par les mots, l\'art et la présence'],
  '10-34': ['Exploration', 'suivre ses convictions et avancer à sa façon'],
  '10-57': ['Forme parfaite', 'sentir ce qui est juste, soigner les détails'],
  '15-5': ['Rythme', 'installer des routines et des cycles durables'],
  '2-14': ['Battement', 'trouver sa direction et générer des ressources'],
  '46-29': ['Découverte', 's\'engager à fond et réussir par la persévérance'],
  '25-51': ['Initiation', 'oser, se lancer en premier, initier les autres'],
  '26-44': ['Reddition', 'vendre, marketer, transmettre ce qui marche'],
  '40-37': ['Communauté', 'créer des accords, fédérer une communauté fidèle'],
  '27-50': ['Préservation', 'prendre soin, protéger, accompagner'],
  '59-6': ['Intimité', 'créer des liens profonds et durables'],
  '34-57': ['Puissance', 'réagir vite avec instinct'],
  '3-60': ['Mutation', 'innover, apporter du neuf au bon moment'],
  '42-53': ['Maturation', 'démarrer des cycles et les mener à terme'],
  '9-52': ['Concentration', 'se focaliser longtemps, travailler en détail'],
  '18-58': ['Jugement', 'améliorer, corriger, perfectionner'],
  '28-38': ['Lutte', 'trouver du sens dans les défis, persévérer'],
  '32-54': ['Transformation', 'avoir de l\'ambition, faire grandir un projet'],
  '19-49': ['Synthèse', 'sentir les besoins des autres, créer des règles justes'],
  '39-55': ['Émotion', 'créer avec l\'humeur, toucher par l\'émotion'],
  '41-30': ['Reconnaissance', 'rêver grand et vivre des expériences intenses']
};

const RIASEC = {
  R: ['Réaliste', 'Concret, manuel, tangible'], I: ['Investigateur', 'Comprendre, analyser'], A: ['Artistique', 'Créer, exprimer'],
  S: ['Social', 'Aider, transmettre'], E: ['Entreprenant', 'Convaincre, lancer'], C: ['Conventionnel', 'Organiser, structurer']
};
const RIASEC_Q = [
  ['R', 'Fabriquer, réparer ou assembler des objets de mes mains'], ['R', 'Travailler en extérieur, avec la nature ou les animaux'], ['R', 'Utiliser des outils, des machines ou du matériel technique'], ['R', 'Voir un résultat concret à la fin de ma journée'], ['R', 'Cuisiner, bricoler, rénover, construire'],
  ['I', 'Comprendre comment les choses fonctionnent en profondeur'], ['I', 'Analyser des données ou des problèmes complexes'], ['I', 'Faire des recherches, enquêter sur un sujet'], ['I', 'Résoudre des énigmes ou des problèmes logiques'], ['I', 'Apprendre une nouvelle discipline scientifique ou technique'],
  ['A', 'Créer quelque chose d\'original : texte, image, musique, objet'], ['A', 'Décorer, aménager, choisir des couleurs et des styles'], ['A', 'M\'exprimer librement, sans cadre imposé'], ['A', 'Raconter des histoires ou partager mes idées en public'], ['A', 'Imaginer des concepts, des univers, des marques'],
  ['S', 'Écouter, conseiller ou soutenir quelqu\'un'], ['S', 'Enseigner, transmettre, expliquer'], ['S', 'Prendre soin du bien-être des autres'], ['S', 'Animer un groupe, créer du lien'], ['S', 'Aider quelqu\'un à progresser ou à se transformer'],
  ['E', 'Convaincre, négocier, vendre une idée ou un produit'], ['E', 'Prendre des décisions et assumer des responsabilités'], ['E', 'Lancer de nouveaux projets, prendre des initiatives'], ['E', 'Diriger une équipe, fédérer autour d\'un objectif'], ['E', 'Repérer des opportunités et gagner de l\'argent avec'],
  ['C', 'Organiser, classer, planifier, structurer'], ['C', 'Gérer des budgets, des chiffres, des tableaux'], ['C', 'Suivre une méthode claire, avec précision'], ['C', 'Mettre de l\'ordre dans le chaos (process, outils)'], ['C', 'Vérifier, contrôler, assurer la qualité']
];

const SKILLS = [
  ['Communication', [['ecrire', 'Écrire des textes clairs'], ['oral', 'Parler en public ou en vidéo'], ['reseaux', 'Animer des réseaux sociaux'], ['langues', 'Langues étrangères']]],
  ['Relation', [['conseil', 'Écouter et conseiller'], ['former', 'Former, enseigner'], ['vendre', 'Vendre, négocier'], ['conflits', 'Gérer des conflits']]],
  ['Création', [['design', 'Design graphique, visuel'], ['photo', 'Photo, vidéo'], ['manuel', 'Artisanat, travail manuel'], ['cuisine', 'Cuisine']]],
  ['Organisation', [['projet', 'Gestion de projet'], ['admin', 'Administratif, gestion'], ['finance', 'Finances, chiffres'], ['event', 'Événementiel']]],
  ['Technique', [['digital', 'Outils numériques'], ['nocode', 'Création de site, no-code'], ['data', 'Analyse de données'], ['bricolage', 'Bricolage, technique']]],
  ['Expertise', [['sante', 'Santé, bien-être, sport'], ['expertise', 'Un domaine métier pointu']]]
];
const SKILL_LEVELS = ['Aucune', 'Notions', 'À l\'aise', 'On me demande'];

const VALUES = [['liberte', 'Liberté'], ['securite', 'Sécurité financière'], ['impact', 'Impact positif'], ['creativite', 'Créativité'], ['reconnaissance', 'Reconnaissance'], ['apprentissage', 'Apprentissage'], ['famille', 'Famille et temps libre'], ['aventure', 'Aventure et nouveauté'], ['transmission', 'Transmission'], ['excellence', 'Excellence'], ['lien', 'Lien humain'], ['independance', 'Indépendance'], ['justice', 'Justice'], ['beaute', 'Beauté, esthétique'], ['spiritualite', 'Spiritualité']];

const STYLE_Q = [
  ['Je préfère travailler', 'Seul·e', 'Avec d\'autres'],
  ['Je suis plus à l\'aise pour', 'Lancer les choses', 'Les faire durer'],
  ['Mon énergie au travail est', 'Régulière', 'Par vagues'],
  ['Je décide mieux', 'Sur le moment', 'Avec du recul'],
  ['Je trouve mes opportunités', 'En allant les chercher', 'Quand on vient me chercher'],
  ['Je préfère être', 'Expert·e d\'un domaine', 'Touche-à-tout'],
  ['Je me sens mieux', 'En face-à-face', 'Derrière un écran'],
  ['Je préfère vendre', 'Mon temps (prestations)', 'Un produit fait une fois']
];

const CONSTRAINTS = [
  ['time', 'Temps disponible par semaine', ['Moins de 5 h', '5 à 10 h', '10 à 20 h', 'Temps plein']],
  ['budget', 'Budget de départ', ['0 €', 'Moins de 500 €', '500 à 3 000 €', '3 000 à 10 000 €', 'Plus de 10 000 €']],
  ['revenue', 'Besoin d\'un revenu', ['Immédiatement', 'Sous 6 mois', 'Sous 1 an', 'Pas de pression']],
  ['risk', 'Rapport au risque', ['Prudent·e, je garde mon emploi', 'Risque mesuré', 'Prêt·e à tout miser']],
  ['place', 'Ton projet doit être', ['100 % en ligne', 'Local, près de chez moi', 'Les deux me vont']]
];

const OPEN_Q = [
  ['passions', 'Sur quels sujets pourrais-tu parler pendant des heures ?'],
  ['flow', 'Quelles activités te font perdre la notion du temps ?'],
  ['help', 'Pour quoi les gens viennent-ils naturellement te demander de l\'aide ?'],
  ['problem', 'Quel problème du monde ou de ton entourage te touche le plus ?']
];

// t, d, r(iasec), s(kills), v(alues), b(udget min idx), f(ast revenue), a(sync ok), l(oc), m(odel), step, price
const IDEAS = [
  ['Coaching individuel sur ta thématique', 'Accompagner des personnes une à une vers un résultat précis, en visio ou en présentiel.', 'SE', ['conseil', 'oral'], ['impact', 'lien', 'transmission'], 0, 1, 0, 'both', 'conseil', 'Propose 3 séances découverte gratuites à ton entourage et demande un retour écrit.', '60 à 150 € la séance'],
  ['Formation en ligne', 'Transformer ce que tu sais en programme vidéo que les gens suivent à leur rythme.', 'SIA', ['former', 'ecrire', 'digital'], ['transmission', 'liberte', 'apprentissage'], 1, 0, 1, 'online', 'produit', 'Liste les 10 questions qu\'on te pose le plus et transforme-les en plan de modules.', '97 à 497 €'],
  ['Ateliers en présentiel', 'Animer des ateliers pratiques en petit groupe, dans un lieu partenaire.', 'SAE', ['former', 'oral', 'event'], ['lien', 'transmission'], 1, 1, 0, 'local', 'service', 'Organise un premier atelier test pour 6 personnes dans un lieu prêté.', '25 à 60 € par participant'],
  ['Média de niche sur les réseaux', 'Créer du contenu régulier sur ton sujet et le monétiser par partenariats et produits.', 'AE', ['ecrire', 'oral', 'reseaux', 'photo'], ['creativite', 'liberte', 'reconnaissance'], 0, 0, 1, 'online', 'contenu', 'Publie 5 contenus en 7 jours sur un même sujet et note ceux qui font réagir.', 'Partenariats, affiliation, produits'],
  ['Community manager freelance', 'Gérer les réseaux sociaux de petites entreprises et commerçants.', 'AEC', ['reseaux', 'ecrire', 'design'], ['liberte', 'creativite', 'independance'], 0, 1, 0, 'online', 'service', 'Propose un audit gratuit des réseaux de 3 commerçants de ta ville.', '300 à 900 € par mois et par client'],
  ['Graphiste et identité visuelle', 'Créer logos, chartes et supports pour des marques qui démarrent.', 'AR', ['design', 'digital'], ['creativite', 'beaute', 'independance'], 1, 1, 0, 'online', 'service', 'Crée 3 projets fictifs pour ton portfolio et partage-les.', '400 à 2 000 € par identité'],
  ['Photographe de marque', 'Réaliser des portraits et photos professionnelles pour entrepreneurs.', 'ARS', ['photo', 'design'], ['creativite', 'beaute', 'lien'], 2, 1, 0, 'local', 'service', 'Propose une séance portrait gratuite à 3 entrepreneurs contre un témoignage.', '150 à 600 € la séance'],
  ['Rédaction web et copywriting', 'Écrire des pages de vente, articles et e-mails qui convertissent.', 'AIC', ['ecrire', 'digital'], ['liberte', 'independance', 'excellence'], 0, 1, 1, 'online', 'service', 'Réécris la page d\'accueil d\'un entrepreneur que tu suis et envoie-la-lui.', '300 à 800 € la page'],
  ['Assistante virtuelle', 'Prendre en charge l\'administratif et l\'organisation d\'entrepreneurs débordés.', 'CS', ['admin', 'projet', 'digital'], ['securite', 'liberte', 'lien'], 0, 1, 0, 'online', 'service', 'Liste 5 entrepreneurs débordés de ton réseau et propose 5 h d\'essai.', '25 à 45 € de l\'heure'],
  ['Consultante en organisation', 'Aider les petites entreprises à simplifier leurs process et leurs outils.', 'CIE', ['projet', 'admin', 'data', 'nocode'], ['excellence', 'impact'], 0, 1, 0, 'both', 'conseil', 'Fais l\'audit gratuit d\'une petite entreprise et chiffre les gains possibles.', '500 à 3 000 € la mission'],
  ['Création de sites no-code', 'Construire des sites simples et beaux pour indépendants et associations.', 'RIA', ['nocode', 'digital', 'design'], ['liberte', 'creativite'], 1, 1, 0, 'online', 'service', 'Construis un site pour une association locale contre une recommandation.', '800 à 3 000 € le site'],
  ['Boutique de créations artisanales', 'Fabriquer et vendre tes créations en ligne et sur les marchés.', 'RAE', ['manuel', 'photo', 'vendre'], ['creativite', 'beaute', 'liberte'], 2, 0, 1, 'both', 'commerce', 'Fabrique 10 pièces et teste-les sur un marché ou une boutique en ligne.', 'Marge de 40 à 70 %'],
  ['Traiteur ou cours de cuisine', 'Cuisiner pour des événements ou transmettre tes recettes en atelier.', 'RSA', ['cuisine', 'event'], ['lien', 'creativite'], 2, 1, 0, 'local', 'service', 'Cuisine un repas pour 8 personnes à prix coûtant et récolte les avis.', '15 à 40 € par personne'],
  ['Praticienne bien-être', 'Proposer massages, yoga, sophrologie ou autre pratique de soin, après formation.', 'SR', ['sante', 'conseil'], ['impact', 'spiritualite', 'lien'], 2, 0, 0, 'local', 'service', 'Compare 2 formations certifiantes et fais 5 séances bénévoles.', '50 à 90 € la séance'],
  ['Coach sportif ou bien-être en ligne', 'Accompagner des personnes dans leur forme, en groupe ou en individuel.', 'SRE', ['sante', 'oral', 'reseaux'], ['impact', 'liberte'], 1, 1, 0, 'both', 'service', 'Lance un défi gratuit de 7 jours avec 10 participants.', '30 € par mois en groupe, 60 € en individuel'],
  ['Conseil dans ton ancien métier', 'Vendre ton expertise métier en missions ponctuelles.', 'IEC', ['expertise', 'conseil', 'oral'], ['independance', 'securite', 'excellence'], 0, 1, 0, 'both', 'conseil', 'Contacte 5 anciens collègues ou clients pour proposer une mission ponctuelle.', '400 à 900 € la journée'],
  ['Analyste de données freelance', 'Créer tableaux de bord et analyses pour aider les entreprises à décider.', 'IC', ['data', 'digital', 'finance'], ['apprentissage', 'excellence', 'liberte'], 0, 1, 1, 'online', 'service', 'Réalise un tableau de bord gratuit pour une petite entreprise.', '350 à 700 € la journée'],
  ['Gestion administrative pour indépendants', 'Aider les indépendants à suivre leurs factures, relances et budget.', 'CI', ['finance', 'admin'], ['securite', 'excellence'], 0, 1, 1, 'online', 'service', 'Propose ton aide à 3 indépendants de ton entourage pendant un mois.', '50 à 200 € par mois et par client'],
  ['Organisatrice d\'événements', 'Concevoir et coordonner des événements privés ou professionnels.', 'ESC', ['event', 'projet', 'vendre'], ['lien', 'aventure'], 1, 1, 0, 'local', 'service', 'Organise un petit événement réseau et calcule ce qu\'il t\'aurait rapporté.', '500 à 3 000 € par événement'],
  ['Apporteuse d\'affaires', 'Mettre en relation des clients et des prestataires contre commission.', 'E', ['vendre', 'oral', 'conflits'], ['liberte', 'reconnaissance', 'independance'], 0, 1, 0, 'both', 'commerce', 'Choisis un prestataire que tu admires et propose-lui de lui apporter des clients.', '10 à 20 % de commission'],
  ['Communauté payante', 'Rassembler des personnes autour d\'un thème avec rencontres, contenus et entraide.', 'SEA', ['reseaux', 'oral', 'event'], ['lien', 'transmission', 'impact'], 0, 0, 1, 'online', 'communaute', 'Crée un groupe gratuit sur ton thème et anime-le pendant 4 semaines.', '15 à 49 € par mois'],
  ['Produits numériques', 'Vendre des modèles, guides ou planners utiles à ton public.', 'AC', ['design', 'ecrire', 'digital'], ['liberte', 'creativite'], 0, 0, 1, 'online', 'produit', 'Crée un premier modèle utile à ton public et vends-le à petit prix.', '9 à 49 € l\'unité'],
  ['Rénovation et home staging', 'Relooker des intérieurs pour des particuliers ou avant une vente.', 'RA', ['bricolage', 'design', 'manuel'], ['beaute', 'creativite'], 2, 1, 0, 'local', 'service', 'Relooke une pièce chez un proche et fais des photos avant/après.', '300 à 2 000 € par projet'],
  ['Jardinage et permaculture', 'Entretenir, aménager ou concevoir des jardins nourriciers.', 'RI', ['bricolage', 'manuel'], ['liberte', 'impact'], 2, 1, 0, 'local', 'service', 'Propose l\'entretien de 3 jardins voisins pendant un mois.', '25 à 40 € de l\'heure'],
  ['Cours particuliers', 'Accompagner élèves ou adultes dans une matière ou une langue.', 'SI', ['former', 'langues', 'expertise'], ['transmission', 'apprentissage'], 0, 1, 0, 'both', 'service', 'Publie une annonce sur 2 plateformes de soutien scolaire.', '20 à 50 € de l\'heure'],
  ['Traduction', 'Traduire sites, documents et contenus pour des entreprises.', 'IAC', ['langues', 'ecrire'], ['liberte', 'apprentissage', 'independance'], 0, 1, 1, 'online', 'service', 'Traduis bénévolement le site d\'une association pour ton portfolio.', '0,08 à 0,15 € le mot'],
  ['Podcast ou chaîne vidéo', 'Créer une émission régulière sur ton sujet et la monétiser.', 'AIS', ['oral', 'ecrire', 'photo'], ['creativite', 'reconnaissance', 'transmission'], 1, 0, 1, 'online', 'contenu', 'Enregistre 3 épisodes pilotes et fais-les écouter à 10 personnes de ta cible.', 'Sponsors, produits, affiliation'],
  ['Conseil en image et stylisme', 'Aider les personnes à trouver un style qui leur ressemble.', 'AS', ['design', 'conseil'], ['beaute', 'lien'], 1, 1, 0, 'both', 'service', 'Fais 3 relookings gratuits contre photos et témoignages.', '80 à 300 € la prestation'],
  ['Médiation et facilitation', 'Animer des réunions, résoudre des tensions dans les équipes et associations.', 'SE', ['conflits', 'oral', 'conseil'], ['justice', 'lien', 'impact'], 1, 1, 0, 'both', 'conseil', 'Propose d\'animer gratuitement une réunion difficile dans une association.', '600 à 1 500 € la journée'],
  ['Services aux animaux', 'Garde, promenade et soins pour les animaux de ton quartier.', 'RS', ['manuel'], ['lien', 'liberte'], 0, 1, 0, 'local', 'service', 'Propose tes services à 10 voisins via le panneau d\'affichage et les groupes locaux.', '15 à 30 € la visite']
];

const MODEL_LABEL = { service: 'Prestation', conseil: 'Conseil', produit: 'Produit numérique', contenu: 'Contenu', communaute: 'Communauté', commerce: 'Commerce' };

const BODY_LABELS = [['sun', '☉', 'Soleil'], ['earth', '⊕', 'Terre'], ['northNode', '☊', 'Nœud Nord'], ['southNode', '☋', 'Nœud Sud'], ['moon', '☽', 'Lune'], ['mercury', '☿', 'Mercure'], ['venus', '♀', 'Vénus'], ['mars', '♂', 'Mars'], ['jupiter', '♃', 'Jupiter'], ['saturn', '♄', 'Saturne'], ['uranus', '♅', 'Uranus'], ['neptune', '♆', 'Neptune'], ['pluto', '♇', 'Pluton']];

const ZONES = [['Europe/Paris', 'France, Belgique, Luxembourg, Monaco (Paris)'], ['Europe/Zurich', 'Suisse'], ['America/Toronto', 'Québec, Ontario'], ['Africa/Casablanca', 'Maroc'], ['Africa/Algiers', 'Algérie'], ['Africa/Tunis', 'Tunisie'], ['Africa/Dakar', 'Sénégal'], ['Africa/Abidjan', 'Côte d\'Ivoire'], ['Africa/Douala', 'Cameroun'], ['Africa/Kinshasa', 'RD Congo (Kinshasa)'], ['Indian/Reunion', 'La Réunion'], ['Indian/Mayotte', 'Mayotte'], ['America/Martinique', 'Martinique'], ['America/Guadeloupe', 'Guadeloupe'], ['America/Cayenne', 'Guyane'], ['Pacific/Noumea', 'Nouvelle-Calédonie'], ['Pacific/Tahiti', 'Tahiti'], ['Indian/Mauritius', 'Maurice'], ['Europe/London', 'Royaume-Uni'], ['Europe/Madrid', 'Espagne'], ['Europe/Lisbon', 'Portugal'], ['Europe/Rome', 'Italie'], ['Europe/Berlin', 'Allemagne'], ['America/New_York', 'États-Unis (Est)'], ['America/Los_Angeles', 'États-Unis (Ouest)'], ['UTC', 'Autre (heure UTC)']];

const TYPE_BIZ = {
  generator: ['Le bâtisseur passionné', "Ton énergie de travail est le moteur de ton business : inépuisable pour ce qui t'allume, elle s'éteint vite pour le reste. Un projet qui ne te passionne pas te mènera à la frustration, même s'il rapporte.", "Chaque mois, fais le tri : garde les tâches qui te donnent de l'élan, délègue ou supprime celles qui te frustrent.", "La frustration : signe que tu t'es engagé·e dans quelque chose qui ne t'allume pas."],
  mg: ["L'accélérateur multi-passions", "Tu es fait·e pour avancer vite et sur plusieurs fronts. Te forcer à un seul projet linéaire t'éteint ; ta force est de tester, d'ajuster et de combiner tes talents.", "Accepte d'avoir 2 ou 3 offres liées entre elles, et reviens sur les étapes que tu as sautées.", "La frustration ou la colère : souvent quand tu fonces sans avoir répondu à une vraie demande, ou sans prévenir."],
  projector: ['Le guide stratège', "Tu vois ce que les autres ne voient pas : c'est ta valeur. Mais ton énergie n'est pas constante, donc un business au volume ou aux longues heures t'épuise.", "Vends ta vision et ton expertise plutôt que ton temps, et garde des journées courtes avec du repos.", "L'amertume : signe que tu donnes des conseils sans être reconnu·e ni invité·e."],
  manifestor: ["L'initiateur", "Tu as la capacité rare de démarrer des choses seul·e. Ton business doit te laisser la liberté d'agir et d'initier, sinon tu étouffes.", "Entoure-toi de personnes qui feront vivre ce que tu lances, et préviens avant chaque grand changement.", "La colère : signe que l'on te freine, ou que tu as agi sans informer."],
  reflector: ['Le miroir révélateur', "Ta sensibilité à l'environnement fait de toi un excellent évaluateur des personnes et des lieux. Ton business dépend beaucoup de l'entourage que tu choisis.", "Teste ton activité dans plusieurs environnements et garde celui où tu te sens le mieux.", "La déception : signe que tu es dans un environnement qui ne te correspond pas."]
};
const STRAT_BIZ = {
  generator: ["Ne cours pas après les clients. Rends-toi visible (contenu, réseau, offre claire), puis réponds aux demandes qui te font vibrer : ton oui instinctif est ton filtre.", "Crée ton offre en réponse aux questions réelles qu'on te pose, pas à partir d'une idée dans ta tête."],
  mg: ["Réponds aux opportunités qui t'allument, puis annonce vite à ton public ce que tu lances. Tu peux tester plusieurs canaux en même temps.", "Fais une version simple, vends-la vite, améliore-la ensuite."],
  projector: ["Ton marketing doit créer des invitations : partage ton regard, tes analyses, des études de cas. Les clients qui viennent te chercher reconnaissent déjà ta valeur.", "Propose d'abord ton offre aux personnes qui t'ont déjà demandé conseil."],
  manifestor: ["Annonce ce que tu vas faire avant de le faire : ton audience et tes partenaires te suivront plus facilement. Tu peux aller chercher les opportunités toi-même.", "Annonce ton offre, lance-la, puis passe le relais pour l'exécution."],
  reflector: ["Prends le temps d'observer : les bonnes opportunités se révèlent sur la durée. Appuie-toi sur un réseau choisi avec soin.", "Teste ton offre auprès d'un petit groupe et laisse passer un cycle lunaire avant de la lancer en grand."]
};
const AUTH_BIZ = {
  emotional: "Pour un prix, un client ou un partenariat, dors dessus, plusieurs nuits si besoin. Ne signe jamais dans l'enthousiasme ni dans la déception du moment.",
  sacral: "Pose-toi des questions fermées : « Est-ce que je veux travailler avec ce client ? ». Un oui franc du corps : vas-y. Un « hum » hésitant : c'est non.",
  splenic: "Ton premier ressenti face à un client ou une opportunité est le bon. Si quelque chose sonne faux dès le départ, ne cherche pas à te convaincre du contraire.",
  ego: "Ne t'engage que sur ce que tu veux vraiment et peux tenir. Fixe tes prix selon ta vraie valeur, et ne gaspille pas ta volonté sur des projets qui ne t'intéressent pas.",
  self: "Avant de lancer une offre ou de valider un prix, explique-le à voix haute à une personne de confiance : ce que tu t'entends dire te montre ce qui est juste.",
  mental: "Crée un petit cercle de personnes de confiance pour réfléchir à voix haute à tes décisions business. Change de lieu si tu n'arrives pas à trancher.",
  lunar: "Pour toute grande décision (lancement, investissement, associé), laisse passer environ 28 jours en en parlant autour de toi."
};
const LINE_BIZ = {
  1: "Montre que tu maîtrises ton sujet : contenus de fond, méthode, sources. Tes clients achètent ta solidité.",
  2: "Laisse ton talent parler, on te remarque sans que tu forces. Garde des temps seul·e pour créer et accepte qu'on vienne te chercher.",
  3: "Partage tes essais, tes erreurs et ce que tu en as appris : ton authenticité attire. Tu as le droit de pivoter.",
  4: "Ton réseau est ton premier canal de vente : recommandations, partenariats, bouche-à-oreille. Entretiens tes relations.",
  5: "On vient vers toi pour des solutions : propose des offres pratiques au résultat clair, et soigne ta réputation.",
  6: "Inspire par l'exemple : montre ton parcours et ta vision à long terme. Ta crédibilité grandit avec les années."
};

// Quiz express gratuit (bloc 1) : 9 questions, une par écran. Les réponses alimentent un premier calcul des pistes.
// La première distingue les deux parcours d'entrée du dossier de recherche (docs/).
const QUIZ = [
  { k: 'path', t: 'Où en es-tu aujourd\'hui ?', type: 'one', opts: [
    ['idee', 'Je n\'ai pas encore d\'idée', 'Je veux explorer des pistes qui me ressemblent'],
    ['projet', 'J\'ai déjà un projet, mais je bloque', 'Je veux le confronter à mon profil et avancer']] },
  { k: 'pull', t: 'Un samedi libre, sans obligation. Tu choisis spontanément de…', type: 'one', opts: [
    ['R', 'Fabriquer, jardiner, bricoler', 'Voir un résultat concret de tes mains'],
    ['I', 'Lire, te documenter, comprendre', 'Creuser un sujet jusqu\'au fond'],
    ['A', 'Créer : écrire, dessiner, décorer', 'Exprimer quelque chose de toi'],
    ['S', 'Voir des proches, écouter, aider', 'Être utile à quelqu\'un'],
    ['E', 'Lancer un projet, organiser une sortie', 'Embarquer les autres dans ton idée'],
    ['C', 'Ranger, planifier, faire le point', 'Mettre de l\'ordre et repartir léger·e']] },
  { k: 'ask', t: 'Le plus souvent, on vient te demander…', type: 'one', opts: [
    ['R', 'Un coup de main concret', 'Réparer, installer, fabriquer'],
    ['I', 'Ton analyse', 'Comprendre un problème, trouver une solution'],
    ['A', 'Ton œil créatif', 'Une idée, un visuel, une ambiance'],
    ['S', 'Une oreille, un conseil', 'Y voir plus clair dans une situation'],
    ['E', 'De prendre les choses en main', 'Décider, convaincre, mener le groupe'],
    ['C', 'D\'organiser', 'Un planning, un budget, un dossier']] },
  { k: 'skills', t: 'Tes 3 super-pouvoirs', d: 'Choisis les 3 qui te ressemblent le plus.', type: 'multi', n: 3, opts: [
    ['conseil,oral', 'Écouter et conseiller'], ['former,ecrire', 'Expliquer, transmettre'], ['ecrire,reseaux', 'Écrire, raconter'],
    ['design,photo', 'Créer du beau'], ['manuel,cuisine,bricolage', 'Faire de mes mains'], ['projet,admin,event', 'Organiser, piloter'],
    ['vendre,oral', 'Convaincre, vendre'], ['digital,nocode,data', 'Le numérique, les outils'], ['sante', 'Santé, bien-être, sport'], ['expertise,finance', 'Un savoir métier pointu']] },
  { k: 'values', t: 'Ce qui compte le plus pour toi', d: 'Choisis 3 valeurs, de la plus importante à la moins importante.', type: 'multi', n: 3, opts: [
    ['liberte', 'Liberté'], ['securite', 'Sécurité financière'], ['impact', 'Impact positif'], ['creativite', 'Créativité'], ['lien', 'Lien humain'],
    ['transmission', 'Transmission'], ['famille', 'Famille et temps libre'], ['reconnaissance', 'Reconnaissance'], ['aventure', 'Aventure et nouveauté']] },
  { k: 'sell', t: 'Pour gagner ta vie, tu préfères…', d: 'Tu peux choisir les deux.', type: 'multi', n: 2, min: 1, opts: [
    ['a', 'Vendre ton temps et ta présence', 'Séances, prestations, accompagnement'],
    ['b', 'Créer une fois, vendre souvent', 'Formation, produit, contenu']] },
  { k: 'place', t: 'Ton projet idéal se vit…', type: 'one', opts: [
    ['0', '100 % en ligne', 'Depuis chez toi ou en voyage'], ['1', 'Près de chez toi', 'En face-à-face, dans ta ville'], ['2', 'Les deux me vont', 'Un mélange des deux']] },
  { k: 'time', t: 'Combien de temps peux-tu y consacrer chaque semaine ?', type: 'one', opts: [
    ['0', 'Moins de 5 h', 'À côté d\'un emploi bien rempli'], ['1', '5 à 10 h', 'Quelques soirées ou un jour off'], ['2', '10 à 20 h', 'Un vrai mi-temps'], ['3', 'Temps plein', 'C\'est mon projet principal']] },
  { k: 'revenue', t: 'Ce projet doit te rapporter…', type: 'one', opts: [
    ['0', 'Tout de suite', 'J\'ai besoin d\'un revenu rapidement'], ['1', 'Sous 6 mois', 'Je peux tenir un peu'], ['2', 'Sous 1 an', 'Je construis tranquillement'], ['3', 'Pas de pression', 'C\'est d\'abord un projet de cœur']] }
];

// Archétype d'entrepreneur·e : dominante d'intérêts du quiz, nuancée par le type Human Design.
const ARCHETYPES = {
  R: { short: 'Artisan·e', name: 'Artisan·e du concret', line: 'Tu transformes les idées en résultats que l\'on peut toucher.', forces: ['Le sens du travail bien fait', 'Des résultats visibles qui rassurent tes clients', 'Une crédibilité immédiate : on voit ce que tu sais faire'], biz: 'Les offres tangibles te vont : savoir-faire, fabrication, prestations techniques, ateliers pratiques.' },
  I: { short: 'Expert·e', name: 'Expert·e éclaireur·se', line: 'Tu comprends en profondeur et tu rends clair ce qui est compliqué.', forces: ['Une vraie profondeur sur ton sujet', 'La capacité de résoudre des problèmes difficiles', 'Une parole fiable, qu\'on a envie de suivre'], biz: 'Vends ta compréhension : audit, conseil, formation, contenus de fond, méthode.' },
  A: { short: 'Créatif·ve', name: 'Créatif·ve inspirant·e', line: 'Tu crées des choses qui touchent et qui donnent envie.', forces: ['Un univers à toi, reconnaissable', 'Le talent de rendre les choses belles et désirables', 'Une communication naturellement attirante'], biz: 'Ton univers est ton offre : création sur mesure, produits, contenus, ateliers créatifs.' },
  S: { short: 'Guide', name: 'Guide bienveillant·e', line: 'Tu aides les autres à avancer, et ils le sentent.', forces: ['Une écoute qui met en confiance', 'Le don de faire progresser les gens', 'Des clients fidèles qui te recommandent'], biz: 'L\'accompagnement est ton terrain : coaching, soin, formation, communauté.' },
  E: { short: 'Initiateur·rice', name: 'Initiateur·rice', line: 'Tu lances, tu fédères, tu fais bouger les choses.', forces: ['L\'audace de te lancer avant d\'être prêt·e', 'Le talent de convaincre et d\'embarquer', 'Une énergie qui crée des opportunités'], biz: 'Les projets à impulser te vont : événements, offres à fort enjeu, marque, communauté que tu animes.' },
  C: { short: 'Architecte', name: 'Architecte organisé·e', line: 'Tu mets de l\'ordre, et tout devient plus simple autour de toi.', forces: ['La rigueur qui rassure', 'Le talent de créer des méthodes et des systèmes', 'Une fiabilité rare, très recherchée'], biz: 'Vends de la clarté et du temps gagné : organisation, assistance, outils, méthodes clés en main.' }
};

// Questions réflexives (dossier de recherche, sections 2 à 5) : le Human Design inspire des questions, il ne donne pas de réponses.
const TYPE_Q = {
  generator: 'Quelles tâches te donnent envie de t\'investir durablement, au point de vouloir les recommencer ?',
  mg: 'Quel équilibre veux-tu entre variété, exploration et priorités ?',
  projector: 'Dans quelles situations peux-tu conseiller, observer ou structurer, et être reconnu·e pour cela ?',
  manifestor: 'Quel niveau d\'autonomie te faut-il pour te sentir libre d\'agir ?',
  reflector: 'Quel rôle jouent le cadre, les lieux, les équipes et les rythmes dans ton énergie ?'
};
const AUTH_Q = {
  emotional: 'Comment tes émotions influencent-elles tes grandes décisions ?',
  sacral: 'Quelles propositions suscitent chez toi un intérêt concret, immédiat ?',
  splenic: 'Comment repères-tu une situation qui ne te convient pas ?',
  ego: 'Que souhaites-tu réellement défendre ou entreprendre ?',
  self: 'Que découvres-tu en formulant ton choix à voix haute ?',
  mental: 'Avec qui et où réfléchis-tu le mieux ?',
  lunar: 'Que révèle une réflexion étalée sur plusieurs semaines ?'
};
const LINE_Q = {
  1: 'De quoi as-tu besoin de comprendre à fond avant de te sentir légitime ?',
  2: 'Quels talents les autres remarquent-ils chez toi, alors qu\'ils te semblent naturels ?',
  3: 'Qu\'as-tu appris de tes essais et de tes erreurs passés ?',
  4: 'Quelles personnes de ton réseau pourraient être tes premiers clients ou partenaires ?',
  5: 'Pour quels problèmes concrets vient-on te chercher ?',
  6: 'Quelle expérience as-tu envie de transmettre avec les années ?'
};
const CENTER_Q = {
  head: 'Quelles questions t\'intéressent spontanément ?', ajna: 'Comment apprends-tu et résous-tu les problèmes ?',
  throat: 'Comment préfères-tu communiquer ?', g: 'Quelles valeurs veux-tu retrouver dans ton travail ?',
  heart: 'Comment vis-tu la négociation et la reconnaissance ?', sacral: 'Quelles activités voudrais-tu recommencer ?',
  solar: 'Comment traverses-tu les hauts et les bas d\'un projet ?', spleen: 'Comment repères-tu les contextes qui te conviennent ?',
  root: 'Comment gères-tu les délais et les urgences ?'
};
// Critères de validation par défaut à 30 jours (étape « Passer à l'action ») : des signaux observables, pas des impressions.
const VALIDATION = [
  'Au moins 10 conversations avec des personnes de ta cible, pour comprendre leur problème avec leurs mots',
  'Au moins 3 personnes qui disent clairement vouloir acheter, ou qui pré-achètent',
  'Un premier client payant, même au prix de lancement',
  'L\'envie de continuer après ces 30 jours : ton énergie est aussi un critère'
];

// Définitions affichées à côté du bodygraph : ce que chaque élément désigne dans le système Human Design.
const GLOSSARY = {
  type: 'Ta façon naturelle d\'utiliser ton énergie et d\'interagir avec les opportunités.',
  strat: 'La manière la plus fluide, selon le système, d\'entrer dans les projets et les relations.',
  auth: 'Ton repère intérieur pour prendre les décisions qui sont justes pour toi.',
  profile: 'Deux lignes, consciente et inconsciente, qui décrivent ton rôle et ta façon d\'apprendre et d\'entrer en relation.',
  def: 'La façon dont tes centres définis sont reliés entre eux : elle montre comment tu fais le lien entre tes idées, tes émotions et ton énergie.',
  sig: 'Le ressenti qui indique que tu vis en accord avec ton fonctionnement : un signal à observer.',
  ns: 'L\'émotion qui signale que tu forces, ou que tu vis selon les attentes des autres.',
  cross: 'Ton thème de vie symbolique, formé par les portes de ton Soleil et de ta Terre (conscient | inconscient).',
  centers: 'Les 9 centres colorés sont définis : une énergie constante, qui t\'est propre. Les centres blancs sont ouverts : tu y captes et amplifies l\'énergie des autres, ce qui peut devenir une grande sagesse.',
  lines: 'Les lignes noires viennent de ta Personnalité (ce dont tu as conscience), les lignes cuivrées de ton Design (ce que les autres voient en toi). Un canal entièrement coloré relie deux centres et les définit.'
};
const DEF_TXT = {
  none: 'Aucun centre n\'est défini : tu reflètes ton environnement, d\'où l\'importance de bien le choisir.',
  single: 'Tous tes centres définis sont reliés : tu fais le lien seul·e entre tes idées, ton énergie et tes émotions, souvent rapidement.',
  split: 'Tes centres définis forment deux groupes : les autres t\'aident à faire le lien. Prends le temps d\'en parler avant de décider.',
  triple: 'Tes centres définis forment trois groupes : tu as besoin de temps et de plusieurs personnes pour relier tes idées.',
  quadruple: 'Tes centres définis forment quatre groupes : laisse mûrir tes décisions, entouré·e de personnes variées.'
};
