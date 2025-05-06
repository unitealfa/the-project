import {
  IsString,
  IsNumber,
  IsDateString,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class SpecificationsDto {
  @IsOptional() @IsString() poids?: string;
  @IsOptional() @IsString() volume?: string;
}

export class CreateProductDto {
  @IsString() nom_product: string;
  @IsNumber() prix_gros: number;
  @IsNumber() prix_detail: number;
  @IsDateString() date_expiration: string;
  @IsNumber() quantite_stock: number;

  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() categorie?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => SpecificationsDto)
  specifications?: SpecificationsDto;
}
