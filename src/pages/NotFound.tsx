import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export default function PageNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-primary">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page introuvable</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          La page que vous cherchez n'existe pas ou a été déplacée.
        </p>
        <Link to="/" className="mt-6 inline-block">
          <Button>Retour à l'accueil</Button>
        </Link>
      </div>
    </div>
  );
}
