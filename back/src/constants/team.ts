/** job titles → role */
export const JOB_TITLES = {
    Livraison : ['Administrateurs des ventes', 'Livreurs', 'Chauffeurs'],
    Prévente  : ['Superviseurs des ventes',   'Pré vendeurs'],
    Entrepôt  : ['Gestionnaire de stock',     'Contrôleur', 'Manutentionnaire'],
  } as const;
  
  export type TeamCategory = keyof typeof JOB_TITLES;
  export type JobTitle      = typeof JOB_TITLES[TeamCategory][number];
  