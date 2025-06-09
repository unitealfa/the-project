import { IsString, IsEmail, Matches, MinLength } from 'class-validator';

export class CreateAdminDto {
  @IsString() nom: string;
  @IsString() prenom: string;
  @IsEmail() email: string;
  @IsString()
  @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' })
  @Matches(/[A-Z]/, { message: 'Le mot de passe doit contenir au moins une lettre majuscule' })
  @Matches(/[0-9]/, { message: 'Le mot de passe doit contenir au moins un chiffre' })
  password: string;
  @IsString() num: string;
}
