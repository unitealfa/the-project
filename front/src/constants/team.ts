// src/constants/team.ts

/** Fonctions métiers (→ `role` en base) classées par catégorie d’équipe */
export const JOB_TITLES = {
    Livraison : ['Administrateur des ventes', 'Livreur', 'Chauffeur'],
    Prévente  : ['Superviseur des ventes',   'Pré-vendeur'],
    Entrepôt  : ['Gestionnaire de stock',     'Contrôleur', 'Manutentionnaire'],
  } as const;
  
  /** Type des clés de JOB_TITLES */
  export type TeamCategory = keyof typeof JOB_TITLES;
  
  /** Type d’une fonction métier */
  export type JobTitle = typeof JOB_TITLES[TeamCategory][number];
  