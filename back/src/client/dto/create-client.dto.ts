import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

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

  @IsOptional()
  depot?: Types.ObjectId;

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
}
