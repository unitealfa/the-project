import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

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
}
