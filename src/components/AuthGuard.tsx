import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { ChargementPage } from "@/components/ChargementPage";
import { supabase } from "@/integrations/supabase/client";

/**
 * Garde d'authentification : protège les routes privées.
 * Si pas de session → redirection vers /login.
 */
export function AuthGuard({ children }: { children: ReactNode }) {
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

  if (!verifie) return <ChargementPage />;

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
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
