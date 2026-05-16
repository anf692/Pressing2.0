import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Shirt } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { INFOS_PRESSING } from "@/lib/format";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Connexion — Pressing by Ramou Diouf" },
      { name: "description", content: "Connectez-vous à l'application de gestion du pressing." },
    ],
  }),
  component: PageConnexion,
});

function PageConnexion() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [nomComplet, setNomComplet] = useState("");
  const [enCours, setEnCours] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/", replace: true });
    });
  }, [navigate]);

  const seConnecter = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnCours(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: motDePasse });
    setEnCours(false);
    if (error) {
      toast.error("Connexion échouée : " + error.message);
      return;
    }
    toast.success("Bienvenue !");
    navigate({ to: "/", replace: true });
  };

  const sInscrire = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomComplet.trim()) {
      toast.error("Le nom complet est obligatoire");
      return;
    }
    setEnCours(true);
    const { error } = await supabase.auth.signUp({
      email,
      password: motDePasse,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { nom_complet: nomComplet.trim(), full_name: nomComplet.trim() },
      },
    });
    setEnCours(false);
    if (error) {
      toast.error("Inscription échouée : " + error.message);
      return;
    }
    toast.success("Compte créé, vous êtes connecté(e) !");
    navigate({ to: "/", replace: true });
  };

  const seConnecterGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Erreur Google : " + (result.error as Error).message);
      return;
    }
    if (!result.redirected) {
      navigate({ to: "/", replace: true });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Shirt className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-xl font-bold text-primary sm:text-2xl">
            {INFOS_PRESSING.nom}
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            {INFOS_PRESSING.localisation}
          </p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-center text-base sm:text-lg">
              Espace de gestion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs defaultValue="connexion">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="connexion">Connexion</TabsTrigger>
                <TabsTrigger value="inscription">Inscription</TabsTrigger>
              </TabsList>
              <TabsContent value="connexion">
                <form onSubmit={seConnecter} className="space-y-3">
                  <div>
                    <Label htmlFor="email-c">Email</Label>
                    <Input
                      id="email-c"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="mdp-c">Mot de passe</Label>
                    <Input
                      id="mdp-c"
                      type="password"
                      autoComplete="current-password"
                      value={motDePasse}
                      onChange={(e) => setMotDePasse(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={enCours}>
                    {enCours ? "Connexion…" : "Se connecter"}
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="inscription">
                <form onSubmit={sInscrire} className="space-y-3">
                  <div>
                    <Label htmlFor="nom-i">Nom complet</Label>
                    <Input
                      id="nom-i"
                      type="text"
                      autoComplete="name"
                      value={nomComplet}
                      onChange={(e) => setNomComplet(e.target.value)}
                      placeholder="Ex : Ramou Diouf"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email-i">Email</Label>
                    <Input
                      id="email-i"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="mdp-i">Mot de passe</Label>
                    <Input
                      id="mdp-i"
                      type="password"
                      autoComplete="new-password"
                      minLength={6}
                      value={motDePasse}
                      onChange={(e) => setMotDePasse(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={enCours}>
                    {enCours ? "Création…" : "Créer un compte"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">ou</span>
              </div>
            </div>

            <Button variant="outline" className="w-full" onClick={seConnecterGoogle}>
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuer avec Google
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
