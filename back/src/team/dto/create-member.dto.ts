import {
  IsIn, IsNotEmpty, IsString, IsOptional, MinLength, Matches
} from 'class-validator';

/** fonctions métiers possibles (→ role) */
export const JOB_TITLES = [
  'Administrateur des ventes',
  'Livreur',
  'Chauffeur',
  'Superviseur des ventes',
  'Pré-vendeur',
  'Gestionnaire de stock',
  'Contrôleur',
  'Manutentionnaire',
] as const;
export type JobTitle = typeof JOB_TITLES[number];

/** catégories d'équipe (→ poste) */
export const TEAM_CATEGORIES = ['Livraison', 'Prévente', 'Entrepôt'] as const;
export type TeamCategory = typeof TEAM_CATEGORIES[number];

export class CreateMemberDto {
  @IsString() @IsIn(JOB_TITLES)
  role!: JobTitle;            // ex. "Livreur"

  @IsString() @IsIn(TEAM_CATEGORIES)
  poste!: TeamCategory;       // ex. "Livraison"

  @IsString() @IsNotEmpty() nom!     : string;
  @IsString() @IsNotEmpty() prenom!  : string;
  @IsString() @IsNotEmpty() email!   : string;
  @IsString() @IsNotEmpty() 
  @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' })
  @Matches(/[A-Z]/, { message: 'Le mot de passe doit contenir au moins une lettre majuscule' })
  @Matches(/[0-9]/, { message: 'Le mot de passe doit contenir au moins un chiffre' })
  password!: string;
  @IsString() @IsNotEmpty() num!     : string;
  @IsString() @IsOptional() pfp?: string;
}
export class UpdateMemberDto {
  @IsString() @IsIn(JOB_TITLES) @IsOptional()
  role?: JobTitle;            // ex. "Livreur"

  @IsString() @IsIn(TEAM_CATEGORIES) @IsOptional()
  poste?: TeamCategory;       // ex. "Livraison"

  @IsString() @IsOptional() nom?     : string;
  @IsString() @IsOptional() prenom?  : string;
  @IsString() @IsOptional() email?   : string;
  @IsString() @IsOptional() num?     : string;
  @IsString() @IsOptional()
  @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' })
  @Matches(/[A-Z]/, { message: 'Le mot de passe doit contenir au moins une lettre majuscule' })
  @Matches(/[0-9]/, { message: 'Le mot de passe doit contenir au moins un chiffre' })
  password?: string;
  @IsString() @IsOptional() pfp?: string;
}