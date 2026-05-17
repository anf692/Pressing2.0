import { Suspense, lazy } from "react";
import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from "@tanstack/react-router";

import { ChargementPage } from "@/components/ChargementPage";
import { AuthGuard } from "@/components/AuthGuard";

// ===== Lazy loading des pages (code splitting automatique par route) =====
const PageLogin = lazy(() => import("@/pages/Login"));
const PageDashboard = lazy(() => import("@/pages/Dashboard"));
const PageArticles = lazy(() => import("@/pages/Articles"));
const PageNouvelleCommande = lazy(() => import("@/pages/NouvelleCommande"));
const PageCommandesListe = lazy(() => import("@/pages/CommandesListe"));
const PageCommandeDetail = lazy(() => import("@/pages/CommandeDetail"));
const PageNotFound = lazy(() => import("@/pages/NotFound"));

function withSuspense(Component: React.LazyExoticComponent<React.ComponentType>) {
  return () => (
    <Suspense fallback={<ChargementPage />}>
      <Component />
    </Suspense>
  );
}

// ===== Définition des routes =====
const rootRoute = createRootRoute({
  component: () => <Outlet />,
  notFoundComponent: withSuspense(PageNotFound),
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: withSuspense(PageLogin),
});

// Layout protégé : vérifie l'authentification et affiche la sidebar
const authLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "auth-layout",
  component: () => (
    <AuthGuard>
      <Outlet />
    </AuthGuard>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/",
  component: withSuspense(PageDashboard),
});

const articlesRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/articles",
  component: withSuspense(PageArticles),
});

const nouvelleCommandeRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/nouvelle-commande",
  component: withSuspense(PageNouvelleCommande),
});

const commandesListeRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/commandes",
  component: withSuspense(PageCommandesListe),
});

const commandeDetailRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/commandes/$id",
  component: withSuspense(PageCommandeDetail),
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  authLayoutRoute.addChildren([
    indexRoute,
    articlesRoute,
    nouvelleCommandeRoute,
    commandesListeRoute,
    commandeDetailRoute,
  ]),
]);

export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultPendingComponent: ChargementPage,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
