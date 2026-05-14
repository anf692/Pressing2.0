// Utilitaires de formatage pour le pressing

export const formaterFCFA = (montant: number): string => {
  return new Intl.NumberFormat("fr-FR").format(montant) + " FCFA";
};

export const formaterDate = (date: string | Date): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const formaterDateHeure = (date: string | Date): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const libelleStatut = (statut: string): string => {
  switch (statut) {
    case "en_attente":
      return "En attente";
    case "en_cours":
      return "En cours";
    case "pret":
      return "Prêt";
    case "recupere":
      return "Récupéré";
    default:
      return statut;
  }
};

export const couleurStatut = (statut: string): string => {
  switch (statut) {
    case "en_attente":
      return "bg-muted text-muted-foreground";
    case "en_cours":
      return "bg-secondary text-secondary-foreground";
    case "pret":
      return "bg-accent text-accent-foreground";
    case "recupere":
      return "bg-primary text-primary-foreground";
    default:
      return "bg-muted";
  }
};

// Nettoie le numéro WhatsApp pour le format wa.me (uniquement chiffres)
export const nettoyerWhatsApp = (numero: string): string => {
  return numero.replace(/[^\d]/g, "");
};

// Génère le lien wa.me avec un message pré-rempli
export const lienWhatsApp = (numero: string, message: string): string => {
  const num = nettoyerWhatsApp(numero);
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
};

export const INFOS_PRESSING = {
  nom: "Pressing by Ramou Diouf",
  localisation: "Rufisque / Gouye Aldiana",
  contacts: ["+221 77 702 32 82", "+221 77 110 47 67"],
};
