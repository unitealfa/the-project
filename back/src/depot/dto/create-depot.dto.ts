import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  ValidateNested,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

/** Données du responsable de dépôt */
class ResponsableDto {
  @IsString()
  @IsNotEmpty()
  nom: string;

  @IsString()
  @IsNotEmpty()
  prenom: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(2)
  password: string;

  @IsString()
  @IsNotEmpty()
  num: string;
}

/** Adresse postale du dépôt */
class AdresseDto {
  @IsString()
  @IsNotEmpty()
  rue: string;

  @IsString()
  @IsNotEmpty()
  ville: string;

  @IsString()
  @IsNotEmpty()
  code_postal: string;

  @IsString()
  @IsNotEmpty()
  pays: string;
}

/** Coordonnées géographiques optionnelles */
class CoordonneesDto {
  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;
}

/** Payload complet pour la création d’un dépôt */
export class CreateDepotDto {
  @IsString()
  @IsNotEmpty()
  nom_depot: string;

  @IsString()
  @IsNotEmpty()
  type_depot: string;

  @IsNumber()
  @IsNotEmpty()
  capacite: number;

  @ValidateNested()
  @Type(() => AdresseDto)
  adresse: AdresseDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CoordonneesDto)
  coordonnees?: CoordonneesDto;

  @ValidateNested()
  @Type(() => ResponsableDto)
  responsable: ResponsableDto;
}
