import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formaterFCFA } from "@/lib/format";

type Article = { id: string; nom: string; prix: number; type_prix: "kilo" | "fixe" };
type Ligne = { cleLigne: string; article_id: string; poids_kg: number | null; quantite: number | null };

export default function PageNouvelleCommande() {
  useEffect(() => { document.title = "Nouvelle commande — Pressing by Ramou Diouf"; }, []);

  const navigate = useNavigate();
  const { data: articles } = useQuery({
    queryKey: ["articles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("articles").select("id, nom, prix, type_prix").eq("actif", true).order("nom");
      if (error) throw error;
      return (data ?? []) as Article[];
    },
  });

  const [nomClient, setNomClient] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [dateRecup, setDateRecup] = useState("");
  const [lignes, setLignes] = useState<Ligne[]>([]);
  const [enCours, setEnCours] = useState(false);

  const ajouterLigne = () => setLignes((l) => [...l, { cleLigne: crypto.randomUUID(), article_id: "", poids_kg: null, quantite: null }]);
  const supprimerLigne = (cle: string) => setLignes((l) => l.filter((x) => x.cleLigne !== cle));

  const modifierLigne = (cle: string, modif: Partial<Ligne>) => {
    setLignes((l) => l.map((x) => {
      if (x.cleLigne !== cle) return x;
      const fusion = { ...x, ...modif };
      if (modif.article_id) {
        const a = articles?.find((ar) => ar.id === modif.article_id);
        if (a?.type_prix === "kilo") { fusion.quantite = null; fusion.poids_kg = fusion.poids_kg ?? 1; }
        else { fusion.poids_kg = null; fusion.quantite = fusion.quantite ?? 1; }
      }
      return fusion;
    }));
  };

  const sousTotal = (ligne: Ligne) => {
    const a = articles?.find((ar) => ar.id === ligne.article_id);
    if (!a) return 0;
    if (a.type_prix === "kilo") return Math.round(a.prix * (ligne.poids_kg ?? 0));
    return a.prix * (ligne.quantite ?? 0);
  };

  const total = useMemo(() => lignes.reduce((s, l) => s + sousTotal(l), 0), // eslint-disable-next-line react-hooks/exhaustive-deps
    [lignes, articles]);

  const enregistrer = async () => {
    if (!nomClient.trim()) { toast.error("Le nom du client est obligatoire"); return; }
    if (lignes.length === 0) { toast.error("Ajoutez au moins un article"); return; }
    for (const l of lignes) {
      if (!l.article_id) { toast.error("Sélectionnez un article pour chaque ligne"); return; }
      const a = articles?.find((x) => x.id === l.article_id);
      if (a?.type_prix === "kilo" && (!l.poids_kg || l.poids_kg <= 0)) { toast.error(`Poids invalide pour ${a.nom}`); return; }
      if (a?.type_prix === "fixe" && (!l.quantite || l.quantite <= 0)) { toast.error(`Quantité invalide pour ${a?.nom}`); return; }
    }

    setEnCours(true);
    try {
      const { data: client, error: errClient } = await supabase.from("clients").insert({
        nom: nomClient.trim(),
        whatsapp: whatsapp.trim() || "",
      }).select().single();
      if (errClient || !client) throw errClient ?? new Error("Création client échouée");

      const { data: commande, error: errCmd } = await supabase.from("commandes").insert({
        client_id: client.id, total_fcfa: total, date_recuperation_estimee: dateRecup || null,
      }).select().single();
      if (errCmd || !commande) throw errCmd ?? new Error("Création commande échouée");

      const insertions = lignes.map((l) => ({
        commande_id: commande.id, article_id: l.article_id,
        poids_kg: l.poids_kg, quantite: l.quantite, sous_total: sousTotal(l),
      }));
      const { error: errLignes } = await supabase.from("lignes_commande").insert(insertions);
      if (errLignes) throw errLignes;

      toast.success(`Commande ${commande.numero_ticket} créée`);
      navigate({ to: "/commandes/$id", params: { id: commande.id } });
    } catch (e: any) {
      toast.error("Erreur : " + (e?.message ?? "inconnue"));
    } finally {
      setEnCours(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl space-y-4 p-4 sm:space-y-6 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold text-primary sm:text-3xl">Nouvelle commande</h1>
        <p className="text-xs text-muted-foreground sm:text-sm">Saisissez les informations du client et les articles déposés</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Client</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="nom">Nom du client</Label>
            <Input id="nom" value={nomClient} onChange={(e) => setNomClient(e.target.value)} placeholder="Ex : Aïssatou Diallo" />
          </div>
          <div>
            <Label htmlFor="wa">Numéro WhatsApp</Label>
            <Input id="wa" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="221 77 000 00 00" />
          </div>
          <div>
            <Label htmlFor="recup">Date de récupération estimée</Label>
            <Input id="recup" type="date" value={dateRecup} onChange={(e) => setDateRecup(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
          <CardTitle>Articles</CardTitle>
          <Button variant="outline" size="sm" onClick={ajouterLigne}><Plus className="mr-1 h-4 w-4" />Ajouter</Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {lignes.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">Aucun article — cliquez sur "Ajouter"</p>
          )}
          {lignes.map((l) => {
            const a = articles?.find((x) => x.id === l.article_id);
            return (
              <div key={l.cleLigne} className="grid grid-cols-1 items-end gap-3 rounded-lg border bg-muted/30 p-3 md:grid-cols-[2fr_1fr_1fr_auto]">
                <div>
                  <Label>Article</Label>
                  <Select value={l.article_id} onValueChange={(v) => modifierLigne(l.cleLigne, { article_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Choisir un article" /></SelectTrigger>
                    <SelectContent>
                      {(articles ?? []).map((ar) => (
                        <SelectItem key={ar.id} value={ar.id}>
                          {ar.nom} — {formaterFCFA(ar.prix)}{ar.type_prix === "kilo" ? "/kg" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {a?.type_prix === "kilo" ? (
                  <div>
                    <Label>Poids (kg)</Label>
                    <Input type="number" step="0.1" min="0" value={l.poids_kg ?? ""}
                      onChange={(e) => modifierLigne(l.cleLigne, { poids_kg: e.target.value === "" ? null : parseFloat(e.target.value) })} />
                  </div>
                ) : (
                  <div>
                    <Label>Quantité</Label>
                    <Input type="number" min="0" value={l.quantite ?? ""}
                      onChange={(e) => modifierLigne(l.cleLigne, { quantite: e.target.value === "" ? null : parseInt(e.target.value, 10) })}
                      disabled={!a} />
                  </div>
                )}
                <div className="text-right">
                  <Label>Sous-total</Label>
                  <p className="pt-2 font-semibold text-primary">{formaterFCFA(sousTotal(l))}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => supprimerLigne(l.cleLigne)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card className="border-primary">
        <CardContent className="flex flex-wrap items-center justify-between gap-2 p-4 sm:p-6">
          <span className="text-base font-medium sm:text-lg">Total à payer</span>
          <span className="text-2xl font-bold text-primary sm:text-3xl">{formaterFCFA(total)}</span>
        </CardContent>
      </Card>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
        <Button variant="outline" onClick={() => navigate({ to: "/commandes" })}>Annuler</Button>
        <Button onClick={enregistrer} disabled={enCours}>
          {enCours ? "Enregistrement…" : "Enregistrer la commande"}
        </Button>
      </div>
    </div>
  );
}
