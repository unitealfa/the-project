import {
  IsIn, IsNotEmpty, IsString,
} from 'class-validator';

/** fonctions métiers possibles (→ role) */
export const JOB_TITLES = [
  'Administrateurs des ventes',
  'Livreurs',
  'Chauffeurs',
  'Superviseurs des ventes',
  'Pré vendeurs',
  'Gestionnaire de stock',
  'Contrôleur',
  'Manutentionnaire',
] as const;
export type JobTitle = typeof JOB_TITLES[number];

/** catégories d’équipe (→ poste) */
export const TEAM_CATEGORIES = ['Livraison', 'Prévente', 'Entrepôt'] as const;
export type TeamCategory = typeof TEAM_CATEGORIES[number];

export class CreateMemberDto {
  @IsString() @IsIn(JOB_TITLES)
  role!: JobTitle;            // ex. "Livreurs"

  @IsString() @IsIn(TEAM_CATEGORIES)
  poste!: TeamCategory;       // ex. "Livraison"

  @IsString() @IsNotEmpty() nom!     : string;
  @IsString() @IsNotEmpty() prenom!  : string;
  @IsString() @IsNotEmpty() email!   : string;
  @IsString() @IsNotEmpty() password!: string;
  @IsString() @IsNotEmpty() num!     : string;
}
