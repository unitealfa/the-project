import { IsEmail, IsNotEmpty, IsOptional, Matches, MinLength } from 'class-validator';

class AffectationDto {
  entreprise: string;
  depot: string;
}

export class CreateClientDto {
  @IsNotEmpty()
  nom_client: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' })
  @Matches(/[A-Z]/, { message: 'Le mot de passe doit contenir au moins une lettre majuscule' })
  @Matches(/[0-9]/, { message: 'Le mot de passe doit contenir au moins un chiffre' })
  password: string;

  @IsNotEmpty()
  contact: {
    nom_gerant: string;
    telephone: string;
  };

  @IsNotEmpty()
  localisation: {
    adresse: string;
    ville: string;
    code_postal: string;
    region: string;
    coordonnees: {
      latitude: number;
      longitude: number;
    };
  };

  @IsOptional()
  affectations?: AffectationDto[];

  @IsOptional()
  pfp?: string;
}
