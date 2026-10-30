-- Ma Boussole Business : tables et fonction utilisées par les fonctions serverless (api/).
-- À exécuter une fois dans Supabase : SQL Editor → New query → coller → Run.
-- Les tables sont préfixées « boussole_ » pour cohabiter avec d'autres projets dans la même base.
-- Seule la clé service_role (côté serveur, dans Vercel) y a accès : RLS activé, aucune policy publique.

-- Prospects : toute personne qui a laissé son e-mail pour recevoir son profil gratuit.
create table if not exists public.boussole_leads (
  email          text primary key,
  name           text,
  optin          boolean not null default false,
  hd_type        text,
  hd_authority   text,
  hd_profile     text,
  archetype      text,
  top_idea       text,
  quiz           jsonb,
  utm            jsonb,
  emails_sent    integer not null default 0,
  last_email_at  timestamptz,
  is_client      boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- Paiements SumUp : une ligne par page de paiement créée.
create table if not exists public.boussole_purchases (
  checkout_id      text primary key,
  reference        text unique,
  email            text,
  amount           numeric(10, 2),
  currency         text not null default 'EUR',
  status           text not null default 'PENDING',
  transaction_id   text,
  ai_calls         integer not null default 0,
  access_sent_at   timestamptz,
  created_at       timestamptz not null default now(),
  paid_at          timestamptz,
  updated_at       timestamptz not null default now()
);
create index if not exists boussole_purchases_email_idx on public.boussole_purchases (lower(email));
create index if not exists boussole_purchases_status_idx on public.boussole_purchases (status);

alter table public.boussole_leads enable row level security;
alter table public.boussole_purchases enable row level security;
revoke all on public.boussole_leads, public.boussole_purchases from anon, authenticated;

-- Compte un appel IA pour un accès payé et refuse au-delà de la limite.
-- Crée la ligne si le paiement est antérieur à la base (le jeton HMAC a déjà été vérifié par l'API).
create or replace function public.boussole_use_ai(p_checkout text, p_limit integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare n integer;
begin
  insert into boussole_purchases (checkout_id, status, paid_at)
  values (p_checkout, 'PAID', now())
  on conflict (checkout_id) do nothing;

  update boussole_purchases
     set ai_calls = ai_calls + 1, updated_at = now()
   where checkout_id = p_checkout and ai_calls < p_limit
  returning ai_calls into n;

  return n is not null;
end;
$$;
revoke execute on function public.boussole_use_ai(text, integer) from public, anon, authenticated;
grant execute on function public.boussole_use_ai(text, integer) to service_role;

-- Vue pratique pour suivre le tunnel depuis le tableau de bord Supabase.
create or replace view public.boussole_stats
with (security_invoker = true) as
select
  (select count(*) from boussole_leads)                                   as prospects,
  (select count(*) from boussole_leads where optin)                       as prospects_optin,
  (select count(*) from boussole_purchases where status = 'PAID')         as clients,
  (select coalesce(sum(amount), 0) from boussole_purchases where status = 'PAID') as chiffre_affaires,
  (select round(100.0 * count(*) filter (where is_client) / nullif(count(*), 0), 1) from boussole_leads) as taux_conversion_pct;
revoke all on public.boussole_stats from anon, authenticated;
