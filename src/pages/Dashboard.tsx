import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Bar, BarChart, CartesianGrid, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { CalendarDays, Coins, Package, CheckCircle2, Clock, TrendingUp } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formaterFCFA } from "@/lib/format";

function debutDuJour() { const d = new Date(); d.setHours(0,0,0,0); return d.toISOString(); }
function debutDuMois() { const d = new Date(); d.setDate(1); d.setHours(0,0,0,0); return d.toISOString(); }

export default function TableauDeBord() {
  useEffect(() => { document.title = "Tableau de bord — Pressing by Ramou Diouf"; }, []);

  const { data: commandes } = useQuery({
    queryKey: ["commandes-toutes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("commandes")
        .select("id, statut, total_fcfa, date_depot, date_recuperation_reelle")
        .order("date_depot", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: lignesTop } = useQuery({
    queryKey: ["top-articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lignes_commande")
        .select("article_id, quantite, poids_kg, articles(nom)");
      if (error) throw error;
      return data ?? [];
    },
  });

  const kpis = useMemo(() => {
    const cs = commandes ?? [];
    const debutJ = debutDuJour();
    const debutM = debutDuMois();
    const caJour = cs.filter((c) => c.date_depot >= debutJ).reduce((s, c) => s + (c.total_fcfa ?? 0), 0);
    const caMois = cs.filter((c) => c.date_depot >= debutM).reduce((s, c) => s + (c.total_fcfa ?? 0), 0);
    const nbJour = cs.filter((c) => c.date_depot >= debutJ).length;
    const nbTotal = cs.length;
    const enAttenteRecup = cs.filter((c) => c.statut === "en_attente" || c.statut === "en_cours" || c.statut === "pret").length;
    const recupMois = cs.filter((c) => c.statut === "recupere" && c.date_recuperation_reelle && c.date_recuperation_reelle >= debutM).length;
    return { caJour, caMois, nbJour, nbTotal, enAttenteRecup, recupMois };
  }, [commandes]);

  const donneesEvolution = useMemo(() => {
    const cs = commandes ?? [];
    const map = new Map<string, number>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i); d.setHours(0,0,0,0);
      map.set(d.toISOString().slice(0,10), 0);
    }
    cs.forEach((c) => {
      const cle = c.date_depot.slice(0,10);
      if (map.has(cle)) map.set(cle, (map.get(cle) ?? 0) + 1);
    });
    return Array.from(map.entries()).map(([date, nb]) => ({
      jour: new Date(date).toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit" }),
      commandes: nb,
    }));
  }, [commandes]);

  const topArticles = useMemo(() => {
    const lc = lignesTop ?? [];
    const map = new Map<string, { nom: string; total: number }>();
    lc.forEach((l: any) => {
      const nom = l.articles?.nom ?? "Inconnu";
      const compte = (l.quantite ?? 0) + (l.poids_kg ? 1 : 0);
      const ex = map.get(nom) ?? { nom, total: 0 };
      ex.total += compte || 1;
      map.set(nom, ex);
    });
    return Array.from(map.values()).sort((a, b) => b.total - a.total).slice(0, 5);
  }, [lignesTop]);

  return (
    <div className="container mx-auto space-y-4 p-4 sm:space-y-6 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold text-primary sm:text-3xl">Tableau de bord</h1>
        <p className="text-xs text-muted-foreground sm:text-sm">Vue d'ensemble de l'activité du pressing</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <CarteKpi titre="Chiffre d'affaires du jour" valeur={formaterFCFA(kpis.caJour)} icone={Coins} />
        <CarteKpi titre="Chiffre d'affaires du mois" valeur={formaterFCFA(kpis.caMois)} icone={TrendingUp} />
        <CarteKpi titre="Commandes du jour" valeur={kpis.nbJour} icone={CalendarDays} />
        <CarteKpi titre="Commandes au total" valeur={kpis.nbTotal} icone={Package} />
        <CarteKpi titre="En attente de récupération" valeur={kpis.enAttenteRecup} icone={Clock} />
        <CarteKpi titre="Récupérées ce mois" valeur={kpis.recupMois} icone={CheckCircle2} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Évolution des commandes (7 derniers jours)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={donneesEvolution}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="jour" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                <Line type="monotone" dataKey="commandes" stroke="var(--color-primary)" strokeWidth={3} dot={{ fill: "var(--color-primary)", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Top 5 articles commandés</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topArticles}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="nom" stroke="var(--color-muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                <Bar dataKey="total" fill="var(--color-secondary)" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CarteKpi({ titre, valeur, icone: Icone }: { titre: string; valeur: string | number; icone: React.ComponentType<{ className?: string }> }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4 sm:gap-4 sm:p-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground sm:h-12 sm:w-12">
          <Icone className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[10px] uppercase tracking-wide text-muted-foreground sm:text-xs">{titre}</p>
          <p className="truncate text-xl font-bold text-foreground sm:text-2xl">{valeur}</p>
        </div>
      </CardContent>
    </Card>
  );
}
