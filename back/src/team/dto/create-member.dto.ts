import { IsIn, IsNotEmpty, IsString } from 'class-validator';

/* Catégories d’équipes (grand groupe) */
export const TEAM_ROLES = ['livraison', 'prevente', 'entrepot'] as const;
export type TeamRole = (typeof TEAM_ROLES)[number];

export class CreateMemberDto {
  /* Catégorie (livraison | prevente | entrepot) */
  @IsString()
  @IsIn(TEAM_ROLES)
  role!: TeamRole;    // ex. “livraison”

  /* Identité */
  @IsString() @IsNotEmpty() nom!   : string;
  @IsString() @IsNotEmpty() prenom!: string;

  /* Connexion */
  @IsString() @IsNotEmpty() email!   : string;
  @IsString() @IsNotEmpty() password!: string;
  @IsString() @IsNotEmpty() num!     : string;
}
