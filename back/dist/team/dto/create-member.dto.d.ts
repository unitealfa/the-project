export declare const JOB_TITLES: readonly ["Administrateurs des ventes", "Livreurs", "Chauffeurs", "Superviseurs des ventes", "Pré vendeurs", "Gestionnaire de stock", "Contrôleur", "Manutentionnaire"];
export type JobTitle = typeof JOB_TITLES[number];
export declare const TEAM_CATEGORIES: readonly ["Livraison", "Prévente", "Entrepôt"];
export type TeamCategory = typeof TEAM_CATEGORIES[number];
export declare class CreateMemberDto {
    role: JobTitle;
    poste: TeamCategory;
    nom: string;
    prenom: string;
    email: string;
    password: string;
    num: string;
}
