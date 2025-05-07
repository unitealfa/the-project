// BACKEND - DTO pour création de produit
import { IsString, IsNumber, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class SpecificationDto {
  @IsString()
  poids: string;

  @IsString()
  volume: string;
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
  images: string[];

  @ValidateNested()
  @Type(() => SpecificationDto)
  specifications: SpecificationDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DisponibiliteDto)
  disponibilite?: DisponibiliteDto[];
}
