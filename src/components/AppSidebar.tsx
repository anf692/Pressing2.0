import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, PlusCircle, ListOrdered, Tag, Shirt } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { INFOS_PRESSING } from "@/lib/format";

const liens = [
  { titre: "Tableau de bord", url: "/", icone: LayoutDashboard },
  { titre: "Nouvelle commande", url: "/nouvelle-commande", icone: PlusCircle },
  { titre: "Commandes", url: "/commandes", icone: ListOrdered },
  { titre: "Articles & tarifs", url: "/articles", icone: Tag },
];

export function AppSidebar() {
  const cheminCourant = useRouterState({ select: (s) => s.location.pathname });
  const estActif = (url: string) =>
    url === "/" ? cheminCourant === "/" : cheminCourant.startsWith(url);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <Shirt className="h-5 w-5" />
          </div>
          <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-semibold">{INFOS_PRESSING.nom}</span>
            <span className="truncate text-xs opacity-75">{INFOS_PRESSING.localisation}</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {liens.map((lien) => (
                <SidebarMenuItem key={lien.url}>
                  <SidebarMenuButton asChild isActive={estActif(lien.url)} tooltip={lien.titre}>
                    <Link to={lien.url} className="flex items-center gap-2">
                      <lien.icone className="h-4 w-4" />
                      <span>{lien.titre}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
