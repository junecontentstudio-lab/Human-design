-- Relance à J+2 des prospects qui n'ont pas acheté, et protections du formulaire e-mail.
-- À exécuter une fois dans Supabase : SQL Editor → New query → coller → Run. (Peut être relancé sans risque.)
alter table public.boussole_leads
  add column if not exists relance_sent_at timestamptz,
  add column if not exists unsubscribed_at timestamptz,
  -- Inscription aux conseils confirmée par un clic dans l'e-mail du profil : seules ces personnes sont relancées.
  add column if not exists optin_confirmed_at timestamptz,
  -- Empreinte anonyme de la connexion, pour limiter le nombre d'envois par visiteur.
  add column if not exists ip_hash text;

drop index if exists public.boussole_leads_relance_idx;
create index if not exists boussole_leads_relance_idx
  on public.boussole_leads (created_at)
  where optin and optin_confirmed_at is not null and not is_client and relance_sent_at is null;
create index if not exists boussole_leads_ip_idx on public.boussole_leads (ip_hash, last_email_at);
