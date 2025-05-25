// back/src/product/dto/create-product.dto.ts
import { IsString, IsNumber, IsArray, IsOptional, ValidateNested, IsEnum } from 'class-validator';
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
  @IsEnum(['normal', 'frigorifique'], { each: true })
  type: string[];

  // images devient optionnel (car géré par upload Multer)
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ValidateNested()
  @Type(() => SpecificationDto)
  specifications: SpecificationDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DisponibiliteDto)
  disponibilite?: DisponibiliteDto[];

  @IsString()
  company_id: string;
}
