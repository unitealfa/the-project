export declare const TEAM_ROLES: readonly ["livraison", "prevente", "entrepot"];
export type TeamRole = (typeof TEAM_ROLES)[number];
export declare class CreateMemberDto {
    role: TeamRole;
    nom: string;
    prenom: string;
    email: string;
    password: string;
    num: string;
}
