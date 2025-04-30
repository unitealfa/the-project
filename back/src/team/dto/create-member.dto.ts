// back/src/team/dto/create-member.dto.ts
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator'

/* Catégories d’équipes (grand groupe) */
export const TEAM_ROLES = ['livraison', 'prevente', 'entrepot'] as const
export type TeamRole = (typeof TEAM_ROLES)[number]

export class CreateMemberDto {
  /* ───── groupe (livraison | prevente | entrepot) ───── */
  @IsString()
  @IsIn(TEAM_ROLES)
  role!: TeamRole                // ex. “livraison”

  /* ───── fonction précise (Livreur, Chauffeur, …) ───── */
  @IsString()
  @IsOptional()
  fonction?: string

  /* ───── identité ───── */
  @IsString() @IsNotEmpty() nom!    : string
  @IsString() @IsNotEmpty() prenom! : string

  /* ───── compte de connexion ───── */
  @IsString() @IsNotEmpty() email!    : string
  @IsString() @IsNotEmpty() password! : string   // AUCUNE règle de longueur
  @IsString() @IsOptional() num?      : string   // téléphone (optionnel)
}
