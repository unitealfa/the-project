import { IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class AdresseDTO {
  @IsString() rue: string;
  @IsString() ville: string;
  @IsString() code_postal: string;
  @IsString() pays: string;
}

export class ContactDTO {
  @IsString() telephone: string;
  @IsString() email: string;
  @ValidateNested() @Type(() => AdresseDTO) adresse: AdresseDTO;
}

export class CreateCompanyDto {
  @IsString() nom_company: string;
  @IsString() gerant_company: string;
  @ValidateNested() @Type(() => ContactDTO) contact: ContactDTO;
}