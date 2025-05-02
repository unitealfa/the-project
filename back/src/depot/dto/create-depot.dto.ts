import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ContactDto {
  @IsString() @IsNotEmpty() responsable: string;
  @IsString() @IsNotEmpty() telephone: string;
  @IsString() @IsNotEmpty() email: string;
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

  @ValidateNested() @Type(() => ContactDto)
  contact: ContactDto;

  @ValidateNested() @Type(() => AdresseDto)
  adresse: AdresseDto;

  @IsOptional()
  @ValidateNested() @Type(() => CoordonneesDto)
  coordonnees?: CoordonneesDto;
}
