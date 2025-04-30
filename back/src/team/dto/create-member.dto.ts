import { IsIn, IsNotEmpty, IsString } from 'class-validator';

/** rôles possibles pour un membre d’équipe de dépôt */
export const TEAM_ROLES = ['livraison', 'prevente', 'entrepot'] as const;
export type TeamRole = (typeof TEAM_ROLES)[number];

export class CreateMemberDto {
  @IsString()
  @IsIn(TEAM_ROLES, { message: `role doit être l’un de : ${TEAM_ROLES.join(', ')}` })
  role!: TeamRole;

  @IsString() @IsNotEmpty() nom!: string;
  @IsString() @IsNotEmpty() prenom!: string;
}
