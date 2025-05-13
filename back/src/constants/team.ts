/** job titles → role */
export const JOB_TITLES = {
    Livraison : ['Administrateur des ventes', 'Livreur', 'Chauffeur'],
    Prévente  : ['Superviseur des ventes',   'Pré-vendeur'],
    Entrepôt  : ['Gestionnaire de stock',     'Contrôleur', 'Manutentionnaire'],
  } as const;
  
  export type TeamCategory = keyof typeof JOB_TITLES;
  export type JobTitle      = typeof JOB_TITLES[TeamCategory][number];
  