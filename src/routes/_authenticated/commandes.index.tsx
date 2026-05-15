import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Eye, Search } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formaterDateHeure,
  formaterFCFA,
  libelleStatut,
  couleurStatut,
} from "@/lib/format";

type CommandeListe = {
  id: string;
  numero_ticket: string;
  statut: "en_attente" | "en_cours" | "pret" | "recupere";
  date_depot: string;
  total_fcfa: number;
  clients: { nom: string; whatsapp: string } | null;
};

export const Route = createFileRoute("/_authenticated/commandes/")({
  head: () => ({
    meta: [
      { title: "Commandes — Pressing by Ramou Diouf" },
      { name: "description", content: "Liste des commandes du pressing." },
    ],
  }),
  component: PageCommandes,
});

function PageCommandes() {
  const { data } = useQuery({
    queryKey: ["commandes-liste"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("commandes")
        .select("id, numero_ticket, statut, date_depot, total_fcfa, clients(nom, whatsapp)")
        .order("date_depot", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as CommandeListe[];
    },
  });

  const [recherche, setRecherche] = useState("");
  const [filtreStatut, setFiltreStatut] = useState<string>("tous");
  const [filtreDate, setFiltreDate] = useState<string>("");

  const commandesFiltrees = useMemo(() => {
    let cs = data ?? [];
    if (filtreStatut !== "tous") cs = cs.filter((c) => c.statut === filtreStatut);
    if (filtreDate) cs = cs.filter((c) => c.date_depot.slice(0, 10) === filtreDate);
    if (recherche.trim()) {
      const q = recherche.toLowerCase().trim();
      cs = cs.filter(
        (c) =>
          c.numero_ticket.toLowerCase().includes(q) ||
          (c.clients?.nom ?? "").toLowerCase().includes(q),
      );
    }
    return cs;
  }, [data, recherche, filtreStatut, filtreDate]);

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Commandes</h1>
          <p className="text-sm text-muted-foreground">
            Toutes les commandes du pressing avec filtres et recherche
          </p>
        </div>
        <Link to="/nouvelle-commande">
          <Button>Nouvelle commande</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="grid grid-cols-1 gap-4 p-4 md:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher par ticket ou nom client…"
              className="pl-9"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
            />
          </div>
          <Select value={filtreStatut} onValueChange={setFiltreStatut}>
            <SelectTrigger>
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tous">Tous les statuts</SelectItem>
              <SelectItem value="en_attente">En attente</SelectItem>
              <SelectItem value="en_cours">En cours</SelectItem>
              <SelectItem value="pret">Prêt</SelectItem>
              <SelectItem value="recupere">Récupéré</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={filtreDate}
            onChange={(e) => setFiltreDate(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° Ticket</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Date dépôt</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commandesFiltrees.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono font-semibold">{c.numero_ticket}</TableCell>
                  <TableCell>{c.clients?.nom ?? "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formaterDateHeure(c.date_depot)}
                  </TableCell>
                  <TableCell>
                    <Badge className={couleurStatut(c.statut)} variant="secondary">
                      {libelleStatut(c.statut)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formaterFCFA(c.total_fcfa)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link to="/commandes/$id" params={{ id: c.id }}>
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              {commandesFiltrees.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    Aucune commande trouvée
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
