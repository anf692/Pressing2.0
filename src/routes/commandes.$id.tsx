import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, MessageCircle, Printer } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import {
  formaterDate,
  formaterDateHeure,
  formaterFCFA,
  libelleStatut,
  couleurStatut,
  lienWhatsApp,
  INFOS_PRESSING,
} from "@/lib/format";

type Detail = {
  id: string;
  numero_ticket: string;
  statut: "en_attente" | "en_cours" | "pret" | "recupere";
  date_depot: string;
  date_recuperation_estimee: string | null;
  date_recuperation_reelle: string | null;
  total_fcfa: number;
  clients: { id: string; nom: string; whatsapp: string } | null;
  lignes_commande: {
    id: string;
    poids_kg: number | null;
    quantite: number | null;
    sous_total: number;
    articles: { nom: string; type_prix: "kilo" | "fixe"; prix: number } | null;
  }[];
};

export const Route = createFileRoute("/commandes/$id")({
  head: () => ({
    meta: [
      { title: "Détail commande — Pressing by Ramou Diouf" },
    ],
  }),
  component: PageDetail,
});

function PageDetail() {
  const { id } = Route.useParams();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["commande", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("commandes")
        .select(
          "id, numero_ticket, statut, date_depot, date_recuperation_estimee, date_recuperation_reelle, total_fcfa, clients(id, nom, whatsapp), lignes_commande(id, poids_kg, quantite, sous_total, articles(nom, type_prix, prix))",
        )
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as unknown as Detail;
    },
  });

  const changerStatut = async (
    nouveauStatut: "en_attente" | "en_cours" | "pret" | "recupere",
  ) => {
    const maj: Record<string, unknown> = { statut: nouveauStatut };
    if (nouveauStatut === "recupere") {
      maj.date_recuperation_reelle = new Date().toISOString();
    } else {
      maj.date_recuperation_reelle = null;
    }
    const { error } = await supabase.from("commandes").update(maj).eq("id", id);
    if (error) {
      toast.error("Erreur : " + error.message);
      return;
    }
    toast.success("Statut mis à jour : " + libelleStatut(nouveauStatut));
    qc.invalidateQueries({ queryKey: ["commande", id] });
    qc.invalidateQueries({ queryKey: ["commandes-liste"] });
    qc.invalidateQueries({ queryKey: ["commandes-toutes"] });
  };

  if (isLoading || !data) {
    return <div className="p-6 text-muted-foreground">Chargement…</div>;
  }

  const messageWA =
    `Bonjour ${data.clients?.nom ?? ""},\n\n` +
    `Voici votre ticket de pressing :\n` +
    `N° ${data.numero_ticket}\n` +
    `Date de dépôt : ${formaterDate(data.date_depot)}\n` +
    (data.date_recuperation_estimee
      ? `Récupération estimée : ${formaterDate(data.date_recuperation_estimee)}\n`
      : "") +
    `\nArticles :\n` +
    data.lignes_commande
      .map((l) => {
        const q = l.articles?.type_prix === "kilo" ? `${l.poids_kg} kg` : `x${l.quantite}`;
        return `- ${l.articles?.nom} (${q}) : ${formaterFCFA(l.sous_total)}`;
      })
      .join("\n") +
    `\n\nTotal : ${formaterFCFA(data.total_fcfa)}\n\n` +
    `${INFOS_PRESSING.nom} — ${INFOS_PRESSING.localisation}\n` +
    `${INFOS_PRESSING.contacts.join(" / ")}`;

  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-6">
      <div className="no-print flex items-center justify-between">
        <Link to="/commandes">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux commandes
          </Button>
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimer
          </Button>
          {data.clients?.whatsapp && (
            <a
              href={lienWhatsApp(data.clients.whatsapp, messageWA)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button>
                <MessageCircle className="mr-2 h-4 w-4" />
                Envoyer sur WhatsApp
              </Button>
            </a>
          )}
        </div>
      </div>

      <Card className="no-print">
        <CardHeader>
          <CardTitle>Statut de la commande</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Badge className={couleurStatut(data.statut)} variant="secondary">
            {libelleStatut(data.statut)}
          </Badge>
          <Select value={data.statut} onValueChange={(v) => changerStatut(v as any)}>
            <SelectTrigger className="w-60">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en_attente">En attente</SelectItem>
              <SelectItem value="en_cours">En cours</SelectItem>
              <SelectItem value="pret">Prêt</SelectItem>
              <SelectItem value="recupere">Récupéré</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Ticket imprimable */}
      <Card className="ticket-imprimable">
        <CardContent className="space-y-6 p-8">
          <div className="border-b pb-4 text-center">
            <h2 className="text-2xl font-bold text-primary">{INFOS_PRESSING.nom}</h2>
            <p className="text-sm text-muted-foreground">{INFOS_PRESSING.localisation}</p>
            <p className="text-sm text-muted-foreground">
              {INFOS_PRESSING.contacts.join(" / ")}
            </p>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase text-muted-foreground">N° Ticket</p>
              <p className="font-mono text-2xl font-bold text-primary">
                #{data.numero_ticket}
              </p>
            </div>
            <div className="text-right text-sm">
              <p>
                <span className="text-muted-foreground">Dépôt : </span>
                {formaterDateHeure(data.date_depot)}
              </p>
              {data.date_recuperation_estimee && (
                <p>
                  <span className="text-muted-foreground">Récup. estimée : </span>
                  {formaterDate(data.date_recuperation_estimee)}
                </p>
              )}
              {data.date_recuperation_reelle && (
                <p>
                  <span className="text-muted-foreground">Récupéré le : </span>
                  {formaterDateHeure(data.date_recuperation_reelle)}
                </p>
              )}
            </div>
          </div>

          <div className="rounded-lg bg-muted/40 p-4">
            <p className="text-xs uppercase text-muted-foreground">Client</p>
            <p className="text-lg font-semibold">{data.clients?.nom}</p>
            <p className="text-sm text-muted-foreground">
              WhatsApp : {data.clients?.whatsapp}
            </p>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Article</TableHead>
                <TableHead className="text-center">Poids / Qté</TableHead>
                <TableHead className="text-right">Prix unitaire</TableHead>
                <TableHead className="text-right">Sous-total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.lignes_commande.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium">{l.articles?.nom}</TableCell>
                  <TableCell className="text-center">
                    {l.articles?.type_prix === "kilo"
                      ? `${l.poids_kg} kg`
                      : `x${l.quantite}`}
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {formaterFCFA(l.articles?.prix ?? 0)}
                    {l.articles?.type_prix === "kilo" ? "/kg" : ""}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formaterFCFA(l.sous_total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between border-t pt-4">
            <span className="text-lg font-medium">Total</span>
            <span className="text-3xl font-bold text-primary">
              {formaterFCFA(data.total_fcfa)}
            </span>
          </div>

          <p className="border-t pt-4 text-center text-xs text-muted-foreground">
            Merci pour votre confiance — {INFOS_PRESSING.nom}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
