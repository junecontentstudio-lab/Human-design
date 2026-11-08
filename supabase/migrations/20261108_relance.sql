-- Relance à J+2 des prospects qui n'ont pas acheté (et qui ont accepté de recevoir des conseils).
-- À exécuter une fois dans Supabase : SQL Editor → New query → coller → Run.
alter table public.boussole_leads
  add column if not exists relance_sent_at timestamptz,
  add column if not exists unsubscribed_at timestamptz;

create index if not exists boussole_leads_relance_idx
  on public.boussole_leads (created_at)
  where optin and not is_client and relance_sent_at is null;
