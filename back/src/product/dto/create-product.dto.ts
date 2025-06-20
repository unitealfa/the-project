import { IsString, IsNumber, IsArray, IsOptional, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

class SpecificationDto {
  @IsOptional()
  @IsString()
  poids?: string;

  @IsOptional()
  @IsString()
  volume?: string;
}

class DisponibiliteDto {
  @IsString()
  depot_id: string;

  @IsNumber()
  quantite: number;
}

export class CreateProductDto {
  @IsString()
  nom_product: string;

  @IsNumber()
  prix_gros: number;

  @IsNumber()
  prix_detail: number;

  @IsString()
  description: string;

  @IsString()
  categorie: string;

  @IsArray()
  @IsEnum(['normal', 'frigorifique'], { each: true })
  type: string[];

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => SpecificationDto)
  specifications?: SpecificationDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DisponibiliteDto)
  disponibilite?: DisponibiliteDto[];

  @IsOptional()
  @IsString()
  company_id?: string;
}
