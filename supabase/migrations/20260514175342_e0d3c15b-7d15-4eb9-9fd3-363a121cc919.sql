
-- Enums
CREATE TYPE public.type_prix_enum AS ENUM ('kilo', 'fixe');
CREATE TYPE public.statut_commande_enum AS ENUM ('en_attente', 'en_cours', 'pret', 'recupere');

-- Table clients
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table articles
CREATE TABLE public.articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL,
  prix INTEGER NOT NULL,
  type_prix public.type_prix_enum NOT NULL,
  actif BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Séquence numéro de ticket
CREATE SEQUENCE public.seq_numero_ticket START 1;

CREATE OR REPLACE FUNCTION public.generer_numero_ticket()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  prochain INTEGER;
BEGIN
  prochain := nextval('public.seq_numero_ticket');
  RETURN 'PRE-' || LPAD(prochain::text, 4, '0');
END;
$$;

-- Table commandes
CREATE TABLE public.commandes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_ticket TEXT NOT NULL UNIQUE DEFAULT public.generer_numero_ticket(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT,
  statut public.statut_commande_enum NOT NULL DEFAULT 'en_attente',
  date_depot TIMESTAMPTZ NOT NULL DEFAULT now(),
  date_recuperation_estimee DATE,
  date_recuperation_reelle TIMESTAMPTZ,
  total_fcfa INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_commandes_statut ON public.commandes(statut);
CREATE INDEX idx_commandes_date_depot ON public.commandes(date_depot);
CREATE INDEX idx_commandes_client ON public.commandes(client_id);

-- Table lignes_commande
CREATE TABLE public.lignes_commande (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  commande_id UUID NOT NULL REFERENCES public.commandes(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE RESTRICT,
  poids_kg NUMERIC(10,2),
  quantite INTEGER,
  sous_total INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_lignes_commande_commande ON public.lignes_commande(commande_id);
CREATE INDEX idx_lignes_commande_article ON public.lignes_commande(article_id);

-- RLS : application interne sans authentification → accès anonyme complet
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commandes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lignes_commande ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acces public clients" ON public.clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acces public articles" ON public.articles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acces public commandes" ON public.commandes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acces public lignes_commande" ON public.lignes_commande FOR ALL USING (true) WITH CHECK (true);

-- Seed des articles
INSERT INTO public.articles (nom, prix, type_prix) VALUES
  ('Chemise', 500, 'kilo'),
  ('Pantalon', 500, 'kilo'),
  ('T-shirt', 500, 'kilo'),
  ('Jeans', 500, 'kilo'),
  ('Costume', 1250, 'fixe'),
  ('Bazin Simple', 1000, 'fixe'),
  ('Bazin Complet', 1250, 'fixe'),
  ('Bazin 3 pièces', 1500, 'fixe'),
  ('Serviette', 750, 'fixe'),
  ('Drap Couvre lit', 1000, 'fixe'),
  ('Robe de Mariage', 2500, 'fixe'),
  ('Complet enfant', 500, 'kilo');
