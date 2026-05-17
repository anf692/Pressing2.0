import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formaterFCFA } from "@/lib/format";

type Article = { id: string; nom: string; prix: number; type_prix: "kilo" | "fixe"; actif: boolean };

export default function PageArticles() {
  useEffect(() => { document.title = "Articles & tarifs — Pressing by Ramou Diouf"; }, []);

  const qc = useQueryClient();
  const { data: articles } = useQuery({
    queryKey: ["articles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("articles").select("*").order("nom");
      if (error) throw error;
      return (data ?? []) as Article[];
    },
  });

  const [ouvert, setOuvert] = useState(false);
  const [enEdition, setEnEdition] = useState<Article | null>(null);
  const [nom, setNom] = useState("");
  const [prix, setPrix] = useState("");
  const [typePrix, setTypePrix] = useState<"kilo" | "fixe">("fixe");

  const ouvrirCreation = () => { setEnEdition(null); setNom(""); setPrix(""); setTypePrix("fixe"); setOuvert(true); };
  const ouvrirEdition = (a: Article) => { setEnEdition(a); setNom(a.nom); setPrix(String(a.prix)); setTypePrix(a.type_prix); setOuvert(true); };

  const enregistrer = async () => {
    if (!nom.trim() || !prix) { toast.error("Veuillez remplir tous les champs"); return; }
    const prixNum = parseInt(prix, 10);
    if (isNaN(prixNum) || prixNum < 0) { toast.error("Prix invalide"); return; }
    if (enEdition) {
      const { error } = await supabase.from("articles").update({ nom: nom.trim(), prix: prixNum, type_prix: typePrix }).eq("id", enEdition.id);
      if (error) { toast.error("Erreur : " + error.message); return; }
      toast.success("Article modifié");
    } else {
      const { error } = await supabase.from("articles").insert({ nom: nom.trim(), prix: prixNum, type_prix: typePrix });
      if (error) { toast.error("Erreur : " + error.message); return; }
      toast.success("Article ajouté");
    }
    setOuvert(false);
    qc.invalidateQueries({ queryKey: ["articles"] });
  };

  const supprimer = async (id: string) => {
    if (!confirm("Supprimer cet article ?")) return;
    const { error } = await supabase.from("articles").delete().eq("id", id);
    if (error) { toast.error("Impossible de supprimer (article peut-être utilisé) : " + error.message); return; }
    toast.success("Article supprimé");
    qc.invalidateQueries({ queryKey: ["articles"] });
  };

  return (
    <div className="container mx-auto space-y-4 p-4 sm:space-y-6 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary sm:text-3xl">Articles &amp; tarifs</h1>
          <p className="text-xs text-muted-foreground sm:text-sm">Gérez la grille tarifaire des articles du pressing</p>
        </div>
        <Dialog open={ouvert} onOpenChange={setOuvert}>
          <DialogTrigger asChild>
            <Button onClick={ouvrirCreation} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />Nouvel article
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{enEdition ? "Modifier l'article" : "Nouvel article"}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="nom">Nom de l'article</Label>
                <Input id="nom" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ex : Chemise" />
              </div>
              <div>
                <Label htmlFor="prix">Prix (FCFA)</Label>
                <Input id="prix" type="number" value={prix} onChange={(e) => setPrix(e.target.value)} placeholder="500" />
              </div>
              <div>
                <Label htmlFor="type">Type de prix</Label>
                <Select value={typePrix} onValueChange={(v) => setTypePrix(v as "kilo" | "fixe")}>
                  <SelectTrigger id="type"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixe">Prix fixe (par pièce)</SelectItem>
                    <SelectItem value="kilo">Prix au kilo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOuvert(false)}>Annuler</Button>
              <Button onClick={enregistrer}>Enregistrer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader><CardTitle>Liste des articles</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto p-0 sm:p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Article</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Prix</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(articles ?? []).map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.nom}</TableCell>
                  <TableCell>
                    <Badge variant={a.type_prix === "kilo" ? "secondary" : "outline"}>
                      {a.type_prix === "kilo" ? "Au kilo" : "Prix fixe"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formaterFCFA(a.prix)}{a.type_prix === "kilo" ? " / kg" : ""}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => ouvrirEdition(a)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => supprimer(a.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {(articles ?? []).length === 0 && (
                <TableRow><TableCell colSpan={4} className="py-8 text-center text-muted-foreground">Aucun article</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
