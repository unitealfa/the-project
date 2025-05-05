import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  ValidateNested,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

class ResponsableDto {
  @IsString() @IsNotEmpty() nom: string;
  @IsString() @IsNotEmpty() prenom: string;
  @IsString() @IsNotEmpty() email: string;
  @IsString() @MinLength(2) password: string;
  @IsString() @IsNotEmpty() num: string;
}

class AdresseDto {
  @IsString() @IsNotEmpty() rue: string;
  @IsString() @IsNotEmpty() ville: string;
  @IsString() @IsNotEmpty() code_postal: string;
  @IsString() @IsNotEmpty() pays: string;
}

class CoordonneesDto {
  @IsNumber() latitude: number;
  @IsNumber() longitude: number;
}

export class CreateDepotDto {
  @IsString() @IsNotEmpty() nom_depot: string;
  @IsString() @IsNotEmpty() type_depot: string;
  @IsNumber() @IsNotEmpty() capacite: number;

  @ValidateNested() @Type(() => AdresseDto)
  adresse: AdresseDto;

  @IsOptional() @ValidateNested() @Type(() => CoordonneesDto)
  coordonnees?: CoordonneesDto;

  @ValidateNested() @Type(() => ResponsableDto)
  responsable: ResponsableDto;
}
