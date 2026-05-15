import { useEffect, useState } from "react";
import { createFileRoute, Outlet, redirect, useNavigate } from "@tanstack/react-router";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated")({
  // beforeLoad ne s'exécute pas avec une session hydratée côté client uniquement.
  // On effectue la vérification finale dans le composant pour éviter les flashs côté SSR.
  component: LayoutAuthentifie,
});

function LayoutAuthentifie() {
  const navigate = useNavigate();
  const [verifie, setVerifie] = useState(false);
  const [emailUtilisateur, setEmailUtilisateur] = useState<string | null>(null);

  useEffect(() => {
    let actif = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!actif) return;
      if (!data.session) {
        navigate({ to: "/login", replace: true });
      } else {
        setEmailUtilisateur(data.session.user.email ?? null);
        setVerifie(true);
      }
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate({ to: "/login", replace: true });
      } else {
        setEmailUtilisateur(session.user.email ?? null);
      }
    });
    return () => {
      actif = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  const seDeconnecter = async () => {
    await supabase.auth.signOut();
    toast.success("Déconnecté");
    navigate({ to: "/login", replace: true });
  };

  if (!verifie) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Chargement…</p>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="no-print sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-background/80 px-3 backdrop-blur sm:px-4">
            <SidebarTrigger />
            <h1 className="truncate text-sm font-medium text-muted-foreground sm:text-base">
              Pressing by Ramou Diouf
            </h1>
            <div className="ml-auto flex items-center gap-2">
              {emailUtilisateur && (
                <span className="hidden max-w-[160px] truncate text-xs text-muted-foreground md:inline">
                  {emailUtilisateur}
                </span>
              )}
              <Button variant="ghost" size="sm" onClick={seDeconnecter}>
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Déconnexion</span>
              </Button>
            </div>
          </header>
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
